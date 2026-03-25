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

-- Step 4: Insert users with hashed passwords (using bcrypt)
INSERT INTO users (id, username, password, role) VALUES
(1, 'ewilliams', '$2y$10$T2Lc9jzfnNsokbJxZxiyUe7Q9r6d1Ovrrks7x9imv0xnlmNmCOZ2C', 'admin'),
(2, 'kmitnick', '$2y$10$rq6xz8IHVpfIyW0gutmBv.oStIpXB8YualIo6jlsusgXEQIVSdCB.', 'admin'),
(3, 'john', '$2y$10$hzmuDH/jn1n2pRN1HLVIeuTigRX8ucyWaSgEXddiUg9JZJos5LDwi', 'user'),
(4, 'alice', '$2y$10$C7Ly8k2sgF1T2UMMWhZJA./ObWMnfLQypJ0WaaPvDbopdZUvtXQ/y', 'user'),
(5, 'bob', '$2y$10$mO3dZKwdk80.JW9bWs28VOkL.94K35jkTxznbbq1IOBY0/AF0sz9u', 'user'),
(6, 'charlie', '$2y$10$SYjruV1uG7SLuLPF5b2.X.GtyhFkpqHmhfPbNGa1mWT1aYhmtmXhO', 'user');

-- To run these commands:
-- 1. Open MySQL command line:
--    sudo mysql -u root
-- 
-- 2. Paste all commands above (or import this file)
--    sudo mysql -u root < database_setup.sql
--
-- 3. Verify the table was created:
--    USE traffic_db;
--    SELECT * FROM users;
--
-- SETTING UP THE WEBSITE USER:
-- 4. Create a user for the website: 
--    create user 'webuser'@'localhost' identified by 'webpassword';
-- 
-- 5. Grant permissions to the user:
--    grant all privileges on traffic_db.* TO 'webuser'@'localhost';
-- 
-- 6. Update config.php with your actual database credentials
