CREATE TABLE movie (
    movie_id SERIAL PRIMARY KEY,
    movie_name VARCHAR(255),
    release_year INT,
    genre_id INT REFERENCES genre(genre_id)
);