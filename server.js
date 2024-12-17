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
  res.send('<h1>This is the movie API made by MM TIK23SP!</h1><br /><p>/movies</p>');
});

//MOVIES 

app.get('/movies', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM movie');
    res.json(result.rows);
  } catch (err) {
    console.error('Error', err);
    res.status(500).send('Error');
  }
});

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