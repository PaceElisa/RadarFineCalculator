import express from "express";
import path from 'path';
import { Database } from "./config/database";
import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
import router from "./routes/routes";
import * as errorMiddleware from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const sequelize: Sequelize = Database.getSequelize();

// Funzione asincrona per inizializzare la connessione al database e avviare il server
const connectDB = async () => {
    try {
        // Prova a connettersi al database
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};

// chiama la funzione per connettersi al DB
connectDB();

// Middleware per analizzare JSON e URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurazione per servire file statici dalla cartella 'images'
if(process.env.UPLOAD_DIR){
    app.use(`/${process.env.UPLOAD_DIR}`, express.static(path.join(__dirname, `../${process.env.UPLOAD_DIR}`)));
}else{
    app.use('/images', express.static(path.join(__dirname, '../images')));
}

// Uso rotte definite in routes
app.use(router);

// Route not found error
app.all('*', errorMiddleware.routeNotFound);

// Middleware error handler
app.use(errorMiddleware.ErrorHandler);

// Avvia il server Express
app.listen(PORT, () => {
    console.log(`Server listening at ${PORT}`);
});
