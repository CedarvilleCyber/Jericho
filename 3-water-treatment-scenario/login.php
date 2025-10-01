<?php
    // login.php
    session_start();

    // Simple hardcoded credentials (for Hydra brute force). Add better creds later
    $valid_users = ["admin", "john_doe", "root"];
    $valid_passwords = ["waterplant123", "john_doen't", "root"];

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $user = $_POST['username'];
        $pass = $_POST['password'];

        if (in_array($user, $valid_users, TRUE) && in_array($pass, $valid_passwords, TRUE)) {
            // Store login flag in session
            $_SESSION['authenticated'] = true;
            $_SESSION['user'] = $user; // used for admin page auth later
            header("Location: index.php");
            exit;
        } else {
            $error = "Invalid login.";
        }
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Login</title>
        <link rel="stylesheet" href="./css/global.css">
        <!-- <link rel="stylesheet" href="./css/login.css"> -->
    </head>
    <body>
        <h2>Login</h2>
        <?php 
            if (isset($error)) echo "<p style='color:red'>$error</p>"; 
            // Note the conspicuous lack of failed login limits or password lockouts...
        ?>
        <form method="POST">
            <label>Username: <input type="text" name="username"></label><br>
            <label>Password: <input type="password" name="password"></label><br>
            <input type="submit" value="Login">
        </form>
    </body>
</html>
