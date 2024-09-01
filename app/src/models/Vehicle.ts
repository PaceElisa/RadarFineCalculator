import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Database } from '../config/database';
import User from './User';
import Limit from './Limit';

const sequelize: Sequelize = Database.getSequelize();

// Interfaccia per gli attributi del modello
interface VehicleAttributes {
    plate: string;
    vehicle_type: string;
    id_user: number;
    deleted_at?: Date;
}

// Interfaccia per gli attributi necessari solo alla creazione
interface VehicleCreationAttributes extends Optional<VehicleAttributes, 'id_user'> {}

// Definizione del modello Vehicle
class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
    public plate!: string;
    public vehicle_type!: string;
    public id_user!: number;
    public deleted_at?: Date;

    // Get dei good limits del veicolo
    public static async getGoodWeatherLimits(plate: string): Promise<number | null> {
        try {
            // Fetch the vehicle along with its limits
            const vehicle = await Vehicle.findOne({
                where: { plate },
                include: [{
                    model: Limit,
                    attributes: ['good_weather_limits']
                }]
            });
            
            // Check if the vehicle and associated limits were found
            if (vehicle && vehicle.get('Limit')) {
                const limit = vehicle.get('Limit') as Limit;
                return limit.good_weather_limits; // Access the good_weather_limits
            } else {
                console.log(`No limits found for vehicle with plate ${plate}`);
                return null; // Return null if no limits were found
            }
        } catch (error) {
            console.error(`Error fetching good weather limits for plate ${plate}:`, error);
            throw new Error('Error fetching good weather limits'); // Handle errors properly
        }
    }

    // Get dei bad limits del veicolo
    public static async getBadWeatherLimits(plate: string): Promise<number | null> {
        try {
            // Fetch the vehicle along with its limits
            const vehicle = await Vehicle.findOne({
                where: { plate },
                include: [{
                    model: Limit,
                    attributes: ['bad_weather_limits']
                }]
            });
            
            // Check if the vehicle and associated limits were found
            if (vehicle && vehicle.get('Limit')) {
                const limit = vehicle.get('Limit') as Limit;
                return limit.bad_weather_limits; // Access the bad_weather_limits
            } else {
                console.log(`No limits found for vehicle with plate ${plate}`);
                return null; // Return null if no limits were found
            }
        } catch (error) {
            console.error(`Error fetching bad weather limits for plate ${plate}:`, error);
            throw new Error('Error fetching bad weather limits'); // Handle errors properly
        }
    }
}

// Inizializzazione del modello
Vehicle.init({
    plate: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
    },
    vehicle_type: {
        type: DataTypes.STRING(32),
        allowNull: false,
        references: {
            model: Limit,
            key: 'vehicle_type'
        }
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at',
    }
}, {
    sequelize: sequelize,
    tableName: 'vehicles',
    paranoid: true,
    createdAt: false,
    updatedAt: false,
    deletedAt: 'deleted_at',
});

Vehicle.belongsTo(User, { foreignKey: 'id_user', onDelete: 'CASCADE' });
Vehicle.belongsTo(Limit, { foreignKey: 'vehicle_type' });

export default Vehicle;
