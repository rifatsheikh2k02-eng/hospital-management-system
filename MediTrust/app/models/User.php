<?php

class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $name;
    public $email;
    public $password;
    public $role;

    public function __construct($db){
        $this->conn = $db;
    }

    function create(){
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    name=:name, email=:email, password=:password, role=:role";

        $stmt = $this->conn->prepare($query);

        $this->name=htmlspecialchars(strip_tags($this->name));
        $this->email=htmlspecialchars(strip_tags($this->email));
        $this->password=htmlspecialchars(strip_tags($this->password));
        $this->role=htmlspecialchars(strip_tags($this->role));

        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        
        $password_hash = password_hash($this->password, PASSWORD_BCRYPT);
        $stmt->bindParam(":password", $password_hash);
        
        $stmt->bindParam(":role", $this->role);

        if($stmt->execute()){
            return true;
        }

        return false;
    }

    function login(){
        $query = "SELECT id, name, email, password, role FROM " . $this->table_name . " WHERE email = ? LIMIT 0,1";

        $stmt = $this->conn->prepare( $query );
        $stmt->bindParam(1, $this->email);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row && password_verify($this->password, $row['password'])){
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->role = $row['role'];
            return true;
        }

        return false;
    }

    function getAll(){
        $query = "SELECT id, name, email, role FROM " . $this->table_name . " ORDER BY name ASC";
        $stmt = $this->conn->prepare( $query );
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    function getByRole($role){
        $query = "SELECT id, name, email, role FROM " . $this->table_name . " WHERE role = ? ORDER BY name ASC";
        $stmt = $this->conn->prepare( $query );
        $stmt->bindParam(1, $role);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>