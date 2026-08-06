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
  id: {
    type: Number,
    required: true,
    unique: true
  },
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

// // In-memory CD collection
// let cds = [
//   { id: 1, title: 'Hybrid Theory', artist: 'Linkin Park', genre: 'Rock', year: 2000 },
//   { id: 2, title: 'Thriller', artist: 'Michael Jackson', genre: 'Pop', year: 1982 },
//   { id: 3, title: 'The Eminem Show', artist: 'Eminem', genre: 'Hip-Hop', year: 2002 },
//   { id: 4, title: 'Back in Black', artist: 'AC/DC', genre: 'Rock', year: 1980 },
//   { id: 5, title: '21', artist: 'Adele', genre: 'Soul', year: 2011 },
//   { id: 6, title: 'Fearless', artist: 'Taylor Swift', genre: 'Country', year: 2008 },
//   { id: 7, title: 'Nevermind', artist: 'Nirvana', genre: 'Grunge', year: 1991 },
//   { id: 8, title: 'Future Nostalgia', artist: 'Dua Lipa', genre: 'Pop', year: 2020 },
//   { id: 9, title: 'American Idiot', artist: 'Green Day', genre: 'Punk Rock', year: 2004 },
//   { id: 10, title: 'Good Kid, M.A.A.D City', artist: 'Kendrick Lamar', genre: 'Hip-Hop', year: 2012 }
// ];

// let nextId = 11;

// GET /cds - Return all CDs
app.get('/cds', async (req, res) => {
  const filter = {};

  if (req.query.artist) {
    filter.artist = req.query.artist;
  }

  if (req.query.genre) {
    filter.genre = req.query.genre;
  }

  if (req.query.before) {
    filter.year = {$lt: parseInt(req.query.before)
    };
  }

  let query = CD.find(filter);

  if (req.query.fields === "title") {
    query = query.select("title -_id");
  }

  const cds = await query;
  res.json(cds);
});

// POST /cds - Add a new CD
app.post('/cds', async (req, res) => {
  const { title, artist, genre, year } = req.body;

  if (!title || !artist || !genre || year === undefined) {
    return res.status(400).json({
      error: "Title, artist, genre, and year are required."
    });
  }

  if (isNaN(year)) {
    return res.status(400).json({
      error: "Year must be a number."
    });
  }

  try {
    const lastCd = await CD.findOne().sort({ id: -1 });
    const nextId = lastCd ? lastCd.id + 1 : 1;

  

    const newCd = new CD({
        id: nextId,
        title,
        artist,
        genre,
        year
    });

    await newCd.save();

    res.status(201).json(newCd);
  } catch (error) {
    res.status(500).json({
      error: "Unable to add CD."
    });
  }
});


// PUT /cds/:id - Update an existing CD
app.put('/cds/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, artist, genre, year } = req.body;

  const cd = await CD.findOne({ id: id });

  if (!cd) {
    return res.status(404).json({
      error: "CD not found."
    });
  }

  if (title) cd.title = title;
  if (artist) cd.artist = artist;
  if (genre) cd.genre = genre;
  if (year !== undefined) cd.year = year;

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


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
