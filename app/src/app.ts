import express from "express";
import path from 'path';
import { Database } from "./config/database";
import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
import router from "./routes/routes";
import * as errorMiddleware from "./middleware/errorHandler";

// Load environment variables from a .env file
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000); // Set server port, default to 3000 if not specified
const sequelize: Sequelize = Database.getSequelize(); // Get Sequelize instance from the Database class

// Initialize the database connection and start the server
const connectDB = async () => {
    try {
        // Attempt to connect to the database
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};

// Call the function to connect to the database
connectDB();

// Middleware to parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration to serve static files from the 'images' or env UPLOAD_DIR directory
if(process.env.UPLOAD_DIR){
    app.use(`/${process.env.UPLOAD_DIR}`, express.static(path.join(__dirname, `../${process.env.UPLOAD_DIR}`)));
}else{
    app.use('/images', express.static(path.join(__dirname, '../images')));
}

// Use the routes defined in the routes file
app.use(router);

// Middleware to handle route not found errors (404)
app.all('*', errorMiddleware.routeNotFound);

// Middleware for general error handling
app.use(errorMiddleware.ErrorHandler);

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server listening at ${PORT}`);
});
