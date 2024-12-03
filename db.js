const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'humshula@8',
  database: 'register',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
  createTablesIfNotExists();
});

function createTablesIfNotExists() {
  createUserRegisterTable();
  createFoldersTable();
  createFilesTable();
  createBudgetTable();
  createDecksTable();
  createCardsTable()
  createTaskTable();
}

function createUserRegisterTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_register (
      name varchar(255),
      email varchar(255),
      password varchar(255),
      PRIMARY KEY (email)
    )
  `;

  connection.query(createTableQuery, (error) => {
    if (error) {
      console.error('Error creating user_register table:', error);
    } else {
      console.log('user_register table created or already exists');
    }
  });
}

function createFoldersTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS folders (
      id INT NOT NULL AUTO_INCREMENT,
      user_email varchar(255) NOT NULL,
      folder_name varchar(255) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE (user_email, folder_name)
    )
  `;

  connection.query(createTableQuery, (error) => {
    if (error) {
      console.error('Error creating folders table:', error);
    } else {
      console.log('folders table created or already exists');
    }
  });
}
function createDecksTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS decks (
      id INT NOT NULL AUTO_INCREMENT,
      user_email varchar(255) NOT NULL,
      deck_name varchar(255) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE (user_email, deck_name)
    )
  `;

  connection.query(createTableQuery, (error) => {
    if (error) {
      console.error('Error creating Decks table:', error);
    } else {
      console.log('Decks table created or already exists');
    }
  });
}
function createFilesTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS files (
      id INT NOT NULL AUTO_INCREMENT,
      name varchar(255) NOT NULL,
      folder_id INT NOT NULL,
      file_data BLOB,
      PRIMARY KEY (id),
      FOREIGN KEY (folder_id) REFERENCES folders(id)
    )
  `;

  connection.query(createTableQuery, (error) => {
    if (error) {
      console.error('Error creating files table:', error);
    } else {
      console.log('files table created or already exists');
    }
  });
}
function createCardsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS cards (
      id INT NOT NULL AUTO_INCREMENT,
      question varchar(255) NOT NULL,
      deck_id INT NOT NULL,
      answer varchar(255) NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (deck_id) REFERENCES decks(id)
    )
  `;

  connection.query(createTableQuery, (error) => {
    if (error) {
      console.error('Error creating cards table:', error);
    } else {
      console.log('files table created or already exists');
    }
  });
}
function createBudgetTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_expenses(
      id INT NOT NULL AUTO_INCREMENT,
      user_email varchar(255) NOT NULL,
      exp_name varchar(255) NOT NULL,
      amount INT NOT NULL,
      spent_category varchar(255) NOT NULL,
      PRIMARY KEY (id)
    )`;
    connection.query(createTableQuery, (error) => {
      if (error) {
        console.error('Error creating budget table:', error);
      } else {
        console.log('budget table created or already exists');
      }
    });
}
function createTaskTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INT NOT NULL AUTO_INCREMENT,
      user_email varchar(255) NOT NULL,
      task varchar(255) NOT NULL,
      deadline Date NOT NULL,
      PRIMARY KEY (id)
    )`;

  connection.query(createTableQuery, (error) => {
    if (error) {
      console.error('Error creating tasks table:', error);
    } else {
      console.log('tasks table created or already exists');
    }
  });
}
module.exports = connection;
