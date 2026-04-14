<?php
// topnav.php — site-wide header/navbar include
// Requires session to already be started by the including file.
$currentPage = basename($_SERVER['PHP_SELF']);
?>
<header class="site-header">
    <div class="brand">
        <div class="brand-logo" aria-hidden="true">
            <!-- Traffic light icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                <rect x="7" y="1" width="10" height="22" rx="3" ry="3"/>
                <circle cx="12" cy="6"  r="2.2" fill="#f0f2f5"/>
                <circle cx="12" cy="12" r="2.2" fill="#f0f2f5"/>
                <circle cx="12" cy="18" r="2.2" fill="#f0f2f5"/>
            </svg>
        </div>
        <div>
            <div class="brand-name">Jericho Traffic Management</div>
            <div class="brand-sub">Department of Transportation &mdash; Control System v2.4</div>
        </div>
    </div>
    <nav>
        <?php if (isset($_SESSION['user'])): ?>
            <a href="/traffic-light/index.php"  <?= $currentPage === 'index.php'  ? 'style="color:#fff;font-weight:700;"' : '' ?>>Control Panel</a>
            <a href="/traffic-light/admin.php"  <?= $currentPage === 'admin.php'  ? 'style="color:#fff;font-weight:700;"' : '' ?>>Admin</a>
            <a href="/traffic-light/logout.php">Log Out</a>
        <?php else: ?>
            <a href="/traffic-light/login.php">Log In</a>
        <?php endif; ?>
    </nav>
</header>
