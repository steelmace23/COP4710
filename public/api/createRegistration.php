<?php

include 'util.php';

authenticate_user();

// Ensure the request is sent via a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error(400, 'Invalid request method');
}

$inData = getRequestInfo();

$user_id = filter_var($inData['user_id'], FILTER_VALIDATE_INT);
$event_id = filter_input($inData['event_id'], FILTER_VALIDATE_INT);

// Validate input
if (!$user_id || !$event_id) {
    error(400, 'Invalid input format');
}

$db_user = getenv('DB_USER');
$db_pass = getenv('DB_PASS');
$conn = new mysqli('localhost', $db_user, $db_pass, 'event_portal');
if ($conn->connect_error) 
{
    error(500, $conn->connect_error);
} 
// If any of the fields are missing bail
if ($user_id == '' || $event_id == '')
{
    error(400, 'Invalid request body');
}

// Create sql form to add new user
$sql = "insert into `registrations` (user_id, event_id) 
VALUES ($user_id, $event_id)";
if($result = $conn->query($sql) != TRUE)
{
    error(500, $conn->error);
}
else 
{
    returnWithSuccess('Registration successful');
}
$conn->close();

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson( $obj )
{
    header('Content-type: application/json');
    echo $obj;
}

function returnWithSuccess( $success )
{
    $retValue = '{"success":"' . $success . '"}';
    sendResultInfoAsJson( $retValue );
}
