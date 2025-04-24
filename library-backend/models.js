const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcryptjs");

// Author schema
const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
  },
  born: {
    type: Number,
  },
});

// Book schema
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,

    minlength: 5,
  },
  published: {
    type: Number,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
  },
  genres: [{ type: String }],
});

// User schema for authentication
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  favoriteGenre: {
    type: String,
    required: true,
  },
});

userSchema.plugin(uniqueValidator);

const Author = mongoose.model("Author", authorSchema);
const Book = mongoose.model("Book", bookSchema);
const User = mongoose.model("User", userSchema);

module.exports = { Author, Book, User };
