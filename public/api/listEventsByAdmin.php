<?php

include 'util.php';

authenticate_user();
   
// Ensure the request is sent via a GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error(400, 'Invalid request method');
}

// Filter possible inputs
$username = filter_input(INPUT_GET, 'username');
$user_id = filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);
$onlyActive = filter_input(INPUT_GET, 'onlyActive', FILTER_FILTER_VALIDATE_BOOLEAN);

// Validate inputs
if (!$username && !$user_id) {
    error(400, 'Invalid request parameters: one of username or user_id required');
}

// Connect to the MySQL server
$db_user = getenv('DB_USER');
$db_pass = getenv('DB_PASS');
$mysqli = new mysqli('localhost', $db_user, $db_pass, 'event_portal');
if ($mysqli->connect_errno) {
    error(500, 'Failed to connect to database');
}

// If given the username, resolve it to the user_id
if ($username) {
    $user_id = getUserIdFromDB($mysqli, $username); 
}

// Build the query
$query = 'SELECT * FROM `events` WHERE `admin_id` = ?';

if ($onlyActive) {
    $query = $query . ' AND `start_time` <= NOW() AND `end_time` > NOW()';
}

$query = $query . ' ORDER BY `start_time`';

// Prepare the query
if (!($stmt = $mysqli->prepare($query))) {
    error(500, 'Failed to prepare query');
}

// Bind parameter before execution
$stmt->bind_param('i', $user_id);

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


function getUserIdFromDB($mysqli, $username) {
    // Get the user row by username
    $query = 'SELECT `user_id` FROM `users` WHERE `username` = ?';
    if (!($stmt = $mysqli->prepare($query))) {
        error(500, 'Failed to prepare query');
    }

    $stmt->bind_param('s', $username);
    $success = $stmt->execute();
    if (!$success) {
        error(500, 'Error querying database for given user');
    }

    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        error(404, 'No user with given username found');
    }

    return $result->fetch_assoc()['user_id'];
}
