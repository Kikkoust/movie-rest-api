import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();


const app = express();

app.use(express.json());

const {Client} = pg;

app.listen(3001, () => {
  console.log('Server is running');
});

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE
});

client.connect().then(() => {
  console.log('Database connected');
}).catch(err => {
  console.log('Error connecting to database', err);
});

app.get('/', (req, res) => {
  res.send('<h1>This is the movie API made by MM TIK23SP!</h1><br /><p>/movies</p><br /><p>/movies?page=(page number)</p><br /><p>/movies/search?keyword=(keyword)</p><br /><p>/genres</p><br /><p>/favorites/(username)');
});

//MOVIES!!!!!!!!!!!!!!

//get movies
app.get('/movies', async (req, res) => {
  const page = parseInt(req.query.page) || 1; //default page
  const limit = 10; //movies on page
  const offset = (page - 1) * limit;

  try {
    const result = await client.query('SELECT * FROM movie LIMIT $1 OFFSET $2', [limit, offset]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error ', err);
    res.status(500).send('Error');
  }
});

//get movies with keyword 
app.get('/movies/search', async (req, res) => {
  const keyword = req.query.keyword;

  if (!keyword) {
    return res.status(400).send('Use keyword to search!');
  }

  try {
    const query = `SELECT * FROM movie WHERE movie_name ILIKE $1`; //ILIKE = case sensitivity doesn't matter
    const result = await client.query(query, [`%${keyword}%`]);

    if (result.rows.length === 0) {
      return res.status(404).send('Zero movies found with this keyword.');
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error searching with keyword', err);
    res.status(500).send('Error searching movies.');
  }
});

// get movie by id
app.get('/movies/:id', async (req, res) => {
  const movieId = req.params.id;
  try {
    const result = await client.query(
      'SELECT * FROM movie WHERE movie_id = $1', [movieId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).send('<h1>Sorry, no movie here! :(</h1>');
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error', err);
    res.status(500).send('Error');
  }
});

//add movie
app.post('/movies', async (req, res) => {
  const { movie_name, release_year, genre_id } = req.body;

  try {
    const result = await client.query(
      'INSERT INTO movie (movie_name, release_year, genre_id) VALUES ($1, $2, $3) RETURNING *',
      [movie_name, release_year, genre_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding movie', err);
    res.status(500).json({ error: 'Error adding movie' });
  }
});

// remove movie
app.delete('/movies/:id', async (req, res) => {
  const movieId = req.params.id;

  try {
    const result = await client.query(
      'DELETE FROM movie WHERE movie_id = $1 RETURNING *',
      [movieId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('<h1>Sorry, no movie found with that ID, try another ID!</h1>');
    }

    res.json({ message: `Movie with ID ${movieId} removed!` });
  } catch (err) {
    console.error('Error removing movie', err);
    res.status(500).send('Error removing movie');
  }
});

// GENRES!!!!!!!!!!!!!!!!!

app.get('/genres', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM genre');
    res.json(result.rows);
  } catch (err) {
    console.error('Error', err);
    res.status(500).send('Error');
  }
});

//add genre
app.post('/genres', express.json(), async (req, res) => {
  const { genre_name } = req.body;

  try {
    const result = await client.query(
      'INSERT INTO genre (genre_name) VALUES ($1) RETURNING *',
      [genre_name]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding genre', err);
    res.status(500).send('Error adding genre');
  }
});

//USER!!!!!!!!!!!!!!!!!!

app.get('/registeredusers', (req, res) => {
  res.send('<h1>Nothing special here, sorry!</h>');
});

//add user
app.post('/registeredusers', async (req, res) => {
  const { first_name, last_name, username, password, user_birthyear } = req.body;

  //all fields check
    if (!first_name || !last_name || !username || !password || !user_birthyear) {
      return res.status(400).send('Fill all fields');
    }
  
    try {
      const result = await client.query(
        `INSERT INTO registered_user (first_name, last_name, username, password, user_birthyear)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [first_name, last_name, username, password, user_birthyear]
      );
      
      res.status(201).json({
        message: 'User registered! :)',
        user: result.rows[0],
      });
    } catch (err) {
      console.error('Error registering user', err);
      res.status(500).send('Error registering user');
    }
  });


//REVIEWS!!!!!!!!!!!!!!

app.get('/reviews', (req, res) => {
  res.send('<h1>Nothing special here, sorry!</h>');
});

//add reviews
app.post('/reviews', async (req, res) => {
  const { username, review_star, review_text, movie_id } = req.body;

  //all fields filled
  if (!username || !review_star || !review_text || !movie_id) {
    return res.status(400).send('Fill all fields!');
  }

  //stars 0-5
  if (review_star < 0 || review_star > 5) {
    return res.status(400).send('Stars must be 0-5! :)');
  }

  try {
    //checking that user is registered
    const userResult = await client.query('SELECT * FROM registered_user WHERE username = $1', [username]);
    
    if (userResult.rows.length === 0) {
      return res.status(400).send('Please, register first! :)');
    }

    //add review
    const result = await client.query(
      `INSERT INTO review (username, review_star, review_text, movie_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [username, review_star, review_text, movie_id]
    );

    res.status(201).json({
      message: 'Review added! :)',
      review: result.rows[0]
    });
  } catch (err) {
    console.error('Error adding review', err);
    res.status(500).send('Error adding review');
  }
});


//FAVORITES!!!!!!!!!!!!!!!!!!

//favorite movie
app.post('/favorites', async (req, res) => {
  const { username, movie_id } = req.body;

  //check that both fields are filled
  if (!username || !movie_id) {
    return res.status(400).send('Fill both fields, username and movie_id!');
  }

  try {
    //check user is registered
    const userResult = await client.query(
      'SELECT user_id FROM registered_user WHERE username = $1', [username]
    );

    //register first message
    if (userResult.rows.length === 0) {
      return res.status(404).send('Register first! :)');
    }

    //user_id from user
    const user_id = userResult.rows[0].user_id;

    //add favorite movie
    const result = await client.query(
      'INSERT INTO favorite_movie (user_id, movie_id) VALUES ($1, $2) RETURNING *',
      [user_id, movie_id]
    );

    res.status(201).json({
      message: 'Favorite movie added! :)',
      favorite: result.rows[0]
    });

  } catch (err) {
    console.error('Error adding favorite movie', err);
    res.status(500).send('Error adding favorite movie');
  }
});

//favorite movie by username
app.get('/favorites/:username', async (req, res) => {
  const { username } = req.params;

  try {
    //check user
    const userResult = await client.query(
      'SELECT user_id FROM registered_user WHERE username = $1', [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).send('Register first! :)');
    }

    const user_id = userResult.rows[0].user_id;

    //get user favorite movies
    const result = await client.query(
      'SELECT m.movie_name, m.release_year, m.genre_id FROM favorite_movie f ' +
      'JOIN movie m ON f.movie_id = m.movie_id ' +
      'WHERE f.user_id = $1', [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("User doesn't have favorite movies yet! :)");
    }

    //return all favorite movies
    res.status(200).json(result.rows);

  } catch (err) {
    console.error('Error', err);
    res.status(500).send('Error');
  }
});