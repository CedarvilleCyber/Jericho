<?php
session_start();

// Hardcoded credentials (intentionally brute-forceable — admin/traffic1 is in rockyou)
$valid_users = [
    'admin' => 'traffic1',
];

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (isset($valid_users[$username]) && $valid_users[$username] === $password) {
        $_SESSION['user'] = $username;
        header('Location: /traffic-light/index.php');
        exit;
    } else {
        $error = 'Invalid username or password.';
    }
}

// Redirect if already logged in
if (isset($_SESSION['user'])) {
    header('Location: /traffic-light/index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login — Jericho Traffic Management System</title>
    <?php include 'include.php'; ?>
</head>
<body>

<?php include 'topnav.php'; ?>

<div class="container" style="max-width: 420px; margin-top: 6rem;">
    <div class="panel-card">
        <div class="text-center mb-4">
            <!-- Traffic light icon (larger) -->
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" style="fill:#003865;" class="tl-icon mb-2">
                <rect x="7" y="1" width="10" height="22" rx="3" ry="3"/>
                <circle cx="12" cy="6"  r="2.2"/>
                <circle cx="12" cy="12" r="2.2"/>
                <circle cx="12" cy="18" r="2.2"/>
            </svg>
            <h4 class="fw-bold mt-1 brand-heading">Jericho Traffic Management System</h4>
            <p class="text-muted" style="font-size:0.85rem;">Authorized personnel only. All access is logged.</p>
        </div>

        <?php if ($error): ?>
            <div class="alert alert-danger py-2" style="font-size:0.875rem;"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>

        <form method="POST" action="/traffic-light/login.php">
            <div class="mb-3">
                <label for="username" class="form-label fw-semibold" style="font-size:0.875rem;">Username</label>
                <input type="text" class="form-control" id="username" name="username"
                       value="<?= htmlspecialchars($_POST['username'] ?? '') ?>"
                       autocomplete="username" required autofocus>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label fw-semibold" style="font-size:0.875rem;">Password</label>
                <input type="password" class="form-control" id="password" name="password"
                       autocomplete="current-password" required>
            </div>
            <button type="submit" class="btn btn-brand w-100">
                Sign In
            </button>
        </form>
    </div>
    <p class="text-center text-muted mt-3" style="font-size:0.75rem;">
        Jericho Department of Transportation &mdash; Traffic Control Division<br>
        Unauthorized access is a violation of 18 U.S.C. &sect; 1030
    </p>
</div>

<div class="site-footer">
    &copy; <?= date('Y') ?> City of Jericho &mdash; Department of Transportation
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
