<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "meditrust";

try {

    $conn = new PDO("mysql:host=$servername", $username, $password);

    // set the PDO error mode to exception

    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "CREATE DATABASE IF NOT EXISTS meditrust";

    // use exec() because no results are returned

    $conn->exec($sql);

    $conn->exec("USE meditrust");

    $table_sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->exec($table_sql);

    $appointments_sql = "CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_email VARCHAR(255) NOT NULL,
        doctor_email VARCHAR(255) NOT NULL,
        reason TEXT,
        `when` DATETIME,
        status VARCHAR(50) DEFAULT 'booked'
    )";
    $conn->exec($appointments_sql);

    $prescriptions_sql = "CREATE TABLE IF NOT EXISTS prescriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doctor_email VARCHAR(255) NOT NULL,
        patient_email VARCHAR(255) NOT NULL,
        text TEXT,
        `when` DATETIME
    )";
    $conn->exec($prescriptions_sql);

    $subscriptions_sql = "CREATE TABLE IF NOT EXISTS subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_email VARCHAR(255) NOT NULL,
        plan VARCHAR(50),
        since DATETIME,
        status VARCHAR(50) DEFAULT 'active'
    )";
    $conn->exec($subscriptions_sql);

    $ambulances_sql = "CREATE TABLE IF NOT EXISTS ambulances (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_email VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        reason TEXT,
        `when` DATETIME,
        status VARCHAR(50) DEFAULT 'requested'
    )";
    $conn->exec($ambulances_sql);

    $audit_sql = "CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user VARCHAR(255),
        action TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->exec($audit_sql);

    return $conn;

    }

catch(PDOException $e)

    {

    die("Connection failed: " . $e->getMessage());

    }
?>