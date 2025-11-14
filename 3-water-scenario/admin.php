<?php
    // admin.php
    session_start();

    // If not logged in, redirect to login.php
    if (!isset($_SESSION['authenticated'])) {
        header("Location: login.php");
        exit;
    }

    if (isset($_POST["submit"])) {
        $target_file = "uploads/" . basename($_FILES["file"]["name"]);
        $fileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

        if ($fileType === "php") {
            $errorMsg = "<p style='color: red;'> Wait a minute... This is a PHP file!! BEGONE, EVILDOERS!!!</p>";
        }
        else if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
            $errorMsg = "<p style='color: green;'>Upload succeeded.</p>";
        }
        else if ($_FILES["file"]["error"] !== UPLOAD_ERR_OK) {
            $errorMsg = "<p style='color: red;'>Upload failed: " . $_FILES["file"]["error"] . "</p>";
        }
        else {
            $errorMsg = "<p style='color: red;'>Something went wrong.</p>";
        }
    }
?>

<!DOCTYPE html>
<html>
    <head>
        <title>Admin Page</title>
    </head>
    <body>
        <div class="container">
            <?php include 'topnav.php'; ?> 
            <h2>Upload a File</h2>
            <form method="POST" enctype="multipart/form-data">
                <input type="file" name="file" id="file">
                <input type="submit" name="submit" value="Upload">
            </form>
            <br>
            <?php echo $errorMsg ?>
        </div>
    </body>
</html>
