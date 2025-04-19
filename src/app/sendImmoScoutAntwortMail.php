<?php
$allowedOrigins = [
  'https://hilgert-immobilien.de',
  'https://www.hilgert-immobilien.de',
  'http://localhost:4200' // nur für Entwicklung, ggf. später entfernen
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

// Nur POST zulassen
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Nur POST erlaubt']);
  exit;
}

// JSON-Daten einlesen
$data = json_decode(file_get_contents("php://input"), true);

if (
  !$data ||
  !isset($data['email']) ||
  !isset($data['lastName']) ||
  !isset($data['salutation'])
) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Ungültige Daten']);
  exit;
}

// 🔎 Daten vorbereiten
$email = $data['email'];
$salutation = strtolower($data['salutation']) === 'herr' ? 'Sehr geehrter Herr' : 'Sehr geehrte Frau';
$lastName = $data['lastName'] ?? '';
$city = $data['city'] ?? '';
$externalId = $data['immobilienId'] ?? '';
$numberOfRooms = $data['numberOfRooms'] ?? '';
$propertyType = $data['immobilienTyp'] ?? '';
$marketingType = $data['marketingType'] ?? '';

$from = "info@hilgert-immobilien.de";
$subject = "Exposé Anfrage für Objekt: $externalId";

// 📨 HTML-Mail-Text
$message = "
<html>
<head>
  <meta charset='UTF-8'>
  <title>Exposé Anfrage</title>
</head>
<body style='font-family: Arial, sans-serif; color: #333;'>
  <p>{$salutation} {$lastName},</p>

  <p>vielen Dank für Ihre Anfrage und das damit verbundene Interesse an der Immobilie:</p>
  <p><strong>{$numberOfRooms} Zimmer, {$propertyType} zum {$marketingType} in {$city}</strong></p>

  <p>
    Bitte klicken Sie auf folgenden Link:<br>
    <a href='https://www.hilgert-immobilien.de/expose-anfordern?id={$externalId}'>
      www.hilgert-immobilien.de/expose-anfordern?id={$externalId}
    </a>
  </p>
  <p>
    …um das „Erweiterte Exposé“ anzufordern und geben Sie Ihre Kontaktdaten an (wichtig!).<br>
    Bitte haben Sie Verständnis dafür, dass wir Ihnen ansonsten aus Datenschutz- und Rechtsgründen 
    vorher keine weiteren Angaben zukommen lassen können.
  </p>

  <p>Für Fragen stehe ich Ihnen gerne jederzeit zur Verfügung.</p>

  <br>
  <p>Mit freundlichen Grüßen</p>

  <p>
    <strong>Samuel Hilgert</strong><br>
    Immobilienberater & Vermittler
  </p>

  <hr>
  <p><strong>HILGERT IMMOBILIEN</strong></p>
  <p>
    Eichendorffstraße 22<br>
    68519 Viernheim<br><br>

    Telefon: +49 6204 980 30 80<br>
    Mobil: +49 176 44476237<br>
    E-Mail: <a href='mailto:info@hilgert-immobilien.de'>info@hilgert-immobilien.de</a><br>
    Web: <a href='https://www.hilgert-immobilien.de'>www.hilgert-immobilien.de</a><br>
    Impressum: <a href='https://www.hilgert-immobilien.de/impressum'>hilgert-immobilien.de/impressum</a>
  </p>
</body>
</html>
";

// Header
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: Hilgert Immobilien <{$from}>\r\n";
$headers .= "Reply-To: {$from}\r\n";

// Mail versenden
$success = mail($email, $subject, $message, $headers);

echo json_encode(['success' => $success]);
?>
