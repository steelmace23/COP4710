<?php

include 'util.php';

authenticate_user();

// Ensure the request is sent via a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error(400, 'Invalid request method'. $_SERVER['REQUEST_METHOD']);
}

// Decode the JSON request body
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!$data 
    || !$data['admin_id']
    || !$data['title'] 
    || !$data['start_time'] 
    || !$data['end_time'] 
    || !$data['address'] 
    || !$data['city'] 
    || !$data['state'] 
    || !$data['postal_code']) { 
    error(400, 'Malformed input: missing required fields');
}

// Pull out variables from request body
$admin_id = $data['admin_id'];
$title = $data['title'];
$description = array_key_exists('description', $data) ? $data['description'] : NULL;
$url = array_key_exists('url', $data) ? $data['url'] : NULL;
$start_time = transformDateTime($data['start_time']);
$end_time = transformDateTime($data['end_time']);
$address = $data['address'];
$address2 = array_key_exists('address2', $data) ? $data['address2'] : NULL;
$city = $data['city'];
$state = $data['state'];
$postal_code = $data['postal_code'];

// Connect to the MySQL server
$db_user = getenv('DB_USER');
$db_pass = getenv('DB_PASS');
$mysqli = new mysqli('localhost', $db_user, $db_pass, 'event_portal');

if ($mysqli->connect_errno) {
    error(500, 'Failed to connect to database');
}

// Prepare an insert event statement
$query = 'INSERT INTO `events` 
    (`event_id`, `admin_id`, `title`, `description`, `url`, `start_time`, `end_time`, `address`, `address2`, `city`, `state`, `postal_code`)
    VALUES 
    (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
if (!($stmt = $mysqli->prepare($query))) {
    error(500, 'Failed to prepare query');
}

$stmt->bind_param('issssssssss', 
    $admin_id, 
    $title,
    $description,
    $url,
    $start_time,
    $end_time,
    $address,
    $address2,
    $city,
    $state,
    $postal_code);
$success = $stmt->execute();

// Insertion failed
if (!$success) {
    error(500, 'Failed to create event: ' . $stmt->error);
}

// Query for the newly added row
$result = $mysqli->query('SELECT * from `events` WHERE `event_id` = ' . $mysqli->insert_id);
if (!$result) {
    error(500, 'Failed to retrieve created event: ' . $stmt->error);
}
$new_event = $result->fetch_assoc();

$response = [
    'message' => 'Event created successfully',
    'event' => $new_event
];

header('Content-Type: application/json');
echo json_encode($response);

$stmt->close();

// Transforms an ISO8601 date time string into a MySQL compatible date time string
function transformDateTime($dateTime) {
    $phpDate = DateTime::createFromFormat(DATE_ATOM, $dateTime);
    if (!$phpDate) {
        error(400, 'Invalid date format provided');
    }
    return $phpDate->format('Y-m-d H:i:s');
}
