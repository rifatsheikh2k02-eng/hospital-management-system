<?php
session_start();
$conn = require_once 'app/_config/database.php';
require_once 'app/controllers/HomeController.php';
require_once 'app/controllers/UserController.php';
require_once 'app/controllers/SessionController.php';

// Simple router
$request = $_SERVER['REQUEST_URI'];

if (strpos($request, '?') !== false) {
    parse_str(parse_url($request, PHP_URL_QUERY), $query);
    $action = $query['action'] ?? '';
    switch ($action) {
        case 'login':
            $controller = new UserController($conn);
            $controller->login();
            break;
        case 'signup':
            $controller = new UserController($conn);
            $controller->signup();
            break;
        case 'session':
            $controller = new SessionController();
            $controller->getSession();
            break;
        case 'logout':
            $controller = new SessionController();
            $controller->logout();
            break;
        case 'audit':
            if (isset($_SESSION['user']['role']) && $_SESSION['user']['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden']);
                break;
            }
            require_once 'app/controllers/AuditController.php';
            $controller = new AuditController($conn);
            $controller->getAuditLogs();
            break;
        case 'addAuditLog':
            // Allow adding audit logs from any authenticated user (or anonymous actions)
            require_once 'app/controllers/AuditController.php';
            $controller = new AuditController($conn);
            $controller->addLog();
            break;
        case 'auditCount':
            if (isset($_SESSION['user']['role']) && $_SESSION['user']['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden']);
                break;
            }
            require_once 'app/controllers/AuditController.php';
            $controller = new AuditController($conn);
            $controller->getAuditCount();
            break;
        case 'users':
            $controller = new UserController($conn);
            $controller->getAllUsers();
            break;
        case 'doctors':
            $controller = new UserController($conn);
            $controller->getDoctors();
            break;
        case 'patients':
            $controller = new UserController($conn);
            $controller->getPatients();
            break;
        case 'bookAppointment':
            $controller = new UserController($conn);
            $controller->bookAppointment();
            break;
        case 'requestAmbulance':
            $controller = new UserController($conn);
            $controller->requestAmbulance();
            break;
        case 'subscribe':
            $controller = new UserController($conn);
            $controller->subscribe();
            break;
        case 'subscriptionStatus':
            $controller = new UserController($conn);
            $controller->subscriptionStatus();
            break;
        case 'patientAppointments':
            $controller = new UserController($conn);
            $controller->patientAppointments();
            break;
        case 'patientPrescriptions':
            $controller = new UserController($conn);
            $controller->patientPrescriptions();
            break;
        case 'executeQuery':
            if (isset($_SESSION['user']['role']) && $_SESSION['user']['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden']);
                break;
            }
            $controller = new UserController($conn);
            $controller->executeQuery();
            break;
        case 'savePrescription':
            $controller = new UserController($conn);
            $controller->savePrescription();
            break;
        case 'doctorAppointments':
            $controller = new UserController($conn);
            $controller->doctorAppointments();
            break;
        case 'doctorPrescriptions':
            $controller = new UserController($conn);
            $controller->doctorPrescriptions();
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Not Found']);
            break;
    }
} else {
    switch ($request) {
        case '/MediTrust/' :
        case '/MediTrust/index.php' :
            $controller = new HomeController();
            $controller->index();
            break;
        default:
            http_response_code(404);
            require __DIR__ . '/app/views/404.php';
            break;
    }
}
?>