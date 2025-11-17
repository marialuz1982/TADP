<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200); exit;
}

require __DIR__ . '/config.php';function title_case($texto) {
  $texto = trim($texto);
  // todo minúsculas
  $texto = mb_strtolower($texto, 'UTF-8');
  // primera letra de cada palabra en mayúscula
  return mb_convert_case($texto, MB_CASE_TITLE, 'UTF-8');
}


$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'JSON inválido']);
  exit;
}

$titulo = title_case($input['titulo'] ?? '');
$autor  = title_case($input['autor'] ?? '');
$anio   = trim($input['anio'] ?? '');
$genero = title_case($input['genero'] ?? '');
$isbn   = trim($input['isbn'] ?? '');


if ($titulo === '' || $autor === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Título y autor son obligatorios']);
  exit;
}

$anioVal = ($anio === '' ? null : (int)$anio);
$stmt = $mysqli->prepare("INSERT INTO libros (titulo, autor, anio, genero, isbn) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param('ssiss', $titulo, $autor, $anioVal, $genero, $isbn);

$ok = $stmt->execute();
$stmt->close();

if ($ok) {
  echo json_encode(['ok' => true, 'message' => 'Libro agregado']);
} else {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => $mysqli->error]);
}
