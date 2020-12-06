<?php

include 'util.php';

authenticate_user();

// Ensure the request is sent via a GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error(400, 'Invalid request method');
}

$start = filter_input(INPUT_GET, 'start');
$end = filter_input(INPUT_GET, 'end');
// User ID to check for event registrations
$registrant_id = filter_input(INPUT_GET, 'registrant_id');

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
if ($registrant_id) {
    $query = 'SELECT E.*, IF( EXISTS( SELECT * FROM `registrations` AS R WHERE R.`event_id` = E.`event_id` AND R.`user_id` = ? ), 1, 0 ) AS `registered` FROM (SELECT * FROM `events` WHERE DATE(`start_time`) >= ? AND DATE(`end_time`) <= ?) AS E ORDER BY E.`start_time` ASC;';
} else {
    $query = 'SELECT * FROM `events` WHERE DATE(`start_time`) >= ? AND DATE(`end_time`) <= ? ORDER BY `start_time`';
}
if (!($stmt = $mysqli->prepare($query))) {
    error(500, 'Failed to prepare query');
}

$start_date_string = $start_date->format('Y-m-d');
$end_date_string = $end_date->format('Y-m-d');

if ($registrant_id) {
    $stmt->bind_param('iss', $registrant_id, $start_date_string, $end_date_string);
} else {
    $stmt->bind_param('ss', $start_date_string, $end_date_string);
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
