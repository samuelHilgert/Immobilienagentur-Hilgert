<?php
$allowedOrigins = [
  'https://hilgert-immobilien.de',
  'https://www.hilgert-immobilien.de'
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

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header("Access-Control-Allow-Methods: POST, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type");
  exit;
}

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $json = file_get_contents('php://input');
  $params = json_decode($json);

  $salutation = $params->salutation ?? '-';
  $firstName = $params->firstName ?? '';
  $lastName = $params->lastName ?? '';
  $name = trim($firstName . ' ' . $lastName);
  $email = $params->email ?? '';
  $phone = $params->phone ?? '-';
  $mobile = $params->mobile ?? '-';
  $company = $params->company ?? '-';
  $subjectText = $params->subject ?? '';
  $messageText = $params->message ?? '';
  $acceptedPrivacy = isset($params->acceptedPrivacy) && $params->acceptedPrivacy ? 'Ja' : 'Nein';

  if (empty($email)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email fehlt"]);
    exit;
  }

  $recipient = 'info@hilgert-immobilien.de';
  $subject = "Neue Kontaktanfrage: $subjectText";

  $message = "
      <strong>Anrede:</strong> $salutation<br>
      <strong>Name:</strong> $name<br>
      <strong>Email:</strong> $email<br>
      <strong>Telefon:</strong> $phone<br>
      <strong>Mobil:</strong> $mobile<br><br>

      <strong>Firma:</strong> $company<br><br>

      <strong>Betreff:</strong> $subjectText<br><br>

      <strong>Datenschutzerklärung akzeptiert:</strong> $acceptedPrivacy<br><br>

      <strong>Nachricht:</strong><br>
      $messageText
  ";

  $headers   = [];
  $headers[] = 'MIME-Version: 1.0';
  $headers[] = 'Content-type: text/html; charset=utf-8';
  $headers[] = 'From: info@hilgert-immobilien.de';

  $success = mail($recipient, $subject, $message, implode("\r\n", $headers));
  echo json_encode(["success" => $success]);
} else {
  header("Allow: POST", true, 405);
  exit;
}
