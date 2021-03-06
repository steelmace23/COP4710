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

// Hash password
$password_hashed = password_hash($password, PASSWORD_BCRYPT);

// Prepare an insert user statement
$query = 'INSERT INTO `users` (`user_id`, `username`, `password_hash`, `is_superadmin`) VALUES (NULL, ?, ?, 0);';
if (!($stmt = $mysqli->prepare($query))) {
    error(500, 'Failed to prepare query');
}

$stmt->bind_param('ss', $username, $password_hashed);
$success = $stmt->execute();

// Insertion failed
if (!$success) {
    // Duplicate row (MySQL error 1062)
    if ($stmt->errno == 1062) {
        error(409, 'That username is already taken');
    } 
    error(500, 'Failed to create user');
}

$new_user = [
    'user_id' => $mysqli->insert_id,
    'username' => $username,
    'is_superadmin' => false,
];

$response = [
    'message' => 'Account created successfully',
    'user' => $new_user
];

header('Content-Type: application/json');
echo json_encode($response);

$stmt->close();
