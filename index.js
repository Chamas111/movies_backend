const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const { Pool } = require("pg");
app.use(express.json());
const pool = new Pool({
  connectionString: process.env.ELEPHANT_SQL_CONNECTION_STRING,
});
const cors = require("cors");
// Body Parser
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("<h1>hello world</h1>");
});

// get all movies
app.get("/api/movies", (req, res) => {
  pool
    .query("SELECT * FROM movies;")
    .then((data) => {
      res.status(201).json(data.rows);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

// get movie by id
app.get("/api/movies/:movie_id", (req, res) => {
  const movie_id = req.params.movie_id;

  pool
    .query("SELECT * FROM movies WHERE movie_id=$1 ;", [movie_id])
    .then((data) => {
      if (data.rowCount === 0) {
        res.status(404).json({ message: "movie not found" });
      }
      res.json(data.rows[0]);
    })
    .catch((e) => {
      res.status(500).json({ message: e.message });
    });
});

// post movie
/*
 "title": "Bad Behind Bars",
    "genre": "Crime",
    "country": "Canada",
    "url": "https://m.media-amazon.com/images/M/MV5BZDk4Y2RiNTQtZDNiOC00MjUxLWFlZDktMGI0ZjMzY2JiNWYxXkEyXkFqcGdeQXVyMjAwNzczNTU@._V1_.jpg",
    "year": 2023,
    "duration": 88

    */
app.post("/api/movies/", (req, res) => {
  const { title, genre, country, url, year, duration } = req.body;

  pool
    .query(
      "INSERT INTO movies (title, genre, country, url,year, duration) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [title, genre, country, url, year, duration]
    )
    .then((data) => {
      res.status(201).json(data.rows[0]);
    })
    .catch((e) => {
      res.status(500).json({ message: e.message });
    });
});

// Update movie

app.put("/api/movies/:movie_id", (req, res) => {
  const movie_id = req.params.movie_id;
  const { title, genre, country, url, year, duration } = req.body;

  pool
    .query(
      "UPDATE movies SET title=$1, genre=$2,country=$3,url=$4,year=$5,duration=$6 WHERE movie_id=$7 RETURNING *;",
      [title, genre, country, url, year, duration, movie_id]
    )
    .then((data) => {
      console.log("data", data);
      res.status(201).json(data.rows[0]);
    })
    .catch((e) => {
      res.status(500).json({ message: e.message });
    });
});

//delete

app.delete("/api/movies/:movie_id", (req, res) => {
  const movie_id = Number(req.params.movie_id);
  pool
    .query("DELETE FROM movies WHERE movie_id=$1 RETURNING *;", [movie_id])
    .then((data) => {
      res.json(data.rows[0]);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

app.listen(PORT, () => console.log(`server is runing on port ${PORT}`));
