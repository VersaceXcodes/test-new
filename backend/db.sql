-- Create the 'users' table
CREATE TABLE users (
    user_id VARCHAR PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    created_at VARCHAR NOT NULL
);

-- Seed data for 'users' table
INSERT INTO users (user_id, email, password_hash, name, created_at) VALUES
('user1', 'user1@example.com', 'password123', 'Alice Smith', '2023-01-01'),
('user2', 'user2@example.com', 'admin123', 'Bob Johnson', '2023-01-02'),
('user3', 'user3@example.com', 'user123', 'Charlie Brown', '2023-01-03');

-- Create the 'tasks' table
CREATE TABLE tasks (
    task_id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    task_name VARCHAR NOT NULL,
    due_date VARCHAR,
    is_complete BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Seed data for 'tasks' table
INSERT INTO tasks (task_id, user_id, task_name, due_date, is_complete) VALUES
('task1', 'user1', 'Complete Project', '2023-11-30', FALSE),
('task2', 'user1', 'Buy groceries', NULL, TRUE),
('task3', 'user2', 'Finish Report', '2023-12-01', FALSE),
('task4', 'user3', 'Clean House', NULL, FALSE);

-- Create the 'auth_tokens' table
CREATE TABLE auth_tokens (
    token_id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    auth_token VARCHAR NOT NULL UNIQUE,
    created_at VARCHAR NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Seed data for 'auth_tokens' table
INSERT INTO auth_tokens (token_id, user_id, auth_token, created_at) VALUES
('token1', 'user1', 'authToken123', '2023-01-01'),
('token2', 'user2', 'authToken456', '2023-01-02'),
('token3', 'user3', 'authToken789', '2023-01-03');

-- Create the 'search_filters' table
CREATE TABLE search_filters (
    filter_id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    search_query VARCHAR,
    filter_status VARCHAR DEFAULT 'incomplete',
    created_at VARCHAR NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Seed data for 'search_filters' table
INSERT INTO search_filters (filter_id, user_id, search_query, filter_status, created_at) VALUES
('filter1', 'user1', 'project 2023', 'completed', '2023-01-01'),
('filter2', 'user2', 'report', 'in_progress', '2023-01-02'),
('filter3', 'user3', 'task list', NULL, '2023-01-03');