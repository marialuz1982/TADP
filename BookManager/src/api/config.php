<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = '127.0.0.1';
$port = 3307; // si usás MySQL de XAMPP; cambiá a 3306 si es Workbench
$user = 'root';
$pass = '1234'; // la contraseña que configuraste
$db   = 'biblioteca';

$mysqli = new mysqli($host, $user, $pass, $db, $port);
if ($mysqli->connect_errno) {
  http_response_code(500);
  echo json_encode(['error' => 'Error de conexión: ' . $mysqli->connect_error]);
  exit;
}
$mysqli->set_charset('utf8mb4');
?>

