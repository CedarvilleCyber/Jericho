<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Jericho</title>
        <link rel="stylesheet" href="./css/bootstrap.min.css">
        <link rel="stylesheet" href="./css/global.css">
    </head>
    <body>
        <div class="container">
            <header class="d-flex flex-wrap justify-content-center py-3">
                <a class="d-flex align-items-center me-md-auto page-title" href="#">
                    <img src="./images/logo.svg" alt="Jericho Logo" class="logo">
                    <span class="ms-2">Jericho Water</span>
                </a>
                <ul class="nav nav-pills">
                    <li class="nav-item"><a href="./index.php" class="nav-link active" aria-current="page">Home</a></li>
                    <li class="nav-item"><a href="./admin.php" class="nav-link">Admin</a></li>
                    <li class="nav-item"><a href="#" class="nav-link">About</a></li>
                    <li class="nav-item"><a href="./month.php" class="nav-link">Employee of the Month</a></li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" 
                        role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Account
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <li><a class="dropdown-item" href="./login.php">Log In</a></li>
                            <li><a class="dropdown-item" href="./logout.php">Log Out</a></li>
                        </ul>
                    </li>
                </ul>

            <!-- TODO: bugfix. For some reason, when you're on the admin page, 
            the nav bar is narrower than when you're on the index page. -->

            </header>
        </div>
        <script src="./js/bootstrap.bundle.min.js"></script>
    </body>
</html>