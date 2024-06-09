import "dotenv/config.js";
import { MongoClient } from "mongodb";

const uri = process.env.MONGOURI;

const client = new MongoClient(uri);

async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to the MongoDB database");

    global.db = client.db(process.env.MONGODBNAME);

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

connectToMongo().catch(console.dir);
