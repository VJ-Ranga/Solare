<?php
/**
 * Solare website — private configuration.
 *
 * Copy this file to config.php (same folder) on each server and fill in the values.
 * config.php is never committed to git.
 */
return [
    // Outgoing mail (SMTP) — the "web@" mailbox sends every email
    'smtp' => [
        'host'   => 'mail.solarejapan.com.lk', // or the server hostname, e.g. server1.example.com
        'port'   => 465,                       // 465 = SSL, 587 = STARTTLS
        'secure' => 'ssl',                     // 'ssl' for 465, 'tls' for 587
        'user'   => 'web@solarejapan.com.lk',
        'pass'   => '',                        // mailbox password — set on the server only
    ],

    'from'     => ['email' => 'web@solarejapan.com.lk',  'name' => 'Solare Website'],
    'to'       => ['email' => 'info@solarejapan.com.lk', 'name' => 'Solare Enquiries'],
    'reply_to' => ['email' => 'info@solarejapan.com.lk', 'name' => 'Solare Foreign Employment'],

    // Send a "we received your request" email to the applicant (only if they gave an email)
    'autoreply' => true,

    // Long random string — generate with:  php -r "echo bin2hex(random_bytes(32));"
    'secret' => '',

    // Sites allowed to post the form (scheme + host, no trailing slash)
    'allowed_origins' => [
        'https://solarejapan.com.lk',
        'https://www.solarejapan.com.lk',
    ],

    // Max enquiries per visitor IP within the window (seconds)
    'rate_limit' => ['max' => 5, 'window' => 3600],

    // Optional Cloudflare Turnstile — leave both empty to disable
    'turnstile' => ['site_key' => '', 'secret_key' => ''],

    'timezone' => 'Asia/Colombo',

    // Set true only while testing locally — returns error details in the response
    'debug' => false,
];
