<?php

include 'util.php';

authenticate_user();
   
// Ensure the request is sent via a GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error(400, 'Invalid request method');
}

$username = filter_input(INPUT_GET, 'username');

$db_user = getenv('DB_USER');
$db_pass = getenv('DB_PASS');
$conn = new mysqli('localhost', $db_user, $db_pass, 'event_portal');
if ($conn->connect_error) 
{
    returnWithError( $conn->connect_error );
} 
else
{
    // Create an sql form to send to databse
    $sql = "select * from `users`" ;

    // UserID is required in order to search the current user's contacts
    if ($username != '') 
    {
        $sql .= "where `username` like '$username'";
    }
    else 
    {
        returnWithError('NO USERNAME');
    }       
        
    $users = $conn->query($sql);       

    if ($users->num_rows > 0)
    {
        $row = $users->fetch_assoc();
        $user_id = $row["user_id"];

        // Create an sql form to send to databse
        $sql = "select * from `registrations`" ;

        // UserID is required in order to search the current user's contacts
        if ($user_id != '') 
        {
            $sql .= "where `user_id` =" . $user_id;
        }
        else 
        {
            returnWithError('NO User ID');
        }       
    
        $eventList = $conn->query($sql);
        
        if ($eventList->num_rows > 0)
        {        
            $events = array();

            while($row = $eventList->fetch_assoc())
            {
                $event_id= $row["event_id"];

                $sql = "select * from `events`" ;

                if ($event_id != '') 
                {
                    $sql .= "where `event_id` =" . $event_id;
                    $event = $conn->query($sql);

                    $events[] = $event->fetch_assoc();                    
                }                
            }            
            returnWithInfo( $events );
        }
        else
        {
            returnWithError( "No UserID found" );
        }
        $conn->close();
        
    }
    else
    {
        returnWithError( "No UserID found" );
    }       
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