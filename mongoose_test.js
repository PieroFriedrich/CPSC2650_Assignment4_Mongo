import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGOURI = process.env.MONGOURI;
const MONGODBNAME = process.env.MONGODBNAME;

if (!MONGOURI) {
  throw new Error("Missing MONGOURI environment variable");
}

async function connectToDatabase() {
  await mongoose.connect(MONGOURI, {
    dbName: MONGODBNAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  director: { type: String, required: true },
  genre: { type: String },
  createdAt: { type: Date, default: Date.now },
  rated: { type: String },
  cast: { type: [String] },
  languages: { type: [String] },
});

const Movie = mongoose.model("Movie", movieSchema);

async function getOneMovie() {
  try {
    const movie = await Movie.findOne({});
    console.log("A movie", movie);
  } catch (err) {
    console.error("Error fetching movies:", err.message);
  }
}

const e2a = async () => {
  try {
    const movies = await Movie.find({ year: { $gt: 2000 } }, 'title year');
    return movies;
  } catch (err) {
    console.error("Error finding movies released after 2000:", err.message);
    return [];
  }
};

const e2b = async () => {
  try {
    const languages = await Movie.distinct("languages");
    return languages;
  } catch (err) {
    console.error("Error finding distinct languages:", err.message);
    return [];
  }
};

const e2c = async () => {
  try {
    const movies = await Movie.find({
      rated: "PG-13",
      cast: "Ryan Gosling"
    }).sort({ year: 1 });
    return movies;
  } catch (err) {
    console.error("Error finding PG-13 movies casting Ryan Gosling:", err.message);
    return [];
  }
};

const e2d = async () => {
  try {
    const genreCounts = await Movie.aggregate([
      { $unwind: "$genre" },
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    return genreCounts;
  } catch (err) {
    console.error("Error finding genre counts:", err.message);
    return [];
  }
};

const e2e = async () => {
  try {
    const newMovie = new Movie({
      title: "Monsters Inc 2",
      year: 2000,
      director: "Piero Friedrich",
      genre: "Animation",
      createdAt: new Date()
    });
    await newMovie.save();
    return newMovie;
  } catch (err) {
    console.error("Error inserting new movie:", err.message);
    return null;
  }
};

const e2f = async () => {
  try {
    const invalidMovie = new Movie({
      title: "Invalid Year Movie",
      year: "whatever",
      director: "Piero Friedrich",
      genre: "Comedy",
      createdAt: new Date()
    });
    await invalidMovie.save();
  } catch (err) {
    console.error("Error inserting movie with invalid year:", err.message);
  }
};

const e2g = async () => {
  try {
    const yourMovies = await Movie.find({ director: "Piero Friedrich", year: {type: String},  });
    return yourMovies;
  } catch (err) {
    console.error("Error finding movies directed by Piero Friedrich:", err.message);
    return [];
  }
};

async function main() {
  try {
    await connectToDatabase();
    await getOneMovie();
    console.log(`All movies after year 2000 ----->`);
    console.log(await e2a());
    console.log(`All distinct languages in all movies ----->`);
    console.log(await e2b());
    console.log(`All PG-13 movies casting Ryan Gosling sorted by release date ----->`);
    console.log(await e2c());
    console.log(`Number of movies per genre ----->`);
    console.log(await e2d());
    console.log(`Inserting a new movie ----->`);
    console.log(await e2e());
    console.log(`Inserting a movie with invalid year ----->`);
    console.log(await e2f());
    console.log(`Movies directed by you ----->`);
    console.log(await e2g());
  } catch (err) {
    console.error(`It blew up! ${err}`);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
}

main();

