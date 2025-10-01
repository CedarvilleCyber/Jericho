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
        <!-- fill this in now that you have bootstrap in the project -->
        <nav class="navbar navbar-expand-md navbar-dark bg-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Water Co.</a>
                <div class="navbar-header">
                    <a class="navbar-brand" href="#">WebSiteName</a>
                </div>
                <ul class="nav navbar-nav">
                    <li class="active"><a href="#">Home</a></li>
                    <li><a href="#">Page 1</a></li>
                    <li><a href="#">Page 2</a></li>
                </ul>
                <ul class="nav navbar-nav navbar-right">
                    <li><a href="#">Sign Up</a></li>
                    <li><a href="./login.php"></span> Login</a></li>
                </ul>
            </div>
        </nav> 
        <h1>Jericho Water Treatment Center</h1>
        <p>Fill this page out later.</p>
    </body>
</html>
