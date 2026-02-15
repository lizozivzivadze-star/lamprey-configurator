<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');  // Default XAMPP username
define('DB_PASS', '1234');       // Default XAMPP password 
define('DB_NAME', 'lamprey_config');

// Create connection
function getDBConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        die(json_encode([
            'success' => false,
            'error' => 'Database connection failed: ' . $conn->connect_error
        ]));
    }
    
    $conn->set_charset('utf8mb4');
    return $conn;
}

// Helper function to execute queries safely
function executeQuery($sql, $params = [], $types = '') {
    $conn = getDBConnection();
    $stmt = $conn->prepare($sql);
    
    if ($stmt === false) {
        return ['success' => false, 'error' => $conn->error];
    }
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $data = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }
    
    $stmt->close();
    $conn->close();
    
    return ['success' => true, 'data' => $data];
}
?>
