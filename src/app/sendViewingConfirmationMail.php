<?php
$allowedOrigins = [
    'https://hilgert-immobilien.de',
    'https://www.hilgert-immobilien.de',
    'http://localhost:4200'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}

switch ($_SERVER['REQUEST_METHOD']) {
    case ("OPTIONS"):
        header("Access-Control-Allow-Methods: POST");
        header("Access-Control-Allow-Headers: Content-Type");
        exit;

    case ("POST"):
        date_default_timezone_set('Europe/Berlin');

        $json = file_get_contents('php://input');
        $p = json_decode($json);

        // Eingänge (mit Defaults)
        $viewingConfirmationId = $p->viewingConfirmationId ?? '';
        $inquiryProcessId      = $p->inquiryProcessId ?? '';
        $customerId            = $p->customerId ?? '';
        $propertyExternalId    = $p->propertyExternalId ?? '';

        $salutation = $p->salutation ?? '';
        $firstName  = $p->firstName ?? '';
        $lastName   = $p->lastName ?? '';

        $viewingType = $p->viewingType ?? '';
        $viewingDateIso = $p->viewingDateIso ?? '';
        $confirmedAtIso = $p->confirmedAtIso ?? '';

        $title      = $p->title ?? '';
        $street     = $p->street ?? '';
        $houseNumber= $p->houseNumber ?? '';
        $postcode   = $p->postcode ?? '';
        $city       = $p->city ?? '';
        $courtage   = $p->courtage ?? '';

        $acceptedConditions = isset($p->acceptedConditions) && $p->acceptedConditions ? 'Ja' : 'Nein';
        $confirmUa = $p->confirmUa ?? '';
        $note      = $p->note ?? '';

        // Für das Datum
        $viewingDateMs = isset($p->viewingDateMs) ? (int)$p->viewingDateMs : 0;
        $confirmedAtMs = isset($p->confirmedAtMs) ? (int)$p->confirmedAtMs : 0;

        // Datumsformat DE
        $fmtMs = function($ms) {
            if (!$ms) return '-';
            $tz = new DateTimeZone('Europe/Berlin');
            $dt = (new DateTimeImmutable('@' . intval($ms / 1000)))->setTimezone($tz);
            return $dt->format('d.m.Y H:i');
        };

        $viewingDateStr = $fmtMs($viewingDateMs);
        $confirmedAtStr = $fmtMs($confirmedAtMs);

        // Maildaten
        $recipient = 'info@hilgert-immobilien.de';
        $subject   = "Viewing-Bestätigung: {$lastName}, {$firstName} – {$propertyExternalId}";

        $addressLine = trim("{$street} {$houseNumber}");
        $cityLine    = trim("{$postcode} {$city}");

        $message = "
            <h3>Terminbestätigung für die Besichtigung wurde bestätigt!</h3>
            <strong>ViewingConfirmationId:</strong> {$viewingConfirmationId}<br>
            <strong>InquiryProcessId:</strong> {$inquiryProcessId}<br>
            <strong>Kunde ID:</strong> {$customerId}<br>
            <strong>Immobilie ID:</strong> {$propertyExternalId}<br><br>

            <strong>Kunde:</strong><br>
            {$salutation} {$firstName} {$lastName}<br><br>

            <strong>Immobilie:</strong><br>
            {$title}<br>
            {$addressLine}<br>
            {$cityLine}<br><br>

            <strong>Courtage:</strong> {$courtage}<br><br>

            <strong>Termin:</strong><br>
            Typ: {$viewingType}<br>
            Datum/Zeit: {$viewingDateStr}<br><br>

            <strong>Termin und Richtlinien bestätigt:</strong><br>
            AGB/Richtlinien akzeptiert: {$acceptedConditions}<br>
            Bestätigt am: {$confirmedAtStr} Uhr<br>
            User-Agent: {$confirmUa}<br>
            Notiz: " . nl2br(htmlspecialchars($note)) . "<br>
        ";

        $headers   = [];
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=utf-8';
        $headers[] = 'From: info@hilgert-immobilien.de';

        @mail($recipient, $subject, $message, implode("\r\n", $headers));
        echo json_encode(["success" => true]);
        break;

    default:
        header("Allow: POST", true, 405);
        exit;
}
