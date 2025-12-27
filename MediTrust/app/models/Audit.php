<?php

class Audit {
    private $conn;
    private $table_name = "audit_logs";

    public function __construct($db){
        $this->conn = $db;
    }

    public function getAll(){
        $query = "SELECT timestamp, user, action FROM " . $this->table_name . " ORDER BY timestamp DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function add($user, $action){
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    user=:user, action=:action, timestamp=:timestamp";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":user", $user);
        $stmt->bindParam(":action", $action);
        $timestamp = date('Y-m-d H:i:s');
        $stmt->bindParam(":timestamp", $timestamp);

        if($stmt->execute()){
            return true;
        }

        return false;
    }

    public function getCount(){
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['count'];
    }
}
?>