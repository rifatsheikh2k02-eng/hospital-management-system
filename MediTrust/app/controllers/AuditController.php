<?php
require_once 'app/models/Audit.php';

class AuditController {
    private $conn;

    public function __construct($db){
        $this->conn = $db;
    }

    public function getAuditLogs(){
        $audit = new Audit($this->conn);
        $logs = $audit->getAll();

        header('Content-Type: application/json');
        echo json_encode(['auditLogs' => $logs]);
    }

    public function addLog(){
        header('Content-Type: application/json');
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $user = isset($_POST['user']) ? $_POST['user'] : 'anon';
            $action = isset($_POST['action']) ? $_POST['action'] : 'unknown action';

            $audit = new Audit($this->conn);
            if($audit->add($user, $action)){
                echo json_encode(array("message" => "Audit log added."));
            } else {
                echo json_encode(array("message" => "Unable to add audit log."));
            }
        } else {
            echo json_encode(array("message" => "Invalid request method."));
        }
    }

    public function getAuditCount(){
        header('Content-Type: application/json');
        $audit = new Audit($this->conn);
        $count = $audit->getCount();
        echo json_encode(['count' => $count]);
    }
}
?>