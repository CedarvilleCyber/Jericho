<?php
    // admin.php
    session_start();

    // note to developer: DO PERMISSIONS STUFF
    // You need to do something with mod_php to make sure
    // the web shells can be executed. 

    // If not logged in, redirect to login.php
    if (!isset($_SESSION['authenticated'])) {
        header("Location: login.php");
        exit;
    }

    $target_dir = "uploads/";

    // note: the period below is the PHP concatenation operator.
    $target_file = $target_dir . basename($_FILES["file"]["name"]);
    
    // get file extension
    $fileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
    
    if(isset($_POST["submit"])) {
        if ($_FILES["file"]["error"] !== UPLOAD_ERR_OK) {
            echo "<p>File upload error.</p>";
        }

        // Note: this is a really weak detection mechanism (intentionally so)
        else if($fileType === "php") { 
            echo "<p>Wait a minute... This is a PHP file!! Are you trying to HACK us???</p>";
            echo "<p>File extension: " + $fileType + "</p>";
        }
        else if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
            echo "<p>Your file has been uploaded.</p>";
        }
        else {
            echo "<p>Strange... It seems there's been an error.</p>";
        }
    }

?>
<!DOCTYPE html>
<html>
    <head>
        <title>Admin Page</title>
    </head>
    <body>
        <?php include 'topnav.php'; ?> 
        <h2>Upload a File</h2>
        <form method="POST" enctype="multipart/form-data">
            <input type="file" name="file">
            <input type="submit" name="submit" value="Upload">
        </form>
    </body>
</html>
