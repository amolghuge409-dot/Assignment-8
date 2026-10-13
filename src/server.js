import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const port = Number(process.env.PORT ?? 3000);
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("MONGODB_URI is required. Copy .env.example to .env and set your MongoDB connection string.");
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  const server = app.listen(port, () => {
    console.log(`Student API listening on port ${port}`);
  });

  async function shutdown(signal) {
    console.log(`${signal} received; closing server.`);
    server.close(async (serverError) => {
      try {
        await mongoose.disconnect();
        process.exit(serverError ? 1 : 0);
      } catch (error) {
        console.error("Failed to disconnect from MongoDB:", error);
        process.exit(1);
      }
    });
  }

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
} catch (error) {
  console.error("Could not connect to MongoDB:", error.message);
  process.exit(1);
}
