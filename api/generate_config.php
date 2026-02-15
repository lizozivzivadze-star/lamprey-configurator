<?php
header('Content-Type: application/json');
require_once '../config/database.php';

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

$mission_id = isset($input['mission_id']) ? intval($input['mission_id']) : 0;
$payload_ids = isset($input['payload_ids']) ? $input['payload_ids'] : [];

if ($mission_id <= 0 || empty($payload_ids)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid mission_id or no payloads selected'
    ]);
    exit;
}

// Get mission details
$mission_sql = "SELECT * FROM missions WHERE id = ?";
$mission_result = executeQuery($mission_sql, [$mission_id], 'i');

if (empty($mission_result['data'])) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'Mission not found'
    ]);
    exit;
}

$mission = $mission_result['data'][0];

// Get selected payloads
$placeholders = implode(',', array_fill(0, count($payload_ids), '?'));
$types = str_repeat('i', count($payload_ids));

$payload_sql = "SELECT 
    p.*,
    i.name as interface_name,
    cr.priority_rank,
    cr.notes
FROM payloads p
LEFT JOIN interfaces i ON p.interface_id = i.id
LEFT JOIN compatibility_rules cr ON p.id = cr.payload_id AND cr.mission_id = ?
WHERE p.id IN ($placeholders)
ORDER BY p.name";

$params = array_merge([$mission_id], $payload_ids);
$types = 'i' . $types;

$payload_result = executeQuery($payload_sql, $params, $types);

if (!$payload_result['success']) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch payload details'
    ]);
    exit;
}

$payloads = $payload_result['data'];

// Calculate totals
$total_weight = 0;
$total_power = 0;
$total_volume = 0;

foreach ($payloads as $payload) {
    $total_weight += floatval($payload['weight_kg']);
    $total_power += floatval($payload['power_draw_kw']);
    $total_volume += floatval($payload['volume_l']);
}

// Check constraints
$warnings = [];
if ($total_weight > $mission['max_payload_weight_kg']) {
    $warnings[] = "Total weight ({$total_weight} kg) EXCEEDS mission limit ({$mission['max_payload_weight_kg']} kg)";
}
if ($total_power > $mission['max_power_draw_kw']) {
    $warnings[] = "Total power draw ({$total_power} kW) EXCEEDS mission limit ({$mission['max_power_draw_kw']} kW)";
}
if ($total_volume > $mission['max_payload_volume_l']) {
    $warnings[] = "Total volume ({$total_volume} L) EXCEEDS mission capacity ({$mission['max_payload_volume_l']} L)";
}

// Generate configuration
$config = [
    'success' => true,
    'config_id' => 'LAMP-' . date('YmdHis') . '-' . substr(md5(json_encode($payload_ids)), 0, 6),
    'timestamp' => date('Y-m-d H:i:s'),
    'mission' => $mission,
    'payloads' => $payloads,
    'totals' => [
        'weight_kg' => round($total_weight, 2),
        'power_draw_kw' => round($total_power, 2),
        'volume_l' => round($total_volume, 2)
    ],
    'utilization' => [
        'weight_percent' => round(($total_weight / $mission['max_payload_weight_kg']) * 100, 1),
        'power_percent' => round(($total_power / $mission['max_power_draw_kw']) * 100, 1),
        'volume_percent' => round(($total_volume / $mission['max_payload_volume_l']) * 100, 1)
    ],
    'status' => empty($warnings) ? 'VALID' : 'WARNING',
    'warnings' => $warnings
];

echo json_encode($config);
?>
