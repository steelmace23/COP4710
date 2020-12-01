<?php

include 'util.php';

authenticate_user();

// Ensure the request is sent via a GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error(400, 'Invalid request method');
}

// Connect to the MySQL server
$db_user = getenv('DB_USER');
$db_pass = getenv('DB_PASS');
$mysqli = new mysqli('localhost', $db_user, $db_pass, 'event_portal');
if ($mysqli->connect_errno) {
    error(500, 'Failed to connect to database');
}

// Get the event row by id
$query = 'SELECT * FROM `events` ORDER BY `start_time`';
if (!($stmt = $mysqli->prepare($query))) {
    error(500, 'Failed to prepare query');
}

$success = $stmt->execute();
if (!$success) {
    error(500, 'Error querying database for given event id');
}

$result = $stmt->get_result();
$rows = $result->fetch_all(MYSQLI_ASSOC);

$response = [ 'events' => $rows ];

header('Content-Type: application/json');
echo json_encode($response);

$stmt->close();
