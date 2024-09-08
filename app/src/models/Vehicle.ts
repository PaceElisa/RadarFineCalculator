import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Database } from '../config/database';
import User from './User';
import Limit from './Limit';

// Initialize Sequelize instance from the Database class
const sequelize: Sequelize = Database.getSequelize();

// Interface for the attributes of the Vehicle model
interface VehicleAttributes {
    plate: string;
    vehicle_type: string;
    id_user: number;
    deleted_at?: Date;
}

// Interface for attributes needed only during creation
interface VehicleCreationAttributes extends Optional<VehicleAttributes, 'id_user'> {}

// Definition of the Vehicle model
class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
    public plate!: string;
    public vehicle_type!: string;
    public id_user!: number;
    public deleted_at?: Date;

    // Static method to get good weather limits for a vehicle
    public static async getGoodWeatherLimits(plate: string): Promise<number | null> {
        try {
            // Fetch the vehicle along with its associated limits
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
                return limit.good_weather_limits; // Return the good weather limits
            } else {
                console.log(`No limits found for vehicle with plate ${plate}`);
                return null; // Return null if no limits were found
            }
        } catch (error) {
            console.error(`Error fetching good weather limits for plate ${plate}:`, error);
            return null;
        }
    }

    // Static method to get bad weather limits for a vehicle
    public static async getBadWeatherLimits(plate: string): Promise<number | null> {
        try {
            // Fetch the vehicle along with its associated limits
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
                return limit.bad_weather_limits; // Return the bad_weather_limits
            } else {
                console.log(`No limits found for vehicle with plate ${plate}`);
                return null; // Return null if no limits were found
            }
        } catch (error) {
            console.error(`Error fetching bad weather limits for plate ${plate}:`, error);
            return null;
        }
    }
}

// Model initialization
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

// Define associations
Vehicle.belongsTo(User, { foreignKey: 'id_user', onDelete: 'CASCADE' });
Vehicle.belongsTo(Limit, { foreignKey: 'vehicle_type' });

export default Vehicle;
