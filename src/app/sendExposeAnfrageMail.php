<?php
switch ($_SERVER['REQUEST_METHOD']) {
    case "OPTIONS":
        header("Access-Control-Allow-Origin: https://immo.samuelhilgert.com");
        header("Access-Control-Allow-Methods: POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type");
        exit;

    case "POST":
        header("Access-Control-Allow-Origin: https://immo.samuelhilgert.com");
        header("Content-Type: application/json");

        $json = file_get_contents('php://input');
        $params = json_decode($json);

        $email = $params->email ?? '';
        $firstName = $params->firstName ?? '';
        $lastName = $params->lastName ?? '';
        $name = trim($firstName . ' ' . $lastName);
        $messageText = $params->message ?? '';
        $message = nl2br(htmlspecialchars($messageText)); // Sicherheitsmaßnahme
        $company = $params->company ?? '-';
        $phone = $params->phone ?? '';
        $immobilienId = $params->immobilienId ?? '';
        $immobilienTyp = $params->immobilienTyp ?? '';

        $recipient = 'info@hilgert-immobilien.com';
        $subject = "Neue Exposé-Anfrage für Immobilie $immobilienId";

        $body = "
            <h3>Neue Exposé-Anfrage</h3>
            <p><strong>Name:</strong> $name</p>
            <p><strong>Email:</strong> $email</p>
            <p><strong>Telefon:</strong> $phone</p>
            <p><strong>Firma:</strong> $company</p>
            <p><strong>Immobilie:</strong> $immobilienTyp (ID: $immobilienId)</p>
            <p><strong>Nachricht:</strong><br>$message</p>
        ";

        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=utf-8',
            'From: Hilgert Immobilien <info@hilgert-immobilien.com>',
            "Reply-To: $email"
        ];

        $success = mail($recipient, $subject, $body, implode("\r\n", $headers));

        if ($success) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Mail konnte nicht gesendet werden."]);
        }

        break;

    default:
        http_response_code(405);
        header("Allow: POST, OPTIONS");
        echo json_encode(["success" => false, "error" => "Method not allowed."]);
        exit;
}
