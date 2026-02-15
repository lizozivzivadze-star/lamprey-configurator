<?php
// Database configuration for PostgreSQL on Render
// Get database URL from environment variable
$database_url = getenv('DATABASE_URL');

if ($database_url) {
    // Parse DATABASE_URL from Render
    $db_parts = parse_url($database_url);
    define('DB_HOST', $db_parts['host']);
    define('DB_USER', $db_parts['user']);
    define('DB_PASS', $db_parts['pass']);
    define('DB_NAME', ltrim($db_parts['path'], '/'));
    define('DB_PORT', $db_parts['port'] ?? 5432);
} else {
    // Local development fallback
    define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
    define('DB_USER', getenv('DB_USER') ?: 'root');
    define('DB_PASS', getenv('DB_PASS') ?: '1234');
    define('DB_NAME', getenv('DB_NAME') ?: 'lamprey_config');
    define('DB_PORT', getenv('DB_PORT') ?: 5432);
}

// Create PostgreSQL connection
function getDBConnection() {
    $conn_string = sprintf(
        "host=%s port=%s dbname=%s user=%s password=%s",
        DB_HOST,
        DB_PORT,
        DB_NAME,
        DB_USER,
        DB_PASS
    );
    
    $conn = pg_connect($conn_string);
    
    if (!$conn) {
        die(json_encode([
            'success' => false,
            'error' => 'Database connection failed'
        ]));
    }
    
    return $conn;
}

// Helper function to execute queries safely
function executeQuery($sql, $params = []) {
    $conn = getDBConnection();
    
    if (empty($params)) {
        $result = pg_query($conn, $sql);
    } else {
        $result = pg_query_params($conn, $sql, $params);
    }
    
    if ($result === false) {
        return ['success' => false, 'error' => pg_last_error($conn)];
    }
    
    $data = [];
    while ($row = pg_fetch_assoc($result)) {
        $data[] = $row;
    }
    
    pg_close($conn);
    
    return ['success' => true, 'data' => $data];
}
?>