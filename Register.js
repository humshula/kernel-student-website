const express = require('express');
const app = express();
const port = 3000;

const connection = require('./db');
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); 
app.get('/register_page', (req, res) => {
    res.render('register');
});
app.post('/register', (req, res) => {
    const eventId = req.params.eventId;
    const { username, name, email, password } = req.body;
  
    connection.query('INSERT INTO register(username, name, email, password) VALUES (?, ?, ?, ?)',
      [username, name, email, password],
      (error, results, fields) => {
        if (error) {
          console.error('Error registering user:', error);
          res.status(500).send('Internal Server Error 2345');
          return;
        }
        res.redirect('/');
      });
  });