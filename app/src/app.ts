import express, { Express, Request, Response } from "express";
import { Database } from "./config/database";
import { Sequelize } from "sequelize";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const sequelize: Sequelize = Database.getSequelize();

// Funzione asincrona per inizializzare la connessione al database e avviare il server
const startServer = async () => {
    try {
        // Prova a connettersi al database
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Avvia il server Express solo dopo che la connessione al database è riuscita
        app.listen(PORT, () => {
            console.log(`Server listening at ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};

// Chiama la funzione per avviare l'applicazione
startServer();

app.get("/", (req, res) => {
    res.send("HELLO + TS!");
});

app.get("/hi", (req, res) => {
    res.send("HIIIIIII");
});
