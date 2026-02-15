<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$mission_id = isset($_GET['mission_id']) ? intval($_GET['mission_id']) : 0;

if ($mission_id <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid mission_id parameter'
    ]);
    exit;
}

// Get mission constraints
$mission_sql = "SELECT * FROM missions WHERE id = $1";
$mission_result = executeQuery($mission_sql, [$mission_id]);

if (empty($mission_result['data'])) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'Mission not found'
    ]);
    exit;
}

$mission = $mission_result['data'][0];

// Get compatible payloads with interface information
$payload_sql = "SELECT 
    p.id,
    p.name,
    p.type,
    p.weight_kg,
    p.power_draw_kw,
    p.dimensions_lxwxh_cm,
    p.volume_l,
    p.description,
    p.manufacturer,
    i.name as interface_name,
    cr.priority_rank,
    cr.notes,
    CASE 
        WHEN p.weight_kg <= $1 AND p.power_draw_kw <= $2 AND p.volume_l <= $3 THEN 'Compatible'
        WHEN p.weight_kg > $4 THEN 'Exceeds weight limit'
        WHEN p.power_draw_kw > $5 THEN 'Exceeds power budget'
        WHEN p.volume_l > $6 THEN 'Exceeds volume capacity'
        ELSE 'Unknown incompatibility'
    END as compatibility_status
FROM payloads p
INNER JOIN compatibility_rules cr ON p.id = cr.payload_id
LEFT JOIN interfaces i ON p.interface_id = i.id
WHERE cr.mission_id = $7
ORDER BY cr.priority_rank ASC, p.name ASC";

$payload_result = executeQuery(
    $payload_sql, 
    [
        $mission['max_payload_weight_kg'],
        $mission['max_power_draw_kw'],
        $mission['max_payload_volume_l'],
        $mission['max_payload_weight_kg'],
        $mission['max_power_draw_kw'],
        $mission['max_payload_volume_l'],
        $mission_id
    ]
);

if ($payload_result['success']) {
    echo json_encode([
        'success' => true,
        'mission' => $mission,
        'payloads' => $payload_result['data']
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $payload_result['error']
    ]);
}
?>