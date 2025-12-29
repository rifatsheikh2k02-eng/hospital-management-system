<?php
class SessionController {
    public function getSession() {
        if (isset($_SESSION['user'])) {
            echo json_encode($_SESSION['user']);
        } else {
            echo json_encode(null);
        }
    }

    public function logout() {
        session_destroy();
        echo json_encode(array("message" => "Logout successful."));
    }
}
?>