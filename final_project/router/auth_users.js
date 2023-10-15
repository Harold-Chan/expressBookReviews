const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const fs = require('fs');
const path = require('path');

let users = [];

const isValid = (username)=>{ //check if the username is valid and return boolean
  return /^[A-Za-z0-9]{6,}$/.test(username);
}

const authenticatedUser = (username, password) => {
  const userdb = JSON.parse(fs.readFileSync('users.json', 'utf8'));
  const user = userdb.find((u) => u.username === username);
  if (!user) {
    return false; // User not found
  }
  // Compare the provided password with the stored password
  return user.password === password;
};

//Only registered users can login (Task 7)
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  } else {
    // Create a JWT token for the user
    let token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: 3600 });
    return res.status(200).json({ message: "Login successful", token });
  }
});

// Add a book review (Task 8)
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Extract ISBN and review text from the request query
  const isbn = req.params.isbn;
  const reviewText = req.query.review;
  // Get the username
  let username = req.user.username;
  // Find the book based on the ISBN
  let book = books[isbn];
  // Check if the book with the provided ISBN exists
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  // Find out if the user already has review on the book
  const reviewExists = book.reviews[username] !== undefined;
  if (reviewExists) 
    {successMessage = "Review modified successfully";}
  else 
    {successMessage = "Review added successfully";}
  // Add a new review or replace the existing review by the same user
  book.reviews[username] = reviewText;
  // Save the changes to the original booksdb.js file
  const filePath = path.join(__dirname, 'booksdb.js');
  const formattedBooks = 'let books = ' + JSON.stringify(books, null, 2) + '\n\nmodule.exports=books;\n';
  fs.writeFile(filePath, formattedBooks, (err) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    // Send a success message
    return res.status(200).json({ message: successMessage , book });
  });
});


// Delete a book review (Task 9)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Extract ISBN from the request parameters
  const isbn = req.params.isbn;
  // Get the username from the session
  const username = req.user.username;
  // Find the book based on the ISBN
  const book = books[isbn];
  // Check if the book with the provided ISBN exists
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  // Check if the user has a review for this book
  if (!book.reviews[username]) {
    // User doesn't have a review for this book
    return res.status(404).json({ message: "User has no review for this book" });
  }
  else {
    // Delete the user's review
    delete book.reviews[username];
  // Save the changes to the original booksdb.js file
  const filePath = path.join(__dirname, 'booksdb.js');
  const formattedBooks = 'let books = ' + JSON.stringify(books, null, 2) + '\n\nmodule.exports=books;\n';
  fs.writeFile(filePath, formattedBooks, (err) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    // Send a success message
    return res.status(200).json({ message: "Review deleted successfully", book });
  });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
