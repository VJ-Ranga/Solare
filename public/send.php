<?php
/**
 * Solare — enquiry form handler.
 *
 * GET  send.php  -> issues a signed form token (and Turnstile site key if enabled)
 * POST send.php  -> validates the enquiry, saves it, emails info@ and the applicant
 *
 * Private files (config, PHPMailer, storage) live in ../private, outside the web root.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');

const PRIVATE_DIR = __DIR__ . '/../private';
const TOKEN_MIN_AGE = 3;      // seconds — humans can't fill the form faster
const TOKEN_MAX_AGE = 7200;   // seconds — token expires after 2 hours

const PROGRAMS = [
    'Engineer / Humanities',
    'Specified Skilled Worker (SSW)',
    'Employment for Skill Development',
    'Not sure — please advise me',
];
const SECTORS = ['', 'Caregiving', 'Food service', 'Manufacturing', 'Construction', 'Agriculture', 'Hospitality', 'IT & Engineering'];
const JLPT    = ['None', 'N5', 'N4 / JFT', 'N3+'];

function respond(int $code, array $body): void
{
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(int $code, string $message, array $extra = []): void
{
    respond($code, ['ok' => false, 'message' => $message] + $extra);
}

function log_error(string $msg): void
{
    @file_put_contents(PRIVATE_DIR . '/storage/error.log', '[' . date('c') . '] ' . $msg . PHP_EOL, FILE_APPEND | LOCK_EX);
}

/* ---------- Config ---------- */
$configFile = PRIVATE_DIR . '/config.php';
if (!is_file($configFile)) {
    fail(500, 'The form is not configured yet. Please contact us on WhatsApp.');
}
$cfg = require $configFile;
if (empty($cfg['secret']) || strlen($cfg['secret']) < 32) {
    log_error('config.php: secret missing or too short');
    fail(500, 'The form is not configured yet. Please contact us on WhatsApp.');
}
$debug = !empty($cfg['debug']);
date_default_timezone_set($cfg['timezone'] ?? 'Asia/Colombo');

/* ---------- Helpers ---------- */
function make_token(string $secret): string
{
    $ts = (string) time();
    return $ts . '.' . hash_hmac('sha256', $ts, $secret);
}

function token_age(string $token, string $secret): ?int
{
    $parts = explode('.', $token, 2);
    if (count($parts) !== 2 || !ctype_digit($parts[0])) {
        return null;
    }
    if (!hash_equals(hash_hmac('sha256', $parts[0], $secret), $parts[1])) {
        return null;
    }
    return time() - (int) $parts[0];
}

/** One line of plain text: no control characters or line breaks (blocks header injection). */
function clean_line(string $v, int $max): string
{
    $v = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v) ?? '';
    return mb_substr(trim(preg_replace('/\s+/u', ' ', $v) ?? ''), 0, $max);
}

/** Multi-line text: keep line breaks, drop other control characters. */
function clean_text(string $v, int $max): string
{
    $v = str_replace(["\r\n", "\r"], "\n", $v);
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/u', '', $v) ?? '';
    return mb_substr(trim($v), 0, $max);
}

function client_ip(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

function origin_allowed(array $allowed): bool
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '' && !empty($_SERVER['HTTP_REFERER'])) {
        $p = parse_url($_SERVER['HTTP_REFERER']);
        $origin = isset($p['scheme'], $p['host']) ? $p['scheme'] . '://' . $p['host'] . (isset($p['port']) ? ':' . $p['port'] : '') : '';
    }
    if ($origin === '') {
        return false;
    }
    $host = parse_url($origin, PHP_URL_HOST);
    $port = parse_url($origin, PHP_URL_PORT);
    $self = $_SERVER['HTTP_HOST'] ?? '';
    if ($host && $self !== '' && strcasecmp($host . ($port ? ':' . $port : ''), $self) === 0) {
        return true;   // same site
    }
    return in_array(rtrim($origin, '/'), $allowed, true);
}

/** Allow $max requests per IP per $window seconds. File-based, safe for shared hosting. */
function rate_limited(int $max, int $window): bool
{
    $dir = PRIVATE_DIR . '/storage/ratelimit';
    if (!is_dir($dir) && !@mkdir($dir, 0750, true)) {
        return false;
    }
    $file = $dir . '/' . hash('sha256', client_ip()) . '.json';
    $fh = @fopen($file, 'c+');
    if (!$fh) {
        return false;
    }
    flock($fh, LOCK_EX);
    $hits = json_decode((string) stream_get_contents($fh), true) ?: [];
    $now = time();
    $hits = array_values(array_filter($hits, function ($t) use ($now, $window) { return $t > $now - $window; }));
    $limited = count($hits) >= $max;
    if (!$limited) {
        $hits[] = $now;
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, json_encode($hits));
    }
    flock($fh, LOCK_UN);
    fclose($fh);
    return $limited;
}

/** Prefix cells that spreadsheet apps would treat as formulas. */
function csv_safe(string $v): string
{
    return preg_match('/^[=+\-@\t\r]/', $v) ? "'" . $v : $v;
}

function save_lead(array $row): bool
{
    $file = PRIVATE_DIR . '/storage/leads.csv';
    $new = !is_file($file);
    $fh = @fopen($file, 'a');
    if (!$fh) {
        return false;
    }
    flock($fh, LOCK_EX);
    if ($new) {
        fputcsv($fh, array_keys($row));
    }
    fputcsv($fh, array_map('csv_safe', array_values($row)));
    flock($fh, LOCK_UN);
    fclose($fh);
    return true;
}

function turnstile_ok(string $secret, string $response): bool
{
    if ($response === '') {
        return false;
    }
    $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query(['secret' => $secret, 'response' => $response, 'remoteip' => client_ip()]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 8,
    ]);
    $res = curl_exec($ch);
    curl_close($ch);
    $data = is_string($res) ? json_decode($res, true) : null;
    return !empty($data['success']);
}

function h(string $v): string
{
    return htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/* ---------- GET: issue token ---------- */
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'GET') {
    respond(200, [
        'ok'        => true,
        'token'     => make_token($cfg['secret']),
        'turnstile' => $cfg['turnstile']['site_key'] ?? '',
    ]);
}
if ($method !== 'POST') {
    header('Allow: GET, POST');
    fail(405, 'Method not allowed.');
}

/* ---------- POST: checks before reading the form ---------- */
if (!origin_allowed($cfg['allowed_origins'] ?? [])) {
    fail(403, 'This form can only be sent from our website.');
}

// Honeypot filled = bot. Pretend success so it doesn't retry.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    respond(200, ['ok' => true]);
}

$age = token_age((string) ($_POST['token'] ?? ''), $cfg['secret']);
if ($age === null || $age > TOKEN_MAX_AGE) {
    fail(400, 'Your session expired. Please refresh the page and try again.', ['refresh' => true]);
}
if ($age < TOKEN_MIN_AGE) {
    fail(400, 'That was very fast — please check your details and send again.');
}

$ts = $cfg['turnstile']['secret_key'] ?? '';
if ($ts !== '' && !turnstile_ok($ts, (string) ($_POST['cf-turnstile-response'] ?? ''))) {
    fail(400, 'Please complete the security check and try again.');
}

$rl = $cfg['rate_limit'] ?? ['max' => 5, 'window' => 3600];
if (rate_limited((int) $rl['max'], (int) $rl['window'])) {
    fail(429, 'Too many requests. Please try again later or contact us on WhatsApp.');
}

/* ---------- Validate fields ---------- */
$in = [
    'name'    => clean_line((string) ($_POST['name'] ?? ''), 80),
    'phone'   => clean_line((string) ($_POST['phone'] ?? ''), 20),
    'email'   => clean_line((string) ($_POST['email'] ?? ''), 120),
    'age'     => clean_line((string) ($_POST['age'] ?? ''), 3),
    'program' => clean_line((string) ($_POST['program'] ?? ''), 60),
    'sector'  => clean_line((string) ($_POST['sector'] ?? ''), 40),
    'jlpt'    => clean_line((string) ($_POST['jlpt'] ?? 'None'), 20),
    'message' => clean_text((string) ($_POST['message'] ?? ''), 1000),
];

$errors = [];
if (mb_strlen($in['name']) < 2) {
    $errors['name'] = 'Please enter your full name.';
}
if (!preg_match('/^(\+94|0)?7\d[\s-]?\d{3}[\s-]?\d{4}$/', $in['phone'])) {
    $errors['phone'] = 'Enter a Sri Lankan mobile number, e.g. 077 123 4567.';
}
if ($in['email'] !== '' && !filter_var($in['email'], FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address.';
}
if (!ctype_digit($in['age']) || (int) $in['age'] < 18 || (int) $in['age'] > 45) {
    $errors['age'] = 'Age must be between 18 and 45.';
}
if (!in_array($in['program'], PROGRAMS, true)) {
    $errors['program'] = 'Please choose a programme.';
}
if (!in_array($in['sector'], SECTORS, true)) {
    $in['sector'] = '';
}
if (!in_array($in['jlpt'], JLPT, true)) {
    $in['jlpt'] = 'None';
}
if (empty($_POST['consent'])) {
    $errors['consent'] = 'Please tick to let us contact you.';
}
if ($errors) {
    fail(422, 'Please check the highlighted fields.', ['errors' => $errors]);
}

/* ---------- Save ---------- */
$lead = [
    'received_at' => date('Y-m-d H:i:s'),
    'name'        => $in['name'],
    'phone'       => $in['phone'],
    'email'       => $in['email'],
    'age'         => $in['age'],
    'program'     => $in['program'],
    'sector'      => $in['sector'] ?: 'Any',
    'jlpt'        => $in['jlpt'],
    'message'     => $in['message'],
    'ip'          => client_ip(),
];
if (!save_lead($lead)) {
    log_error('Could not write storage/leads.csv');
}

/* ---------- Email ---------- */
require PRIVATE_DIR . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

function mailer(array $cfg): PHPMailer
{
    $m = new PHPMailer(true);
    $m->isSMTP();
    $m->Host       = $cfg['smtp']['host'];
    $m->Port       = (int) $cfg['smtp']['port'];
    $m->SMTPAuth   = ($cfg['smtp']['user'] ?? '') !== '';
    $m->Username   = $cfg['smtp']['user'] ?? '';
    $m->Password   = $cfg['smtp']['pass'] ?? '';
    $secure        = $cfg['smtp']['secure'] ?? '';
    $m->SMTPSecure = $secure === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : ($secure === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : '');
    $m->SMTPAutoTLS = $secure !== '';
    $m->CharSet    = PHPMailer::CHARSET_UTF8;
    $m->Timeout    = 15;
    $m->setFrom($cfg['from']['email'], $cfg['from']['name']);
    return $m;
}

$rows = [
    'Name'           => $lead['name'],
    'Mobile'         => $lead['phone'],
    'Email'          => $lead['email'] ?: '—',
    'Age'            => $lead['age'],
    'Programme'      => $lead['program'],
    'Sector'         => $lead['sector'],
    'Japanese level' => $lead['jlpt'],
    'Message'        => $lead['message'] ?: '—',
];
$waNumber = preg_replace('/\D/', '', $lead['phone']);
$waNumber = strpos($waNumber, '94') === 0 ? $waNumber : '94' . ltrim($waNumber, '0');

$htmlRows = '';
$textRows = '';
foreach ($rows as $k => $v) {
    $htmlRows .= '<tr><td style="padding:10px 14px;background:#FDF2F6;font-weight:600;color:#6E1430;width:150px;vertical-align:top">' . h($k) . '</td>'
               . '<td style="padding:10px 14px;color:#282828">' . nl2br(h($v)) . '</td></tr>';
    $textRows .= $k . ': ' . $v . "\n";
}

$adminHtml = '<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto">'
    . '<div style="background:#6E1430;color:#fff;padding:18px 22px;border-radius:10px 10px 0 0">'
    . '<div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#F7C6D6">New website enquiry</div>'
    . '<div style="font-size:20px;font-weight:bold;margin-top:4px">' . h($lead['name']) . ' — ' . h($lead['program']) . '</div></div>'
    . '<table style="width:100%;border-collapse:collapse;border:1px solid #F0DDE4;font-size:14px">' . $htmlRows . '</table>'
    . '<p style="margin:18px 0"><a href="https://wa.me/' . h($waNumber) . '" style="background:#25D366;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:bold">Reply on WhatsApp</a> '
    . '&nbsp;<a href="tel:' . h($lead['phone']) . '" style="color:#D8166A;font-weight:bold">Call ' . h($lead['phone']) . '</a></p>'
    . '<p style="font-size:12px;color:#786B72">Received ' . h($lead['received_at']) . ' via solarejapan.com.lk</p></div>';

try {
    $m = mailer($cfg);
    $m->addAddress($cfg['to']['email'], $cfg['to']['name']);
    if ($lead['email'] !== '') {
        $m->addReplyTo($lead['email'], $lead['name']);
    }
    $m->Subject = 'New enquiry: ' . $lead['name'] . ' — ' . $lead['program'];
    $m->isHTML(true);
    $m->Body    = $adminHtml;
    $m->AltBody = "New website enquiry\n\n" . $textRows . "\nReceived " . $lead['received_at'];
    $m->send();
} catch (MailException $e) {
    log_error('Admin mail failed: ' . $e->getMessage());
    fail(502, 'We saved your request but could not send it right now. Please also message us on WhatsApp.',
        $debug ? ['debug' => $e->getMessage()] : []);
}

/* Auto-reply to the applicant — failure here is logged, not shown */
if (!empty($cfg['autoreply']) && $lead['email'] !== '') {
    // Letters only in the greeting — stops anyone using the auto-reply to send links to strangers
    $first = mb_substr(preg_replace('/[^\p{L}\p{M}\-\']/u', '', explode(' ', $lead['name'])[0]) ?? '', 0, 30) ?: 'there';
    $replyHtml = '<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#282828">'
        . '<div style="background:#6E1430;color:#fff;padding:22px;border-radius:10px 10px 0 0;font-size:20px;font-weight:bold">Thank you, ' . h($first) . '!</div>'
        . '<div style="padding:22px;border:1px solid #F0DDE4;border-top:0;border-radius:0 0 10px 10px;line-height:1.6">'
        . '<p>We have received your request for a free consultation about <b>' . h($lead['program']) . '</b> in Japan.</p>'
        . '<p>A Solare advisor will contact you on <b>' . h($lead['phone']) . '</b> within one working day.</p>'
        . '<p>If you have questions, just reply to this email.</p>'
        . '<p style="margin-top:24px">Solare Foreign Employment (Pvt) Ltd<br><span style="color:#786B72">People beyond borders</span></p></div></div>';
    try {
        $r = mailer($cfg);
        $r->addAddress($lead['email']);
        $r->addReplyTo($cfg['reply_to']['email'], $cfg['reply_to']['name']);
        $r->Subject = 'We received your request — Solare Foreign Employment';
        $r->isHTML(true);
        $r->Body    = $replyHtml;
        $r->AltBody = "Thank you, $first!\n\nWe have received your request about {$lead['program']} in Japan. "
                    . "A Solare advisor will contact you on {$lead['phone']} within one working day.\n\n"
                    . "Solare Foreign Employment (Pvt) Ltd";
        $r->send();
    } catch (MailException $e) {
        log_error('Auto-reply failed: ' . $e->getMessage());
    }
}

respond(200, ['ok' => true]);
