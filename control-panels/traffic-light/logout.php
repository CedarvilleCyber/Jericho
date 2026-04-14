<?php
session_start();
$_SESSION = [];
session_destroy();
header('Location: /traffic-light/login.php');
exit;
