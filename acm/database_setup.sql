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
(1, 'ewilliams', 'a9c43be948c5cabd56ef2bacffb77cdaa5eec49dd5eb0cc4129cf3eda5f0e74c', 'admin'),
(2, 'kmitnick', '4361ffda554aed737a9ea5f7ceb18de1c7414bb5815e48f0dff125887082882a', 'admin'),
(3, 'john', 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea', 'user'),
(4, 'alice', '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5', 'user'),
(5, 'bob', '9c6e703a0da1cca451369d142fda941e5002aeba7db21f4d6d9e8e7aa3f85cc1', 'user'),
(6, 'charlie', 'aad91bc51e670d575d2238b9fedd4d5964fe503ae3d06ffcfdfa8c8e1df6a6f5', 'user');

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
