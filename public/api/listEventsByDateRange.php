<?php

include 'util.php';

authenticate_user();

// Ensure the request is sent via a GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error(400, 'Invalid request method');
}

// change 'start' and 'end' if query input is modified
$start_time = filter_input(INPUT_GET, 'start');
$end_time = filter_input(INPUT_GET, 'end');

// Connect to the MySQL server
$db_user = getenv('DB_USER');
$db_pass = getenv('DB_PASS');
$conn = new mysqli('localhost', $db_user, $db_pass, 'event_portal');

if ($mysqli->connect_errno) {
    error(500, 'Failed to connect to database');
}
else
{
    // Create an sql form to send to databse
    $sql = "select * from `events`" ;

    // UserID is required in order to search the current user's contacts
    if ($start_time != '' && $end_time != '') 
    {
        $tempStart = strtotime($start_time);
        $start = date('Y-m-d',$tempStart);
        $tempEnd = strtotime($end_time);
        $end = date('Y-m-d',$tempEnd);
        
        // SELECT * FROM `events` WHERE (`start_time` <= '2020-11-29') and (`end_time` >= '2020-11-29')
        $sql .= " where (`start_time` >= '$start') and (`end_time` <= '$end')";
    }
    else 
    {
        returnWithError('NO EVENTS');
    }       
        
    $result = $conn->query($sql);       
        
    if ($result->num_rows > 0)
    {        
        $searchResults = array();

        while($row = $result->fetch_assoc())
        {
            $searchResults[] = $row;
        }
        
        returnWithInfo( $searchResults );
    }
    else
    {
        returnWithError( "NO DATA FOUND" );
    }
    $conn->close();  
}

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson( $obj )
{
    echo json_encode($obj);
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

function returnWithInfo( $searchResults )
{
    sendResultInfoAsJson( $searchResults );
}
