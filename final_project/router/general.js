const axios = require('axios');
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



// Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(404).json({ message: "Username and password are required" });
    }

    // Check if username already exists
    const userExists = users.some((user) => user.username === username);

    if (userExists) {
        return res.status(404).json({ message: "Username already exists" });
    }

    // Register the new user
    users.push({ username: username, password: password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
      // Make an asynchronous request to get the books data
      const response = await axios.get("http://localhost:5000/"); 
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books list", error: error.message });
    }
  });
// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
      const response = await axios.get(http://localhost:5000/isbn/${isbn});
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching book details", error: error.message });
    }
  });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    const keys = Object.keys(books);
    let booksByAuthor = [];

    keys.forEach((key) => {
        if (books[key].author.toLowerCase() === author) {
            booksByAuthor.push({
                isbn: key,
                author: books[key].author,
                title: books[key].title,
                reviews: books[key].reviews
            });
        }
    });

    if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
    } else { 
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
      const title = req.params.title.toLowerCase();
      const getBooksByTitle = () => new Promise((resolve) => {
        let filteredBooks = {};
        Object.keys(books).forEach(isbn => {
          if (books[isbn].title.toLowerCase() === title) {
            filteredBooks[isbn] = books[isbn];
          }
        });
        resolve(filteredBooks);
      });
      const results = await getBooksByTitle();
      return res.status(200).json(results);
    } catch (error) {
      return res.status(500).json({ message: "Error searching by title" });
    }
  });

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;