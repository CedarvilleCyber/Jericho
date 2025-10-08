<?php
// login.php
session_start();

// Simple hardcoded credentials (for Hydra brute force). Add better creds later
$valid_users = ["admin", "john_doe", "root"];
$valid_passwords = ["admin", "john_doen't", "root"];

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
    $error = "INVALID LOGIN";
  }
}
?>
<!DOCTYPE html>
<html>

<head>
  <title>Login</title>
  <!-- MDB 5 CSS -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/9.2.0/mdb.min.css" />

  <link rel="stylesheet" href="./css/global.css">
  <!-- NOTE: if the order of these two CSS links changes, then their precedence -->
  <!-- order would change, meaning the page would no longer be in dark mode. -->
  <link rel="stylesheet" href="./css/login.css">
</head>

<body>
  <h2>Jericho Water Co. Login</h2>
  <div class="flex-parent">
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
      <button type="submit" data-mdb-button-init data-mdb-ripple-init class="btn btn-primary btn-block mb-4">Sign in</button>
    </form>
  </div>

  <!-- MDB 5 JavaScript -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/9.2.0/mdb.umd.min.js"></script>

  <!-- Initialize MDB Inputs -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('[data-mdb-input-init]').forEach((formOutline) => {
        new mdb.Input(formOutline.querySelector('input'));
      });
    });
  </script>

  <?php
  if (isset($error)) echo "<p class='error'>$error</p>";
  // Note the conspicuous lack of failed login limits or password lockouts...
  ?>
</body>

</html>