<?php

include 'util.php';

authenticate_user();

// Ensure the request is sent via a GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error(400, 'Invalid request method');
}

$event_id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

// Validate input
if (!$event_id) {
    error(400, 'Invalid input: id required');
}

// Connect to the MySQL server
$db_user = getenv('DB_USER');
$db_pass = getenv('DB_PASS');
$mysqli = new mysqli('localhost', $db_user, $db_pass, 'event_portal');
if ($mysqli->connect_errno) {
    error(500, 'Failed to connect to database');
}

// Get the event row by id
$query = 'SELECT * FROM `events` WHERE `event_id` = ?';
if (!($stmt = $mysqli->prepare($query))) {
    error(500, 'Failed to prepare query');
}

$stmt->bind_param('i', $event_id);
$success = $stmt->execute();
if (!$success) {
    error(500, 'Error querying database for given event id');
}

// No event with given id
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    error(404, 'No event with given id');
}

$event_row = $result->fetch_object();

$response = [ 'event' => $event_row ];

header('Content-Type: application/json');
echo json_encode($response);

$stmt->close();
