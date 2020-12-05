<?php

// Utility function to return a json response
// containing an error message and appropriate
// HTTP response code.
function error($code, $message) {
    http_response_code($code);	
    $response = [ 'error' => $message ];
    header('Content-Type: application/json');
    exit(json_encode($response));
}

// Very pedantic function that attempts to validate and authenticate the 
// request with HTTP basic authentication.
function authenticate_user() {
    // Support CORS preflight requests by exiting successfully on OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {    
        header('Access-Control-Allow-Headers: Authorization');
        exit(204);    
    }  

    // Access the request headers
    if (!apache_request_headers()) {
        error(500, 'Could not access request headers');
    }
    
    // Fix the header case
    $headers = array_change_key_case(apache_request_headers());

    $auth_header = $headers['authorization'];
    
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
