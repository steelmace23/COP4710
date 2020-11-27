<?php

// Utility function to return a json response
// containing an error message and appropriate
// HTTP response code.
function error($code, $message) {
    http_response_code($code);	
    $response = [ 'error' => $message ];
    exit(json_encode($response));
}

// Very pedantic function that attempts to validate and authenticate the 
// request with HTTP basic authentication.
function authenticate_user() {
    // Access the request headers
    if (!apache_request_headers()) {
        error(500, 'Could not access request headers');
    }
    
    $auth_header = apache_request_headers()['Authorization'];
    // Header doesn't begin with 'Basic '
    if (substr($auth_header, 0, 6) !== 'Basic ') {
        error(400, 'Invalid HTTP Authorization header format. Basic type required');
    }

    $encoded_credentials = substr($auth_header, 6);
    if (strlen($encoded_credentials) === 0) {
        error(401, 'No credential was provided for authorization');
    }
    
    $decoded_credentials = base64_decode($encoded_credentials);
    if (!$decoded_credentials) {
        error(400, 'Credential could not be base64 decoded');
    }
    
    $credentials = explode(':', $decoded_credentials);
    if (count($credentials) !== 2) {
        error(400, 'Credential parts must be delimited by a colon');
    }

    $username = $credentials[0];
    $password = $credentials[1];

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
        error(401, 'Invalid credentials');
    }

    $user_row = $result->fetch_array();

    // Verify the password
    if (!password_verify($password, $user_row['password_hash'])) {
        error(401, 'Invalid credentials');
    }
}

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

echo json_encode($response);

$stmt->close();
