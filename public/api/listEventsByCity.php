<?php

include 'util.php';

authenticate_user();
   
// Ensure the request is sent via a GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error(400, 'Invalid request method');
}

$city = filter_input(INPUT_GET, 'city', FILTER_VALIDATE_STRING);

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
    $sql = "select * from `Events`" ;

    // UserID is required in order to search the current user's contacts
    if ($username != '') 
    {
        $sql .= "where `city` =" . $city;
    }
    else 
    {
        returnWithError('NO CITY');
    }       
        
    $result = $conn->query($sql);       

    
        
    if ($result->num_rows > 0)
    {        
        // Create a JSON friendly response to send back to client-side with requested info
        while($row = $result->fetch_object())
        {
            $searchResults[] = array( 'event' => $event_row );
        }
        
        returnWithInfo( $searchResults );
    }
    else
    {
        returnWithError( "No Records Found" );
    }
    $conn->close();

    }
    else
    {
        returnWithError( "No Records Found" );
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
    sendResultInfoAsJson( $retValue );
}