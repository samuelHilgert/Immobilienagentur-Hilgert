<?php
$allowedOrigins = [
  'https://hilgert-immobilien.de',
  'https://www.hilgert-immobilien.de',
  'http://localhost:4200' // Optional für lokale Tests
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
  header("Access-Control-Allow-Origin: $origin");
  header("Access-Control-Allow-Credentials: true");
} else {
  http_response_code(403);
  echo json_encode(['success' => false, 'message' => 'Origin nicht erlaubt']);
  exit;
}

// Preflight-Handling
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header("Access-Control-Allow-Methods: POST, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type");
  exit;
}

header("Content-Type: application/json");

// Nur POST erlaubt
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Nur POST erlaubt']);
  exit;
}

// Daten einlesen
$json = file_get_contents('php://input');
$params = json_decode($json);

// Felder validieren
if (!$params || !isset($params->autorName) || !isset($params->autorEmail) || !isset($params->text)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Fehlende Pflichtfelder']);
  exit;
}

// Daten extrahieren
$autorName = $params->autorName ?? '';
$autorEmail = $params->autorEmail ?? '';
$text = $params->text ?? '';
$rating = $params->rating ?? 0;
$bonus = isset($params->bonus) ? implode(', ', $params->bonus) : '-';
$publicAccepted = !empty($params->publicAccepted) ? 'Ja' : 'Nein';
$paymentAccepted = !empty($params->feedbackPaymentConditionAccepted) ? 'Ja' : 'Nein';
$advertiseAccepted = !empty($params->feedbackAdvertiseAccepted) ? 'Ja' : 'Nein';

// Empfänger & Betreff
$recipient = 'info@hilgert-immobilien.de';
$subject = "Neue Kundenbewertung";

// HTML-Mail-Inhalt
$message = "
  <strong>Name:</strong> $autorName<br>
  <strong>Email:</strong> $autorEmail<br><br>

  <strong>Sternebewertung:</strong> $rating / 5<br>
  <strong>Bewertungstext:</strong><br>
  $text<br><br>

  <strong>Gewählte Prämien:</strong> $bonus<br><br>

  <strong>Veröffentlichung der Bewertung zugestimmt:</strong> $publicAccepted<br>
  <strong>Teilnahmebedingungen (für Bewertungen mit einem Dankeschön) akzeptiert:</strong> $paymentAccepted<br>
  <strong>Werbenutzung (für Bewertungen mit einem Dankeschön) akzeptiert:</strong> $advertiseAccepted<br>
";

// Header für HTML-Mail
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=utf-8\r\n";
$headers .= "From: info@hilgert-immobilien.de\r\n";
$headers .= "Reply-To: info@hilgert-immobilien.de\r\n";

// Mail versenden
$success = mail($recipient, $subject, $message, $headers);

// JSON-Antwort
echo json_encode(['success' => $success]);
