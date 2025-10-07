import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    // Establish a connection (only once)
    const connection = await mongoose.connect(process.env.DB_CONNECTION, {});

    console.log("MongoDB connection established successfully");

    // Optionally, you can access the underlying database like this:
    const db = await connection.connection.db; // Access the raw database object

    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process if connection fails
  }
};

export default connectToDatabase;
