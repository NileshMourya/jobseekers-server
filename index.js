import app from "./app.js";
import dotenv from "dotenv";
import connectToDatabase from "./util/dbConnection.js";

dotenv.config();

connectToDatabase();
const port = process.env.PORT || 8000;
app.listen(port);
