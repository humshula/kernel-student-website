import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Set the current working directory to the directory of server.js
process.chdir(__dirname);

// Replace with your own database connection details
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'humshu@8',
  database: 'register',
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Middleware to parse JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/register.html");
});

// Endpoint to handle registration form submissions
app.post('/register', (req, res) => {
  console.log('Received registration request:', req.body);

  const { name_p, email_p, user_p,password_p} = req.body;

  // Insert the registration data into the 'event' table
  const insertQuery = 'INSERT INTO reg (name_p, email_p, user_p, password_p) VALUES (?, ?, ?, ?)';
  const values = [name_p, email_p, user_p,password_p];

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error('Error inserting data into the database:', err);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
      return;
    }

    console.log('Registration successful');
    res.status(200).json({ success: true, message: 'Registration successful' });
    
  });
});

// Close the database connection when the server is shutting down
process.on('SIGINT', () => {
  db.end((err) => {
    if (err) {
      console.error('Error closing the database connection:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit();
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
