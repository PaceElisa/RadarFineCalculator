import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Database } from '../config/database';

// Get the Sequelize instance from the Database class
const sequelize: Sequelize = Database.getSequelize();

// Interface for the attributes of the model
interface LimitAttributes {
    vehicle_type: string;
    good_weather_limits: number;
    bad_weather_limits: number;
}

// Define the Limit model
class Limit extends Model<LimitAttributes> implements LimitAttributes {
    public vehicle_type!: string;
    public good_weather_limits!: number;
    public bad_weather_limits!: number;
}

// Initialize the Limit model
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
// Export the Limit model
export default Limit;