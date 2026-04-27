<?php

header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");



$host = "localhost";
$user = "root";
$pass = "";
$db   = "user_system"; 

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed"]));
}

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if ($user_id) {
    $sql = "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
} else {
    echo json_encode(["error" => "No user ID provided"]);
}

$conn->close();
?>