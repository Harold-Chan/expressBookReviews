const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const fs = require('fs');

// Register a new user (Task 6)
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required for registration.' });
  }
  // Read user data from the users.json file
  fs.readFile('users.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    const users = JSON.parse(data);
    // Check if the username already exists
    if (users.find(user => user.username === username)) {
      return res.status(409).json({ message: 'Username already exists. Please choose a different username.' });
    }
    users.push({ username, password });
    // Write the updated user data back to the users.json file
    fs.writeFile('users.json', JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      return res.status(201).json({ message: 'User successfully registered.' });
    });
  });
});

// Function to retrieve available books (For Task 10)
function retrieveAvailableBooks() {
  return new Promise((resolve, reject) => {
    let availableBooks = Object.values(books);
    if (availableBooks) {
      resolve(availableBooks);
    } else {
      reject("Books not found");
    }
  });
}

// Get the book list available in the shop (Task 1)
public_users.get('/', function (req, res) {
  retrieveAvailableBooks()
    .then((availableBooks) => {
      if (availableBooks.length > 0) {
        res.status(200).json(availableBooks);
      } else {
        res.status(404).json({ message: "No books available in the shop" });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: "Internal Server Error" });
    });
});

// Get book details based on ISBN (Task 2 and Task 11)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Simulate an asynchronous operation with a promise
  new Promise((resolve, reject) => {
    // Find the book with the matching ISBN in the 'books' object
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error("Book not found"));
    }
  })
    .then((book) => {
      res.status(200).send(JSON.stringify(book, null, 2));
    })
    .catch((error) => {
      res.status(404).json({ message: error.message });
    });
});

  
// Get book details based on author (Task 3 and Task 12)
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  // Get all the keys (book IDs) from the 'books' object
  const keys = Object.keys(books);
  // Create an array to store books by the specified author
  const booksByAuthor = [];

  // Simulate an asynchronous operation with a promise
  new Promise((resolve) => {
    keys.forEach((key) => {
      if (books[key].author === author) {
        // If a match is found, add the book to the 'booksByAuthor' array
        booksByAuthor.push(books[key]);
      }
    });
    resolve(booksByAuthor);
  })
    .then((matchingBooks) => {
      if (matchingBooks.length === 0) {
        return res.status(404).json({ message: "No books found by the specified author." });
      }
      // If books were found, send a JSON response with the matching books
      res.status(200).send(JSON.stringify(matchingBooks, null, 2));
    });
});

// Get all books based on title (Task 4 and Task 13)
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  // Get all the keys (book IDs) from the 'books' object
  const keys = Object.keys(books);
  // Create an array to store books with the specified title
  const booksByTitle = [];

  // Simulate an asynchronous operation with a promise
  new Promise((resolve) => {
    keys.forEach((key) => {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        // If a match is found, add the book to the 'booksByTitle' array
        booksByTitle.push(books[key]);
      }
    });
    resolve(booksByTitle);
  })
    .then((matchingBooks) => {
      if (matchingBooks.length === 0) {
        return res.status(404).json({ message: "No books found with the specified title." });
      }
      // If books were found, send a JSON response with the matching books
      res.status(200).send(JSON.stringify(matchingBooks, null, 2));
    });
});


//  Get book review (Task 5)
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  // Find the book based on the ISBN in the 'books' object
  const book = books[isbn];
  // Check if the book exists
  if (book) {
    const reviews = book.reviews;
    res.status(200).send(JSON.stringify(reviews, null, 4));
  } else {
    // Book with the specified ISBN not found
    res.status(404).send("Book with the specified ISBN not found.");
  }
});

module.exports.general = public_users;
