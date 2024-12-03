const express = require('express');
const app = express();
const port = 3001;
const connection = require('./db');
const bodyParser = require('body-parser');
const fs= require('fs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); 
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.render('login', { errorMessage: null });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Query the database to check if the email and password match
  const query = 'SELECT * FROM user_register WHERE email = ? AND password = ?';
  connection.query(query, [email, password], (error, results) => {
      if (error) {
          console.error('Error executing query:', error);
          res.redirect('/signup');
          return;
      }

      // If there is no user with the provided email and password
      if (results.length === 0) {
        res.render('login', { errorMessage: 'Invalid details, please retype again.' });
          return;
      }
      const user = results[0];
      res.redirect(`/home?user=${JSON.stringify(user)}`);
  });
});
app.post('/register', (req, res) => {
      // Check if email already exists
      const { name, email, password } = req.body;
      const checkEmailQuery = 'SELECT COUNT(*) AS count FROM user_register WHERE email = ?';
      connection.query(checkEmailQuery, [email], (err, results) => {
          if (err) {
              console.error('Error checking email in MySQL: ' + err.stack);
              res.status(500).send('Error checking email');
              return;
          }
  
          const emailExists = results[0].count > 0;
          if (emailExists) {
              res.status(409).send('Email already exists');
              return;
          }
    const sql = 'INSERT INTO user_register (name, email, password) VALUES (?, ?, ?)';
    connection.query(sql, [name, email, password], (err, result) => {
      if (err) {
        console.error('Error storing data in MySQL: ' + err.stack);
        res.status(500).send('Error storing data');
        return;
      }
      console.log('Data stored successfully in MySQL');
      // Redirect to login page upon successful registration
      res.redirect('/');
  });
});
});
app.get('/signup', (req, res) => {
    res.render('signup');
  });
app.get('/library', (req, res) => {
  const userData = JSON.parse(req.query.user);
  connection.query('SELECT * FROM folders WHERE user_email = ?', [userData.email],(error, results, fields) => {
    if (error) {
        console.error('Error querying the database:', error);
        res.status(500).send('Internal Server Error');
        return;
    }

    // Render the data in home.html using EJS
    res.render('library', { user: userData,folders:results });
});

});
app.get('/flash_cards', (req, res) => {
  const userData = JSON.parse(req.query.user);
  connection.query(`SELECT * FROM decks WHERE user_email = ?`, [userData.email], (error, results, fields) => {
    if (error) {
      console.error('Error querying the database1:', error);
      res.status(500).send('Internal Server Error');
      return;
  }
  res.render('flash_cards', { user: userData,decks:results });
  });
});
app.get('/folder', (req, res) => {
  const userData = JSON.parse(req.query.user);
  const folderData=JSON.parse(req.query.folder);
  connection.query('SELECT * FROM files WHERE folder_id= ?', [folderData.id],(error, results, fields) => {
    if (error) {
        console.error('Error querying the database:', error);
        res.status(500).send('Internal Server Error');
        return;
    }
    // Render the data in home.html using EJS
    res.render('lib_folder', { user: userData,folder:folderData,files:results });
});
});
app.get('/deck', (req, res) => {
  const userData = JSON.parse(req.query.user);
  const DeckData=JSON.parse(req.query.deck);
  connection.query('SELECT * FROM cards WHERE deck_id= ?', [DeckData.id],(error, results, fields) => {
    if (error) {
        console.error('Error querying the database:', error);
        res.status(500).send('Internal Server Error');
        return;
    }
    // Render the data in home.html using EJS
    res.render('deck', { user: userData,deck:DeckData,cards:results });
});
});
app.get('/card_game', (req, res) => {
  const userData = JSON.parse(req.query.user);
  const DeckData=JSON.parse(req.query.deck);
  const cards=JSON.parse(req.query.cards);
    // Render the data in home.html using EJS
  cards.sort(() => Math.random() - 0.5);
  console.log(cards);
  res.render('game', { user: userData,deck:DeckData,cards:cards });
});
app.get('/budget_tracker', (req, res) => {
  const userData = JSON.parse(req.query.user);
  connection.query(`SELECT spent_category, SUM(amount) AS total_amount FROM user_expenses WHERE user_email = ? GROUP BY spent_category`, [userData.email], (error, categorySums, fields) => {
    if (error) {
      console.error('Error querying the database1:', error);
      res.status(500).send('Internal Server Error');
      return;
  }
  connection.query('SELECT * FROM user_expenses WHERE user_email = ?', [userData.email],(error, results, fields) => {
    if (error) {
        console.error('Error querying the database:', error);
        res.status(500).send('Internal Server Error');
        return;
    }
  const categoryTotalsArray = categorySums.map(categoryTotal => categoryTotal.total_amount);
  const categoriesArray = categorySums.map(categoryTotal => categoryTotal.spent_category);
  console.log('Categories:', categoriesArray);
  console.log('Category Totals:', categoryTotalsArray);
  res.render('budget_tracker', { user: userData,expenses:results, categoryTotalsArray,categoriesArray});
});
});
});

/*app.get('/home', (req, res) => {
  const userData = JSON.parse(req.query.user);
  res.render('home', { user: userData });
});*/
app.get('/profile', (req, res) => {
  const userData = JSON.parse(req.query.user);
  res.render('profile', { user: userData });
});
app.post('/create_folder', (req, res) => {
  const userData = JSON.parse(req.query.user);
  const folderName = req.body.folderName;
  const userEmail = userData.email; 
  // Insert folder into database
  connection.query('INSERT INTO folders SET ?', {
    user_email: userEmail,
    folder_name: folderName,
  }, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error creating folder');
    } else {
      res.redirect(`/library?user=${JSON.stringify(userData)}`); // Redirect back to library page
    }
  });
});
app.post('/create_deck', (req, res) => {
  const userData = JSON.parse(req.query.user);
  const deckName = req.body.DeckName;
  const userEmail = userData.email; 
  // Insert folder into database
  connection.query('INSERT INTO decks SET ?', {
    user_email: userEmail,
    deck_name: deckName,
  }, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error creating deck');
    } else {
      res.redirect(`/flash_cards?user=${JSON.stringify(userData)}`); // Redirect back to library page
    }
  });
});
app.post('/add_file', (req, res) => {
  const userData = JSON.parse(req.query.user);
  const folder = JSON.parse(req.query.folder);
  const fileName = req.body.FileName;
  const fileContent = req.body.Filedata; // Assuming you store user email in session

  // Insert folder into database
  connection.query('INSERT INTO files SET ?', {
    name: fileName,
      folder_id:folder.id,
      file_data:fileContent,
  }, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error creating file');
    } else {
      res.redirect(`/folder?user=${JSON.stringify(userData)}&folder=${JSON.stringify(folder)}`); 
    }
  });
});
app.post('/add_card', (req, res) => {
  const userData = JSON.parse(req.query.user);
  const deck = JSON.parse(req.query.deck);
  const question = req.body.question;
  const answer = req.body.answer; // Assuming you store user email in session

  // Insert folder into database
  connection.query('INSERT INTO cards SET ?', {
    question: question,
      deck_id:deck.id,
      answer:answer,
  }, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error adding card');
    } else {
      res.redirect(`/deck?user=${JSON.stringify(userData)}&deck=${JSON.stringify(deck)}`); 
    }
  });
});
app.post('/add_expense', (req, res) => {
  const userData = JSON.parse(req.query.user);
  const ExpenseName = req.body.ExpenseName;
  const Expenseamount = req.body.Amount;
  const Expensecat = req.body.Amount_category;
  const userEmail = userData.email; // Assuming you store user email in session

  // Insert folder into database
  connection.query('INSERT INTO user_expenses SET ?', {
    user_email: userEmail,
    exp_name: ExpenseName,
    amount:Expenseamount,
    spent_category:Expensecat
  }, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error creating folder');
    } else {
      res.redirect(`/budget_tracker?user=${JSON.stringify(userData)}`); // Redirect back to library page
    }
  });
});
app.get('/download_file/:id', (req, res) => {
  const fileId = req.params.id;

  // Retrieve file data from the database using fileId
  connection.query('SELECT * FROM files WHERE id = ?', [fileId], (error, results) => {
    if (error || results.length === 0) {
      console.error('Error retrieving file from database:', error);
      res.status(404).send('File not found');
      return;
    }

    const fileData = results[0].content; // Assuming "content" column stores the file data

    // Set appropriate headers to display the content in the browser
    res.setHeader('Content-Type', 'text/plain'); // Adjust based on file type (e.g., 'text/html', 'image/jpeg')
    res.setHeader('Content-Disposition', 'inline'); // Prevent automatic download

    // Send the file content as the response body
    res.send(fileData);
  });
});


// Route to handle form submission for adding tasks
app.post('/add_Task', (req, res) => {
  const userData = JSON.parse(req.query.user);
  const deckName = req.body.DeckName;
  const userEmail = userData.email; 
  const { task, deadline } = req.body;

  // Insert task into database
  const insertTaskQuery = 'INSERT INTO tasks (user_email, task, deadline) VALUES (?, ?, ?)';
  connection.query(insertTaskQuery, [userEmail, task, deadline], (error, results) => {
    if (error) {
      console.error('Error adding task:', error);
      res.status(500).send('Error adding task');
    } else {
    
      res.redirect(`/home?user=${encodeURIComponent(JSON.stringify(userData))}`); // Redirect back to the form
    }
  });
});
app.get('/home', (req, res) => {
  const userData = JSON.parse(req.query.user);
  const userEmail = userData.email;

  // Fetch tasks from the database
  const selectTasksQuery = 'SELECT * FROM tasks WHERE user_email = ?';
  connection.query(selectTasksQuery, [userEmail], (error, results) => {
    if (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).send('Error fetching tasks');
    } else {
      // Render tasks in an HTML page
      res.render('home', { user: userData, tasks: results });
    }
  });
});
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});