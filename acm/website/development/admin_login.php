<?php
// This page is named admin_login because "admin_login" is an entry in the wordlist
// the students covered in class, which is /usr/share/seclists/Discovery/Web-Content/common.txt

session_start();

// Database connection
require_once('../config.php');

$error = "";
$logged_in = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    $query = "SELECT * FROM users WHERE username='" . $username . "' AND password=SHA2('" . $password . "', 256)";
    
    // Execute actual query on the database
    $result = $connection->query($query);
    
    if ($result && $result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $_SESSION['authenticated'] = true;
        $_SESSION['user'] = $user['username'];
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        $logged_in = true;
    } else {
        $error = "INVALID LOGIN";
    }
    
    if ($logged_in) {
        $redirect = $_SESSION['intended_destination'] ?? '../admin.php';
        unset($_SESSION['intended_destination']);
        header("Location: $redirect");
        exit;
    }
}
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Development - Admin Login</title>
        <link rel="stylesheet" href="../css/mdb.min.css">
        <link rel="stylesheet" href="../css/login.css">
        <script src="../js/mdb.umd.min.js" defer></script>
        <?php include '../include.php'; ?>
    </head>

<body>
    <div class="flex-parent">
        <h2>Development - Admin Login</h2>
        <form method="POST">

            <!-- username input -->
            <div data-mdb-input-init class="form-outline mb-4">
                <input type="text" id="login-username-input" name="username" class="form-control" />
                <label class="form-label" for="login-username-input">Username</label>
            </div>

            <!-- password input -->
            <div data-mdb-input-init class="form-outline mb-4">
                <input type="password" id="login-password-input" name="password" class="form-control" />
                <label class="form-label" for="login-password-input">Password</label>
            </div>

            <!-- Submit button -->
            <button type="submit" data-mdb-ripple-init class="btn btn-primary btn-block mb-4">Sign in</button>
        </form>
    </div>

    <?php
    if ($error) echo "<p class='error'>$error</p>";
    ?>
    </body>
</html>
