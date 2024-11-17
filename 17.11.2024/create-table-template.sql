CREATE TABLE "user" (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    second_name VARCHAR(100),
    username VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    user_birthyear INT
);