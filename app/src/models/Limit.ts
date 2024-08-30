import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Database } from '../config/database';

const sequelize: Sequelize = Database.getSequelize();

// Interfaccia per gli attributi del modello
interface LimitAttributes {
    vehicle_type: string;
    good_weather_limits: number;
    bad_weather_limits: number;
}

// Definizione del modello User
class Limit extends Model<LimitAttributes> implements LimitAttributes {
    public vehicle_type!: string;
    public good_weather_limits!: number;
    public bad_weather_limits!: number;
}

// Inizializzazione del modello
Limit.init(
    {
        vehicle_type: {
            type: DataTypes.STRING(32),
            primaryKey: true,
            allowNull: false,
        },
        good_weather_limits: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        bad_weather_limits: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize: sequelize,
        tableName: 'limits',
        timestamps: false, 
    }
);

export default Limit;