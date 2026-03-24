<?php
// admin.php
session_start();
include 'config.php';

// If not logged in, redirect to login.php
if (!isset($_SESSION['authenticated'])) {
  $_SESSION['intended_destination'] = 'admin.php';
  header("Location: login.php");
  exit;
}

$fileUploadMsg = null;
$accountCreateMsg = null;

if (isset($_POST["submit"])) {
  $target_file = "uploads/" . basename($_FILES["file"]["name"]);
  $fileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

  if ($fileType === "php") {
    $fileUploadMsg = "<p style='color: red;'> Wait a minute... This is a PHP file!! BEGONE, EVILDOERS!!!</p>";
  } else if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
    $fileUploadMsg = "<p style='color: green;'>Upload succeeded.</p>";
  } else if ($_FILES["file"]["error"] !== UPLOAD_ERR_OK) {
    $fileUploadMsg = "<p style='color: red;'>Upload failed: " . $_FILES["file"]["error"] . "</p>";
  } else {
    $fileUploadMsg = "<p style='color: red;'>Something went wrong.</p>";
  }
}

// Handle new account creation
if (isset($_POST["create_account"])) {
  $new_username = $_POST["new_username"] ?? "";
  $new_password = $_POST["new_password"] ?? "";
  $new_role = $_POST["new_role"] ?? "user";

  // Validate input
  if (empty($new_username) || empty($new_password)) {
    $accountCreateMsg = "<p style='color: red;'>Username and password are required.</p>";
  } else if (strlen($new_username) > 15) {
    $accountCreateMsg = "<p style='color: red;'>Username must be 15 characters or less.</p>";
  } else if (strlen($new_password) < 6) {
    $accountCreateMsg = "<p style='color: red;'>Password must be at least 6 characters.</p>";
  } else {
    // Hash the password
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
    
    // Insert into database
    $insert_stmt = $connection->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
    $insert_stmt->bind_param("sss", $new_username, $hashed_password, $new_role);
    
    if ($insert_stmt->execute()) {
      $accountCreateMsg = "<p style='color: green;'>Account created successfully for user: " . htmlspecialchars($new_username) . "</p>";
    } else {
      if (strpos($insert_stmt->error, "Duplicate entry") !== false) {
        $accountCreateMsg = "<p style='color: red;'>Username already exists.</p>";
      } else {
        $accountCreateMsg = "<p style='color: red;'>Error creating account: " . htmlspecialchars($insert_stmt->error) . "</p>";
      }
    }
    $insert_stmt->close();
  }
}
?>

<!DOCTYPE html>
<html>

<head>
  <title>Admin Page</title>
  <?php include 'include.php'; ?>
</head>

<body>
  <?php include 'topnav.php'; ?>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <!-- File Upload Section -->
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-sm bg-secondary text-white border-secondary"
          style="background-color:#2f3438; border-width:1px;">
          <div class="card-body">
            <h5 class="card-title mb-4">Upload a File</h5>

            <form method="POST" enctype="multipart/form-data">
              <div class="mb-3">
                <label for="file" class="form-label text-white">Choose file</label>
                <input class="form-control bg-dark text-white border-secondary" type="file" id="file" name="file"
                  required>
              </div>

              <div class="d-grid">
                <button type="submit" name="submit" class="btn btn-outline-light">Upload</button>
              </div>
            </form>

            <?php if (!empty($fileUploadMsg)): ?>
              <?php
              $text = strip_tags($fileUploadMsg);
              $alertClass = (strpos($fileUploadMsg, 'green') !== false) ? "alert-success" : "alert-danger";
              $alertClass = "{$alertClass} text-dark";
              ?>
              <div class="alert <?php echo $alertClass ?> mt-3" role="alert">
                <?php echo htmlspecialchars($text); ?>
              </div>
            <?php endif; ?>

          </div>
        </div>
      </div>
    </div>

    <!-- Create New Account Section -->
    <div class="row justify-content-center mt-5">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-sm bg-secondary text-white border-secondary"
          style="background-color:#2f3438; border-width:1px;">
          <div class="card-body">
            <h5 class="card-title mb-4">Create New Account</h5>

            <form method="POST">
              <div class="mb-3">
                <label for="new_username" class="form-label text-white">Username</label>
                <input class="form-control bg-dark text-white border-secondary" type="text" id="new_username" 
                  name="new_username" maxlength="15" required>
              </div>

              <div class="mb-3">
                <label for="new_password" class="form-label text-white">Password</label>
                <input class="form-control bg-dark text-white border-secondary" type="password" id="new_password" 
                  name="new_password" required>
              </div>

              <div class="mb-3">
                <label for="new_role" class="form-label text-white">Role</label>
                <select class="form-select bg-dark text-white border-secondary" id="new_role" name="new_role" required>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div class="d-grid">
                <button type="submit" name="create_account" class="btn btn-outline-light">Create Account</button>
              </div>
            </form>

            <?php if (!empty($accountCreateMsg)): ?>
              <?php
              $text = strip_tags($accountCreateMsg);
              $alertClass = (strpos($accountCreateMsg, 'green') !== false) ? "alert-success" : "alert-danger";
              $alertClass = "{$alertClass} text-dark";
              ?>
              <div class="alert <?php echo $alertClass ?> mt-3" role="alert">
                <?php echo htmlspecialchars($text); ?>
              </div>
            <?php endif; ?>

          </div>
        </div>
      </div>
    </div>
  </div>
</body>

</html>
