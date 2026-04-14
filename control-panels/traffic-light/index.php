<?php
session_start();
if (!isset($_SESSION['user'])) {
    header('Location: /traffic-light/login.php');
    exit;
}

// Initial light states — NS=green, EW=red (standard cycle start)
$intersections = [
    'INT-01' => ['name' => 'Main St & 1st Ave',   'NS' => 'green', 'EW' => 'red'],
    'INT-02' => ['name' => 'Main St & 3rd Ave',   'NS' => 'green', 'EW' => 'red'],
    'INT-03' => ['name' => 'Oak Blvd & 1st Ave',  'NS' => 'green', 'EW' => 'red'],
    'INT-04' => ['name' => 'Oak Blvd & 3rd Ave',  'NS' => 'green', 'EW' => 'red'],
];

$light_states = ['red', 'yellow', 'green', 'off'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Control Panel — Jericho Traffic Management System</title>
    <?php include 'include.php'; ?>
    <link rel="stylesheet" href="/traffic-light/css/control.css">
</head>
<body>

<?php include 'topnav.php'; ?>

<div class="container-xl py-4">

    <!-- ── System Mode Bar ── -->
    <div class="panel-card">
        <div class="panel-card-title">System Mode</div>
        <div class="mode-bar">
            <button id="btn-mode-normal" class="btn btn-success mode-btn">
                &#9989; Normal Cycle
            </button>
            <button id="btn-mode-blink" class="btn btn-danger mode-btn">
                &#128308; All Blink Red
            </button>
            <button id="btn-mode-off" class="btn btn-secondary mode-btn">
                &#9899; All Lights Off
            </button>

            <div class="mode-status">
                <span>Current Mode:</span>
                <span id="mode-label" class="mode-label">NORMAL CYCLE</span>
                <span class="badge bg-success" id="mode-badge">NORMAL CYCLE</span>
                <span class="last-updated">Last updated: <span id="last-updated">--:--:--</span></span>
            </div>
        </div>
    </div>

    <!-- ── Intersection Grid ── -->
    <div class="intersection-grid">
        <?php foreach ($intersections as $intId => $int): ?>
        <div class="intersection-card">
            <div class="intersection-header">
                <div>
                    <div class="int-id"><?= htmlspecialchars($intId) ?></div>
                    <div style="font-size:0.7rem;font-weight:400;opacity:0.8;"><?= htmlspecialchars($int['name']) ?></div>
                </div>
                <div class="int-status-dot" title="Online"></div>
            </div>
            <div class="intersection-body">

                <?php foreach (['NS' => 'North / South', 'EW' => 'East / West'] as $dir => $dirLabel): ?>
                <div class="direction-row">
                    <span class="direction-label"><?= $dir ?></span>
                    <div class="light-circles">
                        <?php foreach ($light_states as $state): ?>
                            <?php
                                $isActive = ($int[$dir] === $state);
                                $activeClass = $isActive ? "active-{$state}" : 'inactive';
                            ?>
                            <div
                                class="light-circle <?= $activeClass ?>"
                                data-intersection="<?= htmlspecialchars($intId) ?>"
                                data-direction="<?= $dir ?>"
                                data-state="<?= $state ?>"
                                data-active="<?= $isActive ? 'true' : 'false' ?>"
                                title="<?= ucfirst($state) ?>"
                            ></div>
                        <?php endforeach; ?>
                    </div>
                    <button
                        class="btn btn-sm btn-outline-primary btn-apply btn-apply-int"
                        data-intersection="<?= htmlspecialchars($intId) ?>"
                        data-direction="<?= $dir ?>"
                        style="font-size:0.72rem;padding:0.2rem 0.55rem;"
                    >Apply</button>
                </div>
                <?php endforeach; ?>

            </div><!-- /intersection-body -->
        </div><!-- /intersection-card -->
        <?php endforeach; ?>
    </div><!-- /intersection-grid -->

    <!-- ── System Log ── -->
    <div class="panel-card" style="margin-top:1.25rem;">
        <div class="panel-card-title">System Activity Log</div>
        <div class="log-panel" id="system-log">
            <div class="log-line-info">[SYSTEM] Traffic control session started. User: <?= htmlspecialchars($_SESSION['user']) ?></div>
        </div>
    </div>

    <!-- ── System Info ── -->
    <div class="row g-3">
        <div class="col-md-4">
            <div class="panel-card" style="padding:1rem 1.25rem;">
                <div class="panel-card-title">Controller Unit</div>
                <table class="table table-sm table-borderless mb-0" style="font-size:0.8rem;">
                    <tr><td class="text-muted">Unit ID</td><td class="fw-semibold">JTMS-CTL-001</td></tr>
                    <tr><td class="text-muted">Firmware</td><td>v2.4.1</td></tr>
                    <tr><td class="text-muted">Uptime</td><td>14d 07h 23m</td></tr>
                </table>
            </div>
        </div>
        <div class="col-md-4">
            <div class="panel-card" style="padding:1rem 1.25rem;">
                <div class="panel-card-title">Network</div>
                <table class="table table-sm table-borderless mb-0" style="font-size:0.8rem;">
                    <tr><td class="text-muted">PLC Address</td><td class="fw-semibold">10.0.1.42</td></tr>
                    <tr><td class="text-muted">Protocol</td><td>HTTP/REST</td></tr>
                    <tr><td class="text-muted">Signal</td><td><span class="badge bg-success">Online</span></td></tr>
                </table>
            </div>
        </div>
        <div class="col-md-4">
            <div class="panel-card" style="padding:1rem 1.25rem;">
                <div class="panel-card-title">Operator</div>
                <table class="table table-sm table-borderless mb-0" style="font-size:0.8rem;">
                    <tr><td class="text-muted">User</td><td class="fw-semibold"><?= htmlspecialchars($_SESSION['user']) ?></td></tr>
                    <tr><td class="text-muted">Role</td><td>Traffic Operator</td></tr>
                    <tr><td class="text-muted">Session</td><td><?= htmlspecialchars(session_id()) ?></td></tr>
                </table>
            </div>
        </div>
    </div>

</div><!-- /container-xl -->

<div class="site-footer">
    &copy; <?= date('Y') ?> City of Jericho &mdash; Department of Transportation &mdash; Control System v2.4
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="/traffic-light/js/control.js"></script>
</body>
</html>
