<?php
session_start();
if (!isset($_SESSION['user'])) {
    header('Location: /traffic-light/login.php');
    exit;
}

$error   = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $file = $_FILES['file'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        $error = 'Upload failed. Please try again.';
    } else {
        // ── Intentionally vulnerable extension check ──────────────────────────
        // Only blocks ".php" — does NOT block .phtml, .php5, .phar, etc.
        // Apache's default mod_php FilesMatch handles .phtml as PHP.
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if ($ext === 'php') {
            $error = 'PHP files are not permitted for security reasons.';
        } else {
            $dest = __DIR__ . '/uploads/' . basename($file['name']);
            if (move_uploaded_file($file['tmp_name'], $dest)) {
                $success = 'Advisory document uploaded successfully: ' . htmlspecialchars(basename($file['name']));
            } else {
                $error = 'Failed to save file. Check uploads/ directory permissions.';
            }
        }
    }
}

// List uploaded files
$uploaded_files = array_values(array_filter(
    scandir(__DIR__ . '/uploads/'),
    fn($f) => $f !== '.' && $f !== '..' && $f !== '.gitkeep'
));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin — Traffic Advisory Upload</title>
    <?php include 'include.php'; ?>
</head>
<body>

<?php include 'topnav.php'; ?>

<div class="container py-4" style="max-width: 760px;">

    <h5 class="fw-bold mb-1" style="color:#003865;">Traffic Advisory Management</h5>
    <p class="text-muted mb-4" style="font-size:0.875rem;">
        Upload traffic advisory documents for public distribution. Supported formats: PDF, DOCX, images, and plain-text notices.
    </p>

    <!-- ── Upload Form ── -->
    <div class="panel-card">
        <div class="panel-card-title">Upload Advisory Document</div>

        <?php if ($error): ?>
            <div class="alert alert-danger py-2" style="font-size:0.875rem;">
                <strong>Upload rejected:</strong> <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>
        <?php if ($success): ?>
            <div class="alert alert-success py-2" style="font-size:0.875rem;">
                <strong>Success:</strong> <?= $success ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="/traffic-light/admin.php" enctype="multipart/form-data">
            <div class="mb-3">
                <label for="advisory-title" class="form-label fw-semibold" style="font-size:0.875rem;">Advisory Title</label>
                <input type="text" class="form-control" id="advisory-title" name="title"
                       placeholder="e.g. Road Closure — Oak Blvd Construction">
            </div>
            <div class="mb-3">
                <label for="advisory-desc" class="form-label fw-semibold" style="font-size:0.875rem;">Description</label>
                <textarea class="form-control" id="advisory-desc" name="description" rows="2"
                          placeholder="Brief description of the advisory…"></textarea>
            </div>
            <div class="mb-3">
                <label for="file" class="form-label fw-semibold" style="font-size:0.875rem;">Document File</label>
                <input type="file" class="form-control" id="file" name="file" required>
                <div class="form-text">Accepted: PDF, DOCX, JPG, PNG, TXT. PHP files are not allowed.</div>
            </div>
            <button type="submit" class="btn" style="background:#003865;color:#fff;font-weight:600;">
                Upload Advisory
            </button>
        </form>
    </div>

    <!-- ── Uploaded Files List ── -->
    <div class="panel-card">
        <div class="panel-card-title">Published Advisories</div>
        <?php if (empty($uploaded_files)): ?>
            <p class="text-muted" style="font-size:0.875rem;">No advisories have been uploaded yet.</p>
        <?php else: ?>
            <table class="table table-sm table-hover" style="font-size:0.875rem;">
                <thead>
                    <tr>
                        <th>Filename</th>
                        <th>Size</th>
                        <th>Uploaded</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($uploaded_files as $fname): ?>
                        <?php
                            $fpath = __DIR__ . '/uploads/' . $fname;
                            $fsize = file_exists($fpath) ? round(filesize($fpath) / 1024, 1) . ' KB' : '—';
                            $ftime = file_exists($fpath) ? date('Y-m-d H:i', filemtime($fpath)) : '—';
                        ?>
                        <tr>
                            <td><?= htmlspecialchars($fname) ?></td>
                            <td><?= $fsize ?></td>
                            <td><?= $ftime ?></td>
                            <td>
                                <a href="/traffic-light/uploads/<?= rawurlencode($fname) ?>"
                                   target="_blank" class="btn btn-sm btn-outline-secondary" style="font-size:0.72rem;">
                                    View
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>

    <!-- ── Admin Info ── -->
    <div class="panel-card" style="background:#fffbe6;border-color:#ffe58f;">
        <div class="panel-card-title" style="color:#7c6400;">System Notice</div>
        <p style="font-size:0.8rem;color:#5c4a00;margin:0;">
            Uploaded documents are stored in <code>uploads/</code> and immediately accessible to the public portal.
            Ensure all files comply with the Jericho DOT document standards before uploading.
            Contact <strong>jericho+traffic@cedarville.edu</strong> for access issues.
        </p>
    </div>

</div><!-- /container -->

<div class="site-footer">
    &copy; <?= date('Y') ?> City of Jericho &mdash; Department of Transportation
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
