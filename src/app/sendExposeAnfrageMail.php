<?php
switch ($_SERVER['REQUEST_METHOD']) {
    case ("OPTIONS"):
        header("Access-Control-Allow-Origin: https://hilgert-immobilien.de");
        header("Access-Control-Allow-Methods: POST");
        header("Access-Control-Allow-Headers: content-type");
        exit;

    case ("POST"):
        header("Access-Control-Allow-Origin: https://hilgert-immobilien.de");

        $json = file_get_contents('php://input');
        $params = json_decode($json);

        $email = $params->email ?? '';
        $firstName = $params->firstName ?? '';
        $lastName = $params->lastName ?? '';
        $name = trim($firstName . ' ' . $lastName);
        $messageText = $params->message ?? '';
        $company = $params->company ?? '-';
        $phone = $params->phone ?? '';
        $street = $params->street ?? '';
        $houseNumber = $params->houseNumber ?? '';
        $zip = $params->zip ?? '';
        $city = $params->city ?? '';
        $immobilienId = $params->immobilienId ?? '';
        $immobilienTyp = $params->immobilienTyp ?? '';

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
            $immobilienTyp (ID: $immobilienId)<br><br>
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
