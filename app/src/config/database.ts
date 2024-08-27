import { Sequelize } from "sequelize"

import * as dotenv from 'dotenv';
dotenv.config();

export class Database{
    private static instance: Database; //pattern SINGLETON
    private sequelize: Sequelize; 

    // Costruttore privato per il pattern Singleton
    private constructor() {
         // Controlla se le variabili sono impostate
         if (
            !process.env.DB_NAME ||
            !process.env.DB_USER ||
            !process.env.DB_PASSWORD ||
            !process.env.DB_HOST ||
            !process.env.DB_PORT
        ) {
            throw new Error("Environment variables are not set");
        }

        // Configura sequelize utilizzando le variabili di ambiente
        this.sequelize = new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASSWORD,
            {
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT),
                dialect: 'postgres',
                logging: false,
            }
        );
    }
    
    // Metodo per ottenere sequelize
    public static getSequelize(): Sequelize {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance.sequelize;
    }
}