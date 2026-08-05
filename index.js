const express = require('express');
const app = express();
const PORT = 3000;
const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB //
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

const cdSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  }
});

const CD = mongoose.model("CD", cdSchema, "cds");

app.use(express.json());

// In-memory CD collection
let cds = [
  { id: 1, title: 'Hybrid Theory', artist: 'Linkin Park', genre: 'Rock', year: 2000 },
  { id: 2, title: 'Thriller', artist: 'Michael Jackson', genre: 'Pop', year: 1982 },
  { id: 3, title: 'The Eminem Show', artist: 'Eminem', genre: 'Hip-Hop', year: 2002 },
  { id: 4, title: 'Back in Black', artist: 'AC/DC', genre: 'Rock', year: 1980 },
  { id: 5, title: '21', artist: 'Adele', genre: 'Soul', year: 2011 },
  { id: 6, title: 'Fearless', artist: 'Taylor Swift', genre: 'Country', year: 2008 },
  { id: 7, title: 'Nevermind', artist: 'Nirvana', genre: 'Grunge', year: 1991 },
  { id: 8, title: 'Future Nostalgia', artist: 'Dua Lipa', genre: 'Pop', year: 2020 },
  { id: 9, title: 'American Idiot', artist: 'Green Day', genre: 'Punk Rock', year: 2004 },
  { id: 10, title: 'Good Kid, M.A.A.D City', artist: 'Kendrick Lamar', genre: 'Hip-Hop', year: 2012 }
];

let nextId = 11;

// GET /cds - Return all CDs
app.get('/cds', async (req, res) => {
  const cds = await CD.find();

  res.json(cds);
});

// POST /cds - Add a new CD
app.post('/cds', async (req, res) => {
  const { title, artist, genre, year } = req.body;
  const newCd = new CD({
      title,
      artist,
      genre,
      year
  });

    await newCd.save();

    res.status(201).json(newCd);
});

// PUT /cds/:id - Update an existing CD
app.put('/cds/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, artist, genre, year } = req.body;

  const cd = await CD.findOne({ id: id });

  if (title) cd.title = title;
  if (artist) cd.artist = artist;
  if (genre) cd.genre = genre;
  if (year) cd.year = year;

  await cd.save;

  res.json(cd);
});

// DELETE /cds/:id - Delete a CD
app.delete('/cds/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  const deleted = await CD.findOneAndDelete({ id: id });

  if (!deleted) {
    return res.status(404).json({
      error: "CD not found."
    });
  }

  res.json(deleted);
});

// TODO:
// - Replace in-memory data with a Mongoose model
// - Replace all CRUD operations with MongoDB queries
// - Implement query support for filtering and selecting fields
// - Add proper error checking and validation for inputs and operations

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
