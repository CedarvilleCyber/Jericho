<?php
session_start();

// Auth guard
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Unauthenticated']);
    exit;
}

// POST only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

header('Content-Type: application/json');

$body = file_get_contents('php://input');
$data = json_decode($body, true);

if (!$data || !isset($data['action'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid request body']);
    exit;
}

$action = $data['action'];

// ── Validate payload ──────────────────────────────────────────────────────────

$valid_modes  = ['normal', 'blink_red', 'off'];
$valid_states = ['red', 'yellow', 'green', 'off'];
$valid_ints   = ['INT-01', 'INT-02', 'INT-03', 'INT-04'];
$valid_dirs   = ['NS', 'EW'];

if ($action === 'mode') {
    if (!isset($data['mode']) || !in_array($data['mode'], $valid_modes, true)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid mode']);
        exit;
    }
    $payload = ['action' => 'mode', 'mode' => $data['mode']];

} elseif ($action === 'set_light') {
    if (!isset($data['intersection'], $data['direction'], $data['state'])
        || !in_array($data['intersection'], $valid_ints, true)
        || !in_array($data['direction'],   $valid_dirs, true)
        || !in_array($data['state'],       $valid_states, true)
    ) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid light parameters']);
        exit;
    }
    $payload = [
        'action'       => 'set_light',
        'intersection' => $data['intersection'],
        'direction'    => $data['direction'],
        'state'        => $data['state'],
    ];

} else {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Unknown action']);
    exit;
}

// ── Pi API Integration (stub) ─────────────────────────────────────────────────
// Replace TRAFFIC_API_URL with the Pi endpoint once the API docs are available.
//
// define('TRAFFIC_API_URL', 'http://<PI_IP>:8000/lights');
//
// $ch = curl_init(TRAFFIC_API_URL);
// curl_setopt($ch, CURLOPT_POST,        true);
// curl_setopt($ch, CURLOPT_POSTFIELDS,  json_encode($payload));
// curl_setopt($ch, CURLOPT_HTTPHEADER,  ['Content-Type: application/json']);
// curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// curl_setopt($ch, CURLOPT_TIMEOUT,     5);
// $result   = curl_exec($ch);
// $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
// curl_close($ch);
//
// if ($result === false || $httpCode !== 200) {
//     http_response_code(502);
//     echo json_encode(['ok' => false, 'error' => 'Pi API unreachable']);
//     exit;
// }
// echo $result;   // proxy Pi response directly
// exit;
// ─────────────────────────────────────────────────────────────────────────────

// Stub response until real Pi API is wired in
echo json_encode([
    'ok'        => true,
    'simulated' => true,
    'payload'   => $payload,
]);
