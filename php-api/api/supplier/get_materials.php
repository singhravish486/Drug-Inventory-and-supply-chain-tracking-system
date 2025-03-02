<?php
require_once '../../config/database.php';

$sql = "SELECT * FROM raw_materials WHERE supplier_id = ?";
$stmt = $conn->prepare($sql);
$supplier_id = $_GET['supplier_id'];
$stmt->bind_param("i", $supplier_id);
$stmt->execute();
$result = $stmt->get_result();

$materials = array();
while ($row = $result->fetch_assoc()) {
    array_push($materials, $row);
}

echo json_encode($materials);
$stmt->close();
$conn->close();
?> 