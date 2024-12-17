import express from 'express';
import dotenv from 'dotenv';
import pg from 'pg';

const { Client } = pg;

dotenv.config();

const app = express();
const port = 3001;

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

client.connect().then(() => {
    console.log('Connected to PostgreSQL database');
}).catch(err => {
    console.error('Connection error', err.stack);
});




app.get('/users', async (req, res) => {
    try {
      const result = await client.query('SELECT * FROM users'); // Hakee kaikki käyttäjät
      res.json(result.rows); // Palautetaan tiedot JSON-muodossa
    } catch (error) {
      console.error('Database query failed', error);
      res.status(500).json({ error: 'Database query failed' });
    }
});



app.listen(port, () => {
    console.log(`The server is running on http://localhost:${port}`);
});