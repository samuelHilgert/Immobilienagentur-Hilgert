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
        $json = file_get_contents('php://input');
        $params = json_decode($json);

        $email = $params->email ?? '';
        $salutation = $params->salutation ?? '';
        $firstName = $params->firstName ?? '';
        $lastName = $params->lastName ?? '';
        $name = trim(($salutation ? $salutation . ' ' : '') . $firstName . ' ' . $lastName);
        $messageText = $params->message ?? '';
        $company = $params->company ?? '-';
        $phone = $params->phone ?? '';
        $street = $params->street ?? '';
        $houseNumber = $params->houseNumber ?? '';
        $zip = $params->zip ?? '';
        $city = $params->city ?? '';
        $requestPropertyId = $params->requestPropertyId ?? '';
        $propertyType = $params->propertyType ?? '';
        $autoExposeSend = isset($params->autoExposeSend) && $params->autoExposeSend ? 'Ja' : 'Nein';
        $propertyTitle = $params->propertyTitle ?? '';
        $acceptedTerms = $params->acceptedTerms ? 'Ja' : 'Nein';
        $acceptedWithdrawal = $params->acceptedWithdrawal ? 'Ja' : 'Nein';
        $acceptedPrivacy = $params->acceptedPrivacy ? 'Ja' : 'Nein';
        $propertyDisplay = $propertyTitle 
        ? "$propertyTitle (ID: $requestPropertyId)" 
        : "ID: $requestPropertyId";
        
        $recipient = 'info@hilgert-immobilien.de';
        $subject = "Neue Exposé-Anfrage von <$email>";

        $message = "
            <strong>Name:</strong> $name<br>
            <strong>Email:</strong> $email<br>
            <strong>Telefon:</strong> $phone<br><br>
            <strong>Firma:</strong> $company<br><br>
            <strong>Adresse:</strong><br>
            $street $houseNumber<br>
            $zip $city<br><br>
            <strong>Immobilie:</strong><br>
            $propertyDisplay<br><br>
            <strong>Automatischer Exposé-Versand aktiviert:</strong> $autoExposeSend<br><br>
            <strong>Einverständniserklärungen:</strong><br>
            Ich akzeptiere die allgemeinen Geschäftsbedingungen: $acceptedTerms<br>
            Ich akzeptiere die Widerrufsbelehrung: $acceptedWithdrawal<br>
            Ich akzeptiere die Datenschutzerklärung: $acceptedPrivacy<br><br>
            <strong>Nachricht:</strong><br>
            $messageText
        ";

        $headers   = [];
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=utf-8';
        $headers[] = 'From: info@hilgert-immobilien.de';

        mail($recipient, $subject, $message, implode("\r\n", $headers));
        echo json_encode(["success" => true]);
        break;

    default:
        header("Allow: POST", true, 405);
        exit;
}
