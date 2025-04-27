<?php
// 👉 Erlaubte Ursprünge (CORS)
$allowedOrigins = [
    'https://hilgert-immobilien.de',
    'https://www.hilgert-immobilien.de',
    'http://localhost:4200'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
}

// 👉 Preflight OPTIONS-Request direkt beantworten
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 👉 Inhaltstyp auf JSON setzen
header("Content-Type: application/json");

// 👉 Rohdaten einlesen
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// 👉 Validierung der Pflichtfelder
if (
    !$data ||
    !isset($data['email']) ||
    !isset($data['lastName']) ||
    !isset($data['salutation']) ||
    !isset($data['propertyAddress']) ||
    !isset($data['propertyExternalId']) ||
    !isset($data['zip']) ||
    !isset($data['city']) ||
    !isset($data['date']) ||
    !isset($data['weekday']) ||
    !isset($data['time'])
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Fehlende Felder']);
    exit();
}

// 👉 Felder auslesen
$email       = $data['email'];
$salutation  = strtolower($data['salutation']) === 'herr' ? 'Sehr geehrter Herr' : 'Sehr geehrte Frau';
$lastName    = $data['lastName'];
$propertyExternalId  = $data['propertyExternalId'];
$weekday     = $data['weekday'];
$date        = $data['date'];
$time        = $data['time'];
$address     = $data['propertyAddress'];
$zip         = $data['zip'];
$city        = $data['city'];
$downloadUrl = $data['formUrl'] ?? '';

// 👉 E-Mail aufbauen
$subject = "Terminbestätigung zur Besichtigung für die Immobilie ({$propertyExternalId}) - Bitte um kurze Antwort zur Bestätigung!";
$from = "info@hilgert-immobilien.de";

$htmlMessage = "<html><body>
<p>{$salutation} {$lastName},</p>

<p>vielen Dank für Ihr Interesse an der Immobilie ({$propertyExternalId}) in {$city}.</p>

<p>Hiermit erhalten Sie die Terminbestätigung für unsere Besichtigung am <strong>{$weekday}, den {$date} um {$time} Uhr</strong>.</p>

<p>Die Adresse lautet: <strong>{$address}, {$zip} {$city}</strong>.</p>

<p>
Hier geht es zum Objektnachweis:<br>
<a href='{$downloadUrl}' target='_blank'>{$downloadUrl}</a><br>
Bitte senden Sie diesen unterschrieben zurück oder bringen ihn zur Besichtigung mit.
</p>

<p>Ohne diesen Nachweis kann leider keine Besichtigung stattfinden.</p>

<p>Mit freundlichen Grüßen</p>
<p><strong>Samuel Hilgert</strong><br>Immobilienberater & Vermittler</p>

<hr>
<p><strong>HILGERT IMMOBILIEN</strong></p>
<p>
Eichendorffstraße 22<br>
68519 Viernheim<br><br>
Telefon: +49 6204 980 30 80<br>
Mobil: +49 176 44476237<br>
E-Mail: info@hilgert-immobilien.de<br>
Web: www.hilgert-immobilien.de<br>
</p>
</body></html>";

// 👉 Header setzen
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: Hilgert Immobilien <{$from}>\r\n";
$headers .= "Reply-To: {$from}\r\n";

// 👉 Mail senden
$success = mail($email, $subject, $htmlMessage, $headers);

// 👉 Antwort senden
echo json_encode(['success' => $success]);
?>
