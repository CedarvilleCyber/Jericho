<?php
// Database Configuration
// This file is stored OUTSIDE the web root for security
$db_host = 'localhost';
$db_user = 'webuser';
$db_password = 'nevergonna-GIVE-YOU-UP'; 
$db_name = 'traffic_db';

// Create connection
$connection = new mysqli($db_host, $db_user, $db_password, $db_name);

// Check connection
if ($connection->connect_error) {
    die("Connection failed: " . $connection->connect_error);
}

// Set charset to utf8mb4
$connection->set_charset("utf8mb4");
?>
