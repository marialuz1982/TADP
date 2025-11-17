<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200); exit;
}

require __DIR__ . '/config.php';

// Si viene ?id=... -> un solo libro
if (isset($_GET['id']) && ctype_digit($_GET['id'])) {
  $id = (int) $_GET['id'];
  $stmt = $mysqli->prepare("SELECT id, titulo, autor, anio, genero, isbn, creado_en FROM libros WHERE id = ?");
  $stmt->bind_param('i', $id);
  $stmt->execute();
  $res = $stmt->get_result();
  $libro = $res->fetch_assoc();
  $stmt->close();

  if ($libro) {
    echo json_encode(['ok' => true, 'data' => $libro], JSON_UNESCAPED_UNICODE);
  } else {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'No encontrado']);
  }
  exit;
}

// Sin id -> lista completa (ordenada desc)
$res = $mysqli->query("SELECT id, titulo, autor, anio, genero, isbn, creado_en FROM libros ORDER BY id DESC");
$lista = [];
if ($res) {
  while ($row = $res->fetch_assoc()) $lista[] = $row;
}
echo json_encode(['ok' => true, 'data' => $lista], JSON_UNESCAPED_UNICODE);
