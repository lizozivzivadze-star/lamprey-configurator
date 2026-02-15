<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$sql = "SELECT 
    id,
    name,
    description,
    max_power_draw_kw,
    max_payload_weight_kg,
    max_payload_volume_l,
    typical_duration_hours
FROM missions
ORDER BY name";

$result = executeQuery($sql);

if ($result['success']) {
    echo json_encode([
        'success' => true,
        'missions' => $result['data']
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $result['error']
    ]);
}
?>