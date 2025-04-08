<?php
switch ($_SERVER['REQUEST_METHOD']) {
    case ("OPTIONS"):
        header("Access-Control-Allow-Origin: https://immo.samuelhilgert.com");
        header("Access-Control-Allow-Methods: POST");
        header("Access-Control-Allow-Headers: content-type");
        exit;

    case ("POST"):
        header("Access-Control-Allow-Origin: https://immo.samuelhilgert.com");

        $json = file_get_contents('php://input');
        $params = json_decode($json);

        $firstName = $params->firstName ?? '';
        $lastName = $params->lastName ?? '';
        $name = trim($firstName . ' ' . $lastName);
        $email = $params->email ?? '';
        $phone = $params->phone ?? '-';
        $company = $params->company ?? '-';
        $subjectText = $params->subject ?? '';
        $messageText = $params->message ?? '';

        $recipient = 'info@hilgert-immobilien.de';
        $subject = "Neue Kontaktanfrage: $subjectText";

        $message = "
            <strong>Name:</strong> $name<br>
            <strong>Email:</strong> $email<br>
            <strong>Telefon:</strong> $phone<br><br>

            <strong>Firma:</strong> $company<br><br>

            <strong>Betreff:</strong> $subjectText<br><br>

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
