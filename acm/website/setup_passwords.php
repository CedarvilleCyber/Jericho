<?php
/**
 * Password Setup Helper Script
 * Run this once to initialize user passwords with proper hashing
 * Then delete this file for security
 */

include 'config.php';

// Sample users to initialize with hashed passwords
$users = [
    ['username' => 'ewilliams', 'password' => 'dragon', 'role' => 'admin'],
    ['username' => 'kmitnick', 'password' => 'the-man-the-myth-the-legend', 'role' => 'admin'],
    ['username' => 'john', 'password' => 'password123', 'role' => 'user'],
    ['username' => 'alice', 'password' => 'qwerty', 'role' => 'user'],
    ['username' => 'bob', 'password' => 'letmein', 'role' => 'user'],
];

echo "<h1>Password Setup Helper</h1>";
echo "<p>This script will hash and display the passwords for your database setup.</p>";
echo "<table border='1' cellpadding='10'>";
echo "<tr><th>Username</th><th>Plain Password</th><th>Hashed Password</th><th>Role</th></tr>";

foreach ($users as $user) {
    $hashed = password_hash($user['password'], PASSWORD_DEFAULT);
    echo "<tr>";
    echo "<td>" . htmlspecialchars($user['username']) . "</td>";
    echo "<td>" . htmlspecialchars($user['password']) . "</td>";
    echo "<td><code>" . $hashed . "</code></td>";
    echo "<td>" . $user['role'] . "</td>";
    echo "</tr>";
}
echo "</table>";

echo "<p><strong>SQL to run:</strong></p>";
echo "<pre>";
foreach ($users as $user) {
    $hashed = password_hash($user['password'], PASSWORD_DEFAULT);
    echo "INSERT INTO users (username, password, role) VALUES ('" . 
         $connection->real_escape_string($user['username']) . "', '" . 
         $connection->real_escape_string($hashed) . "', '" . 
         $user['role'] . "');\n";
}
echo "</pre>";

echo "<p style='color: red; font-weight: bold;'>⚠️ DELETE THIS FILE (setup_passwords.php) AFTER SETTING UP YOUR DATABASE</p>";
?>
