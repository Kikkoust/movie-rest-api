CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    review_stars INT CHECK (review_stars >= 0 AND review_stars <=5),
    review_text TEXT,
    username VARCHAR(100) REFERENCES registered_user(username),
    movie_id INT REFERENCES movie(movie_id)
);