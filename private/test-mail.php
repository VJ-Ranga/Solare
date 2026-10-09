<?php
/**
 * Send one test email with the settings in config.php.
 * Run on the server:  php private/test-mail.php you@example.com
 */
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }

require __DIR__ . '/vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

$cfg = require __DIR__ . '/config.php';
$to  = $argv[1] ?? $cfg['to']['email'];

$m = new PHPMailer(true);
$m->isSMTP();
$m->SMTPDebug  = SMTP::DEBUG_SERVER;     // prints the SMTP conversation
$m->Host       = $cfg['smtp']['host'];
$m->Port       = (int) $cfg['smtp']['port'];
$m->SMTPAuth   = $cfg['smtp']['user'] !== '';
$m->Username   = $cfg['smtp']['user'];
$m->Password   = $cfg['smtp']['pass'];
$m->SMTPSecure = $cfg['smtp']['secure'] === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : ($cfg['smtp']['secure'] === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : '');
$m->CharSet    = PHPMailer::CHARSET_UTF8;
$m->setFrom($cfg['from']['email'], $cfg['from']['name']);
$m->addAddress($to);
$m->Subject = 'Solare website — SMTP test';
$m->Body    = 'If you can read this, the website can send email. Sent ' . date('c');

try {
    $m->send();
    echo "\nOK — test email sent to $to\n";
} catch (Throwable $e) {
    echo "\nFAILED: " . $m->ErrorInfo . "\n";
    exit(1);
}
