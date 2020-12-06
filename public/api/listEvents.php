<?php

include 'util.php';

authenticate_user();

// Ensure the request is sent via a GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error(400, 'Invalid request method');
}

$onlyActive = filter_input(INPUT_GET, 'onlyActive', FILTER_VALIDATE_BOOLEAN);
// User ID to check for event registrations
$registrant_id = filter_input(INPUT_GET, 'registrant_id');

// Connect to the MySQL server
$db_user = getenv('DB_USER');
$db_pass = getenv('DB_PASS');
$mysqli = new mysqli('localhost', $db_user, $db_pass, 'event_portal');
if ($mysqli->connect_errno) {
    error(500, 'Failed to connect to database');
}

// Get the event row by id
$query = 'SELECT * FROM `events` ORDER BY `start_time`';
if ($onlyActive && $registrant_id) {
    // Beautiful majestic query that I crafted to handle this situation (it took me like 5 hours to figure this out)
    $query = 'SELECT E.*, IF( EXISTS( SELECT * FROM `registrations` AS R WHERE R.`event_id` = E.event_id AND R.user_id = ? ), 1, 0 ) AS `registered` FROM (SELECT * FROM `events` WHERE (`start_time` <= NOW()) AND (`end_time` > NOW())) AS E ORDER BY E.`start_time` ASC';
} else if ($registrant_id) {
    // The same as above except without the active constraint
    $query = 'SELECT E.*, IF( EXISTS( SELECT * FROM `registrations` AS R WHERE R.`event_id` = E.`event_id` AND R.`user_id` = ? ), 1, 0 ) AS `registered` FROM (SELECT * FROM `events`) AS E ORDER BY E.`start_time` ASC';
}

if (!($stmt = $mysqli->prepare($query))) {
    error(500, 'Failed to prepare query');
}

if ($registrant_id) {
    $stmt->bind_param('i', $registrant_id);
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
