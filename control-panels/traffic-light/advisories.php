<?php
session_start();
// No auth guard — this page is publicly accessible

// List uploaded files
$uploaded_files = array_values(array_filter(
    scandir(__DIR__ . '/uploads/'),
    fn($f) => $f !== '.' && $f !== '..' && $f !== '.gitkeep'
));

function advisory_badge(string $fname): string {
    $ext = strtolower(pathinfo($fname, PATHINFO_EXTENSION));
    return match($ext) {
        'pdf'              => '<span class="badge bg-danger">PDF</span>',
        'doc', 'docx'     => '<span class="badge bg-primary">DOC</span>',
        'jpg', 'jpeg', 'png' => '<span class="badge bg-success">IMG</span>',
        'txt'              => '<span class="badge bg-secondary">TXT</span>',
        default            => '<span class="badge bg-dark">' . htmlspecialchars(strtoupper($ext) ?: 'FILE') . '</span>',
    };
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Traffic Advisories — Jericho Department of Transportation</title>
    <?php include 'include.php'; ?>
</head>
<body>

<?php include 'topnav.php'; ?>

<div class="container py-4" style="max-width: 760px;">

    <h5 class="fw-bold mb-1 brand-heading">Traffic Advisories</h5>
    <p class="text-muted mb-4" style="font-size:0.875rem;">
        Official traffic advisory documents published by the Jericho Department of Transportation.
        Documents are updated as conditions change — check back regularly for the latest information.
    </p>

    <!-- ── Advisory List ── -->
    <div class="panel-card">
        <div class="panel-card-title">Published Advisories</div>

        <?php if (empty($uploaded_files)): ?>
            <p class="text-muted mb-0" style="font-size:0.875rem;">
                No advisories have been published yet. Check back later.
            </p>
        <?php else: ?>
            <table class="table table-sm table-hover mb-0" style="font-size:0.875rem;">
                <thead>
                    <tr>
                        <th style="width:3rem;">Type</th>
                        <th>Document</th>
                        <th style="width:6rem;">Size</th>
                        <th style="width:9rem;">Published</th>
                        <th style="width:9rem;"></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($uploaded_files as $fname): ?>
                        <?php
                            $fpath = __DIR__ . '/uploads/' . $fname;
                            $fsize = file_exists($fpath) ? round(filesize($fpath) / 1024, 1) . ' KB' : '—';
                            $ftime = file_exists($fpath) ? date('Y-m-d H:i', filemtime($fpath)) : '—';
                            $url   = '/traffic-light/uploads/' . rawurlencode($fname);
                        ?>
                        <tr>
                            <td class="align-middle"><?= advisory_badge($fname) ?></td>
                            <td class="align-middle"><?= htmlspecialchars($fname) ?></td>
                            <td class="align-middle text-muted"><?= $fsize ?></td>
                            <td class="align-middle text-muted"><?= $ftime ?></td>
                            <td class="align-middle text-end">
                                <a href="<?= $url ?>" target="_blank"
                                   class="btn btn-sm btn-outline-secondary me-1" style="font-size:0.72rem;">
                                    View
                                </a>
                                <a href="<?= $url ?>" download
                                   class="btn btn-sm btn-outline-secondary" style="font-size:0.72rem;">
                                    Download
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>

    <!-- ── Public Notice ── -->
    <div class="panel-card notice-card">
        <div class="panel-card-title notice-card-title">Public Information</div>
        <p style="font-size:0.8rem;margin:0;">
            These documents are provided for public information purposes only.
            For urgent traffic emergencies, contact the Jericho DOT at
            <strong>jericho+traffic@cedarville.edu</strong> or call your local emergency services.
            Documents are updated by authorized personnel — if you notice missing or outdated information,
            please contact us.
        </p>
    </div>

</div><!-- /container -->

<div class="site-footer">
    &copy; <?= date('Y') ?> City of Jericho &mdash; Department of Transportation
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
