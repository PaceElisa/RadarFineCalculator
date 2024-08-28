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
            !process.env.POSTGRES_DB ||
            !process.env.POSTGRES_USER ||
            !process.env.POSTGRES_PASSWORD ||
            !process.env.POSTGRES_HOST ||
            !process.env.POSTGRES_PORT
        ) {
            throw new Error("Environment variables are not set");
        }

        // Configura sequelize utilizzando le variabili di ambiente
        this.sequelize = new Sequelize(
            process.env.POSTGRES_DB,
            process.env.POSTGRES_USER,
            process.env.POSTGRES_PASSWORD,
            {
                host: process.env.POSTGRES_HOST,
                port: Number(process.env.POSTGRES_PORT),
                dialect: 'postgres',
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