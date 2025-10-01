<?php
    // index.php
    session_start();

    // If not logged in, redirect to login.php
    if (!isset($_SESSION['authenticated'])) {
        header("Location: login.php");
        exit;
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Water Treatment Center</title>
        <link rel="stylesheet" href="./css/global.css">
        <link rel="stylesheet" href="./css/index.css">
    </head>
    <body>
        <h1>Water Treatment Center</h1>
        <p>Fill this page out later.</p>
    </body>
</html>
