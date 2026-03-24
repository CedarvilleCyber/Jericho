<?php
// Database Configuration
$db_host = 'localhost';
$db_user = 'root';
$db_password = ''; // Change this to your actual MySQL password
$db_name = 'acm';

// Create connection
$connection = new mysqli($db_host, $db_user, $db_password, $db_name);

// Check connection
if ($connection->connect_error) {
    die("Connection failed: " . $connection->connect_error);
}

// Set charset to utf8mb4
$connection->set_charset("utf8mb4");
?>
