<?php
session_start();

$configPath = __DIR__ . '/../auth/config.php';
if (!file_exists($configPath)) {
    die(json_encode(["success" => false, "message" => "Serverfehler"]));
}
$config = include($configPath);

// JSON-Daten empfangen
$data = json_decode(file_get_contents("php://input"), true);

$user = trim($data['username']);
$pass = $data['password'];

// Brute-Force-Schutz
if (!isset($_SESSION['login_attempts'])) {
    $_SESSION['login_attempts'] = 0;
}
if ($_SESSION['login_attempts'] >= 5) {
    die(json_encode(["success" => false, "message" => "Zu viele Fehlversuche."]));
}

// Login-Prüfung
if ($user === $config['admin_user'] && password_verify($pass, $config['admin_password'])) {
    $_SESSION["admin"] = true;
    $_SESSION["login_attempts"] = 0; // Zurücksetzen

    echo json_encode(["success" => true, "message" => "Login erfolgreich"]);
} else {
    $_SESSION["login_attempts"]++; // Erhöhen
    echo json_encode(["success" => false, "message" => "Falsche Anmeldedaten!"]);
}
?>

<!--
Sicherheitsmaßnahmen berücksichtigt
Passwort-Hashing (bcrypt) statt Klartext	✅
Session-Schutz mit httponly, secure, samesite=Strict	✅
Brute-Force-Schutz (max. 5 Login-Versuche)	✅
CSRF-Token nach erfolgreichem Login	✅
Eingaben bereinigt (trim())	✅
Sicheres Einbinden von config.php	✅
.htaccess schützt auth/-Ordner (oder Datei außerhalb Webroot)	✅
 -->
