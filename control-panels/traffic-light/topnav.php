<?php
// topnav.php — site-wide header/navbar include
// Requires session to already be started by the including file.
$currentPage = basename($_SERVER['PHP_SELF']);
?>
<header class="site-header">
    <div class="brand">
        <div class="brand-logo" aria-hidden="true">
            <!-- Traffic light icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" class="tl-icon">
                <rect x="7" y="1" width="10" height="22" rx="3" ry="3"/>
                <circle cx="12" cy="6"  r="2.2"/>
                <circle cx="12" cy="12" r="2.2"/>
                <circle cx="12" cy="18" r="2.2"/>
            </svg>
        </div>
        <div>
            <div class="brand-name">Jericho Traffic Management</div>
            <div class="brand-sub">Department of Transportation &mdash; Control System v2.4</div>
        </div>
    </div>
    <nav style="flex:1; display:flex; align-items:center; justify-content:flex-end;">
        <a href="/traffic-light/advisories.php" <?= $currentPage === 'advisories.php' ? 'style="color:#fff;font-weight:700;"' : '' ?>>Advisories</a>
        <?php if (isset($_SESSION['user'])): ?>
            <a href="/traffic-light/index.php"  <?= $currentPage === 'index.php'  ? 'style="color:#fff;font-weight:700;"' : '' ?>>Control Panel</a>
            <a href="/traffic-light/admin.php"  <?= $currentPage === 'admin.php'  ? 'style="color:#fff;font-weight:700;"' : '' ?>>Admin</a>
            <a href="/traffic-light/logout.php">Log Out</a>
        <?php else: ?>
            <a href="/traffic-light/login.php">Log In</a>
        <?php endif; ?>
        <button id="theme-toggle" onclick="toggleTheme()" aria-label="Toggle dark mode"
                style="margin-left:1.25rem;background:none;border:1px solid rgba(255,255,255,0.35);
                       color:#cde0f5;border-radius:4px;padding:0.25rem 0.5rem;line-height:1;
                       cursor:pointer;display:flex;align-items:center;transition:background 0.15s;">
            <img id="theme-icon-moon" src="/traffic-light/public/moon.svg" width="16" height="16" alt="Switch to dark mode">
            <img id="theme-icon-sun"  src="/traffic-light/public/sun.svg"  width="16" height="16" alt="Switch to light mode" style="display:none;">
        </button>
    </nav>
</header>

<script>
function syncThemeIcon(theme) {
    var moon = document.getElementById('theme-icon-moon');
    var sun  = document.getElementById('theme-icon-sun');
    if (!moon || !sun) return;
    // In light mode show moon (click to go dark); in dark mode show sun (click to go light)
    moon.style.display = theme === 'dark' ? 'none'  : '';
    sun.style.display  = theme === 'dark' ? ''      : 'none';
    // SVGs use stroke="currentColor" — force white so they're visible on the dark header
    moon.style.filter = 'brightness(0) invert(1)';
    sun.style.filter  = 'brightness(0) invert(1)';
}

function toggleTheme() {
    var html = document.documentElement;
    var current = html.getAttribute('data-bs-theme') || 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-bs-theme', next);
    localStorage.setItem('jtms-theme', next);
    syncThemeIcon(next);
}

// Sync icon to current theme on load
(function() {
    syncThemeIcon(document.documentElement.getAttribute('data-bs-theme') || 'light');
})();
</script>
