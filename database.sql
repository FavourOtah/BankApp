CREATE DATABASE bankdb


CREATE TYPE account_type AS ENUM ('savings','fixed','current','student');
CREATE TYPE transaction_type AS ENUM ('internal','external');

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);



CREATE TABLE accounts(
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    balance FLOAT DEFAULT 0,
    user_id INT NOT NULL,
    account_type account_type NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE transactions(
    id SERIAL PRIMARY KEY,
    amount FLOAT NOT NULL,
    type transaction_type NOT NULL,
    sender_account_id INT NOT NULL,
    receiver_account_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (sender_account_id) REFERENCES accounts(id),
    FOREIGN KEY (receiver_account_id) REFERENCES accounts(id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);