<?php
    // index.php
    session_start();
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Jericho Water Treatment Center</title>

        <!-- I put the PHP "include" here so the index css would override the global css. -->
        <?php include 'topnav.php'; ?> 
        <link rel="stylesheet" href="./css/index.css">
    </head>
    <body>
        <div class="flex-container">
            <h1>Welcome to a world of possibility.</h1>
        </div>
    </body>
</html>
