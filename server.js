import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();


const app = express();

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

app.get('/movies', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM movie');
    res.json(result.rows);
  } catch (err) {
    console.error('Error', err);
    res.status(500).send('Error');
  }
});
