<?php
require_once '../../config/database.php';

$data = json_decode(file_get_contents("php://input"));

$sql = "INSERT INTO raw_materials (name, quantity, unit, price, supplier_id) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sisdi", 
    $data->name, 
    $data->quantity, 
    $data->unit, 
    $data->price, 
    $data->supplier_id
);

if ($stmt->execute()) {
    echo json_encode(array("message" => "Material added successfully"));
} else {
    echo json_encode(array("message" => "Error adding material"));
}

$stmt->close();
$conn->close();
?> 