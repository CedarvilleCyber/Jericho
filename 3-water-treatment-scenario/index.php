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
        <title>Jericho Water Treatment Center</title>
        <link rel="stylesheet" href="./css/global.css">
        <link rel="stylesheet" href="./css/index.css">
        <link rel="stylesheet" href="./css/bootstrap.min.css">
    </head>
    <body>
        <nav class="navbar fixed-top navbar-expand-md navbar-dark bg-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Water Co.</a>
                <div class="navbar-header">
                    <a class="navbar-brand" href="#">Jericho Water</a>
                </div>
                <a href="./login.php">Login</a>
            </div>
        </nav> 
        <h1>Jericho Water Treatment Center</h1>
        <p>Fill this page out later.</p>
    </body>
</html>
