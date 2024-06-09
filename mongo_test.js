import "dotenv/config.js";
import { MongoClient } from "mongodb";

const uri = process.env.MONGOURI;
const client = new MongoClient(uri);

async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to the MongoDB database");

    const db = client.db(process.env.MONGODBNAME);

    // Find movies with "Despicable" in the title
    const movies = await db
      .collection("movies")
      .find({ title: { $regex: "Despicable", $options: "i" } })
      .project({ title: 1 })
      .toArray();

    console.log(movies);
    debugger;
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  } finally {
    await client.close();
  }
}

async function e1a() {
  try {
    const db = client.db(process.env.MONGODBNAME);
    const movies = await db
      .collection("movies")
      .find({ year: { $gt: 2000 } })
      .project({ title: 1, year: 1 }) // Project both title and year
      .toArray();
    return movies;
  } catch (err) {
    console.error("Failed to retrieve movies", err);
    return [];
  }
}

async function e1b() {
  try {
    const db = client.db(process.env.MONGODBNAME);
    const languages = await db
      .collection("movies")
      .distinct("languages");
    return languages;
  } catch (err) {
    console.error("Failed to retrieve languages", err);
    return [];
  }
}

async function e1c() {
  try {
    const db = client.db(process.env.MONGODBNAME);
    const movies = await db
      .collection("movies")
      .find({
        rated: "PG-13",
        cast: "Ryan Gosling"
      })
      .sort({ year: 1 })
      .project({ title: 1, year: 1 , cast: 1})
      .toArray();
    return movies;
  } catch (err) {
    console.error("Failed to retrieve movies", err);
    return [];
  }
}

async function e1d() {
  try {
    const db = client.db(process.env.MONGODBNAME);
    const genresCount = await db
      .collection("movies")
      .aggregate([
        { $unwind: "$genres" },
        { $group: { _id: "$genres", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
      .toArray();
    return genresCount;
  } catch (err) {
    console.error("Failed to retrieve genre count", err);
    return [];
  }
}

async function e1e() {
  try {
    const db = client.db(process.env.MONGODBNAME);
    const newMovie = {
      title: "Monsters Inc 2",
      director: "Piero Friedrich"
    };
    const result = await db.collection("movies").insertOne(newMovie);
    return result;
  } catch (err) {
    console.error("Failed to insert movie", err);
    return null;
  }
}

async function run() {
  try {
    await client.connect();
    console.log("Connected to the MongoDB database");

    const moviesAfter2000 = await e1a();
    console.log(`All movies after the year 2000:`);
    console.log(moviesAfter2000);

    const distinctLanguages = await e1b();
    console.log(`All distinct languages in all movies:`);
    console.log(distinctLanguages);

    const pg13RyanGoslingMovies = await e1c();
    console.log(`PG-13 movies casting Ryan Gosling, by release date:`);
    console.log(pg13RyanGoslingMovies);

    const genreCounts = await e1d();
    console.log(`Number of movies per genre:`);
    console.log(genreCounts);

    const insertedMovie = await e1e();
    console.log(`New movie inserted:`);
    console.log(insertedMovie);

  } catch (err) {
    console.error("An error occurred", err);
  } finally {
    await client.close();
    console.log("Closed the MongoDB connection");
  }
}

run();

