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

// Task 10: Get the book list available in the shop using Async/Await + Promise
public_users.get('/', async function (req, res) {
    try {
        const getBooks = () => new Promise((resolve) => {
            resolve(books);
        });
        
        const booksList = await getBooks();
        return res.status(200).json(booksList);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books list", error: error.message });
    }
});

// Task 11: Get book details based on ISBN using Async/Await + Promise
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const getBookByISBN = () => new Promise((resolve, reject) => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject(new Error("Book not found"));
            }
        });

        const bookDetails = await getBookByISBN();
        return res.status(200).json(bookDetails);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});
  
// Task 12: Get book details based on author using Async/Await + Promise
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author.toLowerCase();
        
        const getBooksByAuthor = () => new Promise((resolve) => {
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
            resolve(booksByAuthor);
        });

        const matchedBooks = await getBooksByAuthor();
        
        if (matchedBooks.length > 0) {
            return res.status(200).json(matchedBooks);
        } else { 
            return res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error searching by author" });
    }
});

// Task 13: Get all books based on title using Async/Await + Promise
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title.toLowerCase();
        
        const getBooksByTitle = () => new Promise((resolve) => {
            let filteredBooks = [];
            Object.keys(books).forEach(isbn => {
                if (books[isbn].title.toLowerCase() === title) {
                    filteredBooks.push({
                        isbn: isbn,
                        author: books[isbn].author,
                        title: books[isbn].title,
                        reviews: books[isbn].reviews
                    });
                }
            });
            resolve(filteredBooks);
        });

        const results = await getBooksByTitle();
        
        if (results.length > 0) {
            return res.status(200).json(results);
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
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
