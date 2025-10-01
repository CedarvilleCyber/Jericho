<?php
    // admin.php
    session_start();

    // If not logged in, redirect to login.php
    if (!isset($_SESSION['authenticated'])) {
        header("Location: login.php");
        exit;
    }

    // find the php.ini and add "file_uploads = On"
    // otherwise this won't work
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Admin Page</title>
        <link rel="stylesheet" href="./css/global.css">
    </head>
    <body>
        <h2>Upload a File</h2>
        <form method="POST" enctype="multipart/form-data">
            <input type="file" name="file">
            <input type="submit" value="Upload">
        </form>
    </body>
</html>
