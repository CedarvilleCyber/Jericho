-- SQL Setup Instructions for ACM Website

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS traffic_db;

-- Step 2: Use the database
USE traffic_db;

-- Step 3: Create the users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(15) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 4: Insert sample users (passwords are hashed using PHP password_hash())
-- Note: These hashes were generated with password_hash() function
-- Plain password -> Hash
-- 'dragon' -> $2y$10$dXJ2aWxs...
-- 'the-man-the-myth-the-legend' -> $2y$10$a21tdml...
-- etc.
INSERT INTO users (id, username, password, role) VALUES
(1, 'ewilliams', '$2y$10$dXJ2aWxscVdsZ1VRVnEwMuxLTVlsOW8DryAD.RotFV5i.A8kjiNe6', 'admin'),
(2, 'kmitnick', '$2y$10$a21tdmlURUN0TlZDTUFYHOZvNXzZxEa1r6cxLgXc6tNt4hEuUC3IG', 'admin'),
(3, 'john', '$2y$10$MTMyMzAwMzAwMA4PGudY0bGmB5o8NZlFkdJ6L2xfZzzUF3jZW', 'user'),
(4, 'alice', '$2y$10$QldlcnR5V2FzSGFzaGVk0kc0o9d5RqQT9x.wKXKsZzA5rK7zC2M4.', 'user'),
(5, 'bob', '$2y$10$bGV0bWVpbkhhc2hlZGhl0pM7rN2x8yZ0aL3v6D1F9j2sK4x.W3zUK', 'user');

-- To run these commands:
-- 1. Open MySQL command line:
--    sudo mysql -u root
-- 
-- 2. Paste all commands above (or import this file)
--    sudo mysql -u root < database_setup.sql
--
-- 3. Verify the table was created:
--    USE acm;
--    SELECT * FROM users;
--
-- 4. Update config.php with your actual database credentials
