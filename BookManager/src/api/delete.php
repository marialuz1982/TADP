<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require __DIR__ . '/config.php';

// --- Leer datos ---
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

// Si viene vacío o no es JSON, probar con $_POST
if (!$input) {
  $input = $_POST;
}

// Si sigue vacío, error
if (!$input || !isset($input['id'])) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Datos incompletos o JSON inválido', 'recibido' => $raw]);
  exit;
}

$id = (int)$input['id'];

// --- Ejecutar eliminación ---
$stmt = $mysqli->prepare("DELETE FROM libros WHERE id = ?");
$stmt->bind_param('i', $id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
  echo json_encode(['ok' => true, 'message' => 'Libro eliminado']);
} else {
  http_response_code(404);
  echo json_encode(['ok' => false, 'error' => 'Libro no encontrado']);
}

$stmt->close();
