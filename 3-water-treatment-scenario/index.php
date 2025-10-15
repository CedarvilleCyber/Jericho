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
        <link rel="stylesheet" href="./css/index.css">
    </head>
    <body>
        <?php include 'topnav.php'; ?> 
        <h1>Jericho Water Treatment Center</h1>
        <div class="flex-container">
            <p>Welcome to a world of possibility.</p>
            <img src="./images/wtstock1.jpg" class="main-img"></img>
        </div>
    </body>
</html>
