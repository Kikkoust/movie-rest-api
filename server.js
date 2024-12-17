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

connect();

async function connect() {

  try{
    await client.connect();
    await client.query("");
    console.log('Database connected');
  } catch (error){
      console.log(error);

  }

};
