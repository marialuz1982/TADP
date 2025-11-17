<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
// anti-cache
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require __DIR__ . '/config.php';
file_put_contents(__DIR__ . '/debug_delete.txt', file_get_contents('php://input'));

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'JSON inválido']); exit; }

$id     = (int)($input['id'] ?? 0);
$titulo = trim($input['titulo'] ?? '');
$autor  = trim($input['autor'] ?? '');
$anio   = trim($input['anio'] ?? '');
$genero = trim($input['genero'] ?? '');
$isbn   = trim($input['isbn'] ?? '');

if ($id<=0 || $titulo==='' || $autor==='' || $isbn==='' || $anio==='' || !is_numeric($anio)) {
  http_response_code(400);
  echo json_encode(['ok'=>false,'error'=>'Datos incompletos']); exit;
}

$anioVal = (int)$anio;

$stmt = $mysqli->prepare("UPDATE libros SET titulo=?, autor=?, anio=?, genero=?, isbn=? WHERE id=?");
$stmt->bind_param('ssissi', $titulo, $autor, $anioVal, $genero, $isbn, $id);
$ok = $stmt->execute();
$err = $stmt->error;
$aff = $stmt->affected_rows;
$stmt->close();

/*
  $aff puede ser:
  - >0  → cambió algo
  -  0  → los valores nuevos son iguales a los que ya tenía (válido)
  - -1  → error
*/
if ($ok && $aff >= 0) {
  echo json_encode(['ok'=>true,'message'=> $aff>0 ? 'Libro actualizado' : 'Sin cambios (valores iguales)']);
  exit;
}

// detectar duplicado de ISBN (1062)
if (strpos($err, '1062') !== false) {
  http_response_code(409);
  echo json_encode(['ok'=>false,'error'=>'ISBN duplicado']); exit;
}

http_response_code(500);
echo json_encode(['ok'=>false,'error'=>$err ?: 'No se pudo actualizar']);
