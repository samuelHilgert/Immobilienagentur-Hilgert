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

        $autorName = $params->autorName ?? '';
        $autorEmail = $params->autorEmail ?? '';
        $text = $params->text ?? '';
        $rating = $params->rating ?? 0;
        $bonus = isset($params->bonus) ? implode(', ', $params->bonus) : '-';
        $publicAccepted = $params->publicAccepted ? 'Ja' : 'Nein';
        $paymentAccepted = $params->feedbackPaymentConditionAccepted ? 'Ja' : 'Nein';
        $advertiseAccepted = $params->feedbackAdvertiseAccepted ? 'Ja' : 'Nein';

        $recipient = 'info@hilgert-immobilien.de';
        $subject = "Neue Kundenbewertung";

        $message = "
            <strong>Name:</strong> $autorName<br>
            <strong>Email:</strong> $autorEmail<br><br>

            <strong>Sternebewertung:</strong> $rating / 5<br>
            <strong>Bewertungstext:</strong><br>
            $text<br><br>

            <strong>Gewählte Prämien:</strong> $bonus<br><br>

            <strong>Veröffentlichung erlaubt:</strong> $publicAccepted<br>
            <strong>Teilnahmebedingungen akzeptiert:</strong> $paymentAccepted<br>
            <strong>Werbenutzung akzeptiert:</strong> $advertiseAccepted<br>
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
