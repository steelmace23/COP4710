<?php

include 'util.php';

authenticate_user();
   
// Ensure the request is sent via a GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error(400, 'Invalid request method');
}

$city = filter_input(INPUT_GET, 'city');
$onlyActive = filter_input(INPUT_GET, 'onlyActive', FILTER_VALIDATE_BOOLEAN);
// User ID to check for event registrations
$registrant_id = filter_input(INPUT_GET, 'registrant_id');

// Validate inputs
if (!$city) {
    error(400, 'Invalid request parameters: city required');
}

// Connect to the MySQL server
$db_user = getenv('DB_USER');
$db_pass = getenv('DB_PASS');
$mysqli = new mysqli('localhost', $db_user, $db_pass, 'event_portal');
if ($mysqli->connect_errno) {
    error(500, 'Failed to connect to database');
}

// Build the query
if ($onlyActive && $registrant_id) {
    $query = 'SELECT E.*, IF( EXISTS( SELECT * FROM `registrations` AS R WHERE R.`event_id` = E.`event_id` AND R.`user_id` = ? ), 1, 0 ) AS `registered` FROM (SELECT * FROM `events` WHERE `city` LIKE ? AND (`start_time` <= NOW()) AND `end_time` > NOW()) AS E ORDER BY E.`start_time` ASC;';
} else {    
    $query = 'SELECT * FROM `events` WHERE `city` LIKE ? ORDER BY `start_time`;';
}

// Prepare the query
if (!($stmt = $mysqli->prepare($query))) {
    error(500, 'Failed to prepare query');
}

if ($onlyActive && $registrant_id) {
    $stmt->bind_param('is', $registrant_id, $city);
} else {    
    $stmt->bind_param('s', $city);
}

$success = $stmt->execute();
if (!$success) {
    error(500, 'Error querying database for events');
}

$result = $stmt->get_result();
$rows = $result->fetch_all(MYSQLI_ASSOC);

$response = [ 'events' => $rows ];

header('Content-Type: application/json');
echo json_encode($response);

$stmt->close();
