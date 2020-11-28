<?php

include 'util.php';

// Ensure the request is sent via a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error(400, 'Invalid request method');
}

// Decode the JSON request body
$data = json_decode(file_get_contents('php://input'));

// Validate input
if (!$data || !($data->username) || !($data->password)) {
    error(400, 'Malformed input: username and password required');
}

// Pull out the variables from the data
$username = $data->username;
$password = $data->password;

// Connect to the MySQL server
$db_user = getenv('DB_USER');
$db_pass = getenv('DB_PASS');
$mysqli = new mysqli('localhost', $db_user, $db_pass, 'event_portal');

if ($mysqli->connect_errno) {
    error(500, 'Failed to connect to database');
}

// Get the user row by username
$query = 'SELECT * FROM `users` WHERE `username` = ?';
if (!($stmt = $mysqli->prepare($query))) {
    error(500, 'Failed to prepare query');
}

$stmt->bind_param('s', $username);
$success = $stmt->execute();
if (!$success) {
    error(500, 'Error querying database for given user');
}

// No user with given username found
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    error(401, 'Invalid username or password');
}

$user_row = $result->fetch_array();

// Verify the password
if (!password_verify($password, $user_row['password_hash'])) {
    error(401, 'Invalid username or password');
}

// Send the user their user object
$user = [
    'user_id' => $user_row['user_id'],
    'username' => $user_row['username'],
    'is_superadmin' => ($user_row['is_superadmin'] === 0 ? false : true),
];

$response = [ 'user' => $user ];

header('Content-Type: application/json');
echo json_encode($response);

$stmt->close();
