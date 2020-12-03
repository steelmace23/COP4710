<?php

include 'util.php';

authenticate_user();

// Ensure the request is sent via a GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error(400, 'Invalid request method');
}

$start = filter_input(INPUT_GET, 'start');
$end = filter_input(INPUT_GET, 'end');

// Attempt to create dates and validate them
$start_date = DateTimeImmutable::createFromFormat('Y-m-d', $start);
if (!$start_date) {
    error(400, 'Invalid start date format: YYYY-MM-DD required');
}
$end_date = DateTimeImmutable::createFromFormat('Y-m-d', $end);
if (!$end_date) {
    error(400, 'Invalid end date format: YYYY-MM-DD required');
}

// Connect to the MySQL server
$db_user = getenv('DB_USER');
$db_pass = getenv('DB_PASS');
$mysqli = new mysqli('localhost', $db_user, $db_pass, 'event_portal');
if ($mysqli->connect_errno) {
    error(500, 'Failed to connect to database');
}
// Create an sql form to send to databse
$query = 'SELECT * FROM `events` WHERE `start_time` >= ? AND `end_time` <= ? ORDER BY `start_time`';
if (!($stmt = $mysqli->prepare($query))) {
    error(500, 'Failed to prepare query');
}

$start_date_string = $start_date->format('Y-m-d');
$end_date_string = $end_date->format('Y-m-d');

$stmt->bind_param('ss', $start_date_string, $end_date_string);
$success = $stmt->execute();
if (!$success) {
    error(500, 'Error querying database for given event id');
}
    
$result = $stmt->get_result();
$rows = $result->fetch_all(MYSQLI_ASSOC);

$response = [ 'events' => $rows ];

header('Content-Type: application/json');
echo json_encode($response);
