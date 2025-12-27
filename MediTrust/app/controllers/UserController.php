<?php
require_once 'app/models/User.php';

class UserController {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function signup() {
        header('Content-Type: application/json');
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $user = new User($this->conn);
            $user->name = $_POST['name'];
            $user->email = $_POST['email'];
            $user->password = $_POST['password'];
            $user->role = $_POST['role'];

            try {
                if($user->create()){
                    echo json_encode(array("message" => "User was created."));
                } else {
                    echo json_encode(array("message" => "Unable to create user."));
                }
            } catch (PDOException $e) {
                // Handle duplicate email / integrity constraint gracefully
                if ($e->getCode() === '23000') {
                    echo json_encode(array("message" => "Email already exists."));
                } else {
                    // Return a safe error message; include error for debugging if needed
                    echo json_encode(array("message" => "Server error.", "error" => $e->getMessage()));
                }
            }
        } else {
            echo json_encode(array("message" => "Invalid request method."));
        }
    }

    public function login() {
        header('Content-Type: application/json');
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $user = new User($this->conn);
            $user->email = $_POST['email'];
            $user->password = $_POST['password'];

            if($user->login()){
                $_SESSION['user'] = array(
                    "id" => $user->id,
                    "name" => $user->name,
                    "email" => $user->email,
                    "role" => $user->role
                );
                echo json_encode(array("message" => "Login successful."));
            } else {
                echo json_encode(array("message" => "Login failed."));
            }
        } else {
            echo json_encode(array("message" => "Invalid request method."));
        }
    }

    public function getAllUsers(){
        header('Content-Type: application/json');
        $user = new User($this->conn);
        $users = $user->getAll();
        echo json_encode($users);
    }

    public function getDoctors(){
        header('Content-Type: application/json');
        $user = new User($this->conn);
        $doctors = $user->getByRole('doctor');
        echo json_encode($doctors);
    }

    public function getPatients(){
        header('Content-Type: application/json');
        $user = new User($this->conn);
        $patients = $user->getByRole('patient');
        echo json_encode($patients);
    }

    public function bookAppointment(){
        header('Content-Type: application/json');
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $stmt = $this->conn->prepare("INSERT INTO appointments (patient_email, doctor_email, reason, `when`) VALUES (?, ?, ?, ?)");
            $stmt->execute([$_POST['patientEmail'], $_POST['doctorEmail'], $_POST['reason'], $_POST['when']]);
            echo json_encode(array("message" => "Appointment booked."));
        }
    }

    public function requestAmbulance(){
        header('Content-Type: application/json');
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $stmt = $this->conn->prepare("INSERT INTO ambulances (patient_email, location, reason, `when`) VALUES (?, ?, ?, ?)");
            $stmt->execute([$_POST['patientEmail'], $_POST['location'], $_POST['reason'], $_POST['when']]);
            echo json_encode(array("message" => "Ambulance requested."));
        }
    }

    public function subscribe(){
        header('Content-Type: application/json');
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $stmt = $this->conn->prepare("INSERT INTO subscriptions (patient_email, plan, since) VALUES (?, ?, ?)");
            $stmt->execute([$_POST['patientEmail'], $_POST['plan'], $_POST['since']]);
            echo json_encode(array("message" => "Subscription activated."));
        }
    }

    public function subscriptionStatus(){
        header('Content-Type: application/json');
        $stmt = $this->conn->prepare("SELECT status FROM subscriptions WHERE patient_email = ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$_GET['patientEmail']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(array("status" => $row ? true : false));
    }

    public function patientAppointments(){
        header('Content-Type: application/json');
        $stmt = $this->conn->prepare("SELECT a.when, u.name as doctor, a.reason FROM appointments a JOIN users u ON a.doctor_email = u.email WHERE a.patient_email = ? ORDER BY a.when");
        $stmt->execute([$_GET['patientEmail']]);
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($appointments);
    }

    public function patientPrescriptions(){
        header('Content-Type: application/json');
        $stmt = $this->conn->prepare("SELECT p.when, u.name as doctor, p.text FROM prescriptions p JOIN users u ON p.doctor_email = u.email WHERE p.patient_email = ? ORDER BY p.when DESC");
        $stmt->execute([$_GET['patientEmail']]);
        $prescriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($prescriptions);
    }

    public function executeQuery(){
        header('Content-Type: application/json');
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            try {
                $stmt = $this->conn->prepare($_POST['query']);
                $stmt->execute();
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($result);
            } catch (Exception $e) {
                echo json_encode(['error' => $e->getMessage()]);
            }
        }
    }

    public function savePrescription(){
        header('Content-Type: application/json');
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $stmt = $this->conn->prepare("INSERT INTO prescriptions (doctor_email, patient_email, text, `when`) VALUES (?, ?, ?, ?)");
            $stmt->execute([$_POST['doctorEmail'], $_POST['patientEmail'], $_POST['text'], $_POST['when']]);
            echo json_encode(array("message" => "Prescription saved."));
        }
    }

    public function doctorAppointments(){
        header('Content-Type: application/json');
        $stmt = $this->conn->prepare("SELECT a.when, u.name as patient, u.email as patientEmail, a.reason FROM appointments a JOIN users u ON a.patient_email = u.email WHERE a.doctor_email = ? ORDER BY a.when");
        $stmt->execute([$_GET['doctorEmail']]);
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($appointments);
    }

    public function doctorPrescriptions(){
        header('Content-Type: application/json');
        $stmt = $this->conn->prepare("SELECT p.when, u.name as patient, u.email as patientEmail, p.text FROM prescriptions p JOIN users u ON p.patient_email = u.email WHERE p.doctor_email = ? ORDER BY p.when DESC");
        $stmt->execute([$_GET['doctorEmail']]);
        $prescriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($prescriptions);
    }
}
?>