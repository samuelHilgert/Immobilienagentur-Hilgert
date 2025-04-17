<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// JSON einlesen
$data = json_decode(file_get_contents("php://input"), true);

// Validierung
if (
  !$data ||
  !isset($data['email']) ||
  !isset($data['externalId']) ||
  !isset($data['lastName']) ||
  !isset($data['salutation'])
) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Fehlende Felder']);
  exit;
}

// 📬 Daten auslesen
$email = $data['email'];
$externalId = $data['externalId'];
$salutation = strtolower($data['salutation']) === 'herr' ? 'Sehr geehrter Herr' : 'Sehr geehrte Frau';
$lastName = $data['lastName'] ?? '';
$numberOfRooms = $data['numberOfRooms'] ?? '';
$propertyType = $data['immobilienTyp'] ?? '';
$city = $data['city'] ?? '';
$value = $data['value'] ?? '';
$pdfUrl = $data['exposePdfUrl'] ?? null;

// 📄 Nachrichtentext
$subject = "Exposé für Objekt: $externalId";
$from = "info@hilgert-immobilien.de";

// 🧾 HTML-Nachricht
$htmlMessage = "
<html><body>
<p>{$salutation} {$lastName},</p>

<p>vielen Dank für Ihre Anfrage und das damit verbundene Interesse an folgender Immobilie:</p>

<p><strong>{$propertyType} mit {$numberOfRooms} Zimmern zum Kauf in {$city} für {$value} €</strong></p>

<p>
  Anbei erhalten Sie wie gewünscht, das erweiterte Exposé zur Immobilie:<br>
  <a href='{$pdfUrl}' target='_blank'>{$pdfUrl}</a>
</p>

<p>Wenn weiterhin Interesse besteht, bitte ich um eine kurze Rückmeldung.</p>

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
</body></html>
";

// Header (nur HTML)
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: Hilgert Immobilien <{$from}>\r\n";
$headers .= "Reply-To: {$from}\r\n";

// ✅ Mail senden
$success = mail($email, $subject, $htmlMessage, $headers);

// Antwort zurück
echo json_encode(['success' => $success]);
?>
