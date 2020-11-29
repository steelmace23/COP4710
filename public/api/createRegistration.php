<?php

include 'util.php';

authenticate_user();

// Ensure the request is sent via a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error(400, 'Invalid request method');
}

$inData = getRequestInfo();

$user_id = $inData["user_id"];
$event_id = $inData["event_id"];

$db_user = getenv('DB_USER');
$db_pass = getenv('DB_PASS');
$conn = new mysqli('localhost', $db_user, $db_pass, 'event_portal');
if ($conn->connect_error) 
{
    returnWithError( $conn->connect_error );
} 
// If any of the fields are missing bail
if ($user_id == '' || $event_id == '')
{
    returnWithError('INCOMPLETE DATA');
}
else
{
    // Create sql form to add new user
    $sql = "insert into `registrations` (user_id, event_id) 
    VALUES ($user_id, $event_id)";
    if( $result = $conn->query($sql) != TRUE )
    {
        returnWithError( $conn->error );
    }
    else 
    {
        returnWithSuccess('CREATED');
    }
    $conn->close();
}

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

function returnWithError( $err )
{
    $retValue = '{"error":"' . $err . '"}';
    sendResultInfoAsJson( $retValue );
}