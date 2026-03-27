<?php
// login.php
session_start();
require_once('config.php');

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = $_POST['username'];
    $pass = $_POST['password'];

    // Query the database for the user by username only using prepared statement
    $stmt = $connection->prepare("SELECT id, username, password, role FROM users WHERE username = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows === 1) {
        $row = $result->fetch_assoc();
        // Verify the SHA256 hashed password
        if (hash('sha256', $pass) === $row['password']) {
            // Store login flag in session
            $_SESSION['authenticated'] = true;
            $_SESSION['user'] = $row['username'];
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['role'] = $row['role'];
            $redirect = $_SESSION['intended_destination'] ?? 'index.php';
            unset($_SESSION['intended_destination']);
            header("Location: $redirect");
            exit;
        } 
        else {
            $error = "INVALID LOGIN";
        }
    } 
    else {
        $error = "INVALID LOGIN";
    }
    
    $stmt->close();
}
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Login</title>
        <link rel="stylesheet" href="./css/mdb.min.css">
        <link rel="stylesheet" href="./css/login.css">
        <script src="./js/mdb.umd.min.js" defer></script>
        <?php include 'include.php'; ?>
    </head>

<body>
    <div class="flex-parent">
        <h2>Jericho Water Co. Login</h2>
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
    if (isset($error)) echo "<p class='error'>$error</p>";
    // Note the conspicuous lack of failed login limits or password lockouts...
    ?>
    </body>
</html>