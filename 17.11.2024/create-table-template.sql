CREATE TABLE favorite_movie (
    favorite_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES registered_user(user_id),
    movie_id INT REFERENCES movie(movie_id)
);