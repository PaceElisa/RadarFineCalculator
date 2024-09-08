import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Database } from '../config/database';

// Get the Sequelize instance from the Database class
const sequelize: Sequelize = Database.getSequelize();

// Interface for the attributes of the model
interface GatewayAttributes {
    id: number;
    highway_name: string;
    kilometer: number;
    deleted_at?: Date;
}

// Interface for attributes needed only for creation
interface GatewayCreationAttributes extends Optional<GatewayAttributes, 'id'> { }

// Define the Gateway model
class Gateway extends Model<GatewayAttributes, GatewayCreationAttributes> implements GatewayAttributes {
    public id!: number;
    public highway_name!: string;
    public kilometer!: number;
    public deleted_at?: Date;

    // Static method to find a gateway by highway name and kilometer
    static async findGatewayByHighwayAndKilometer(highway_name: string, kilometer: number): Promise<Gateway | null> {
        try {
            // Search for a gateway with the specified highway name and kilometer
            const gateway = await Gateway.findOne({
                where: {
                    highway_name: highway_name,
                    kilometer: kilometer
                }
            });
            return gateway;
        } catch (error) {
            console.error('Error fetching gateway by highway_name and kilometer:', error);
            return null;
        }
    }
}

// Initialize the Gateway model
Gateway.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    highway_name: {
        type: DataTypes.STRING(32),
        allowNull: false,
    },
    kilometer: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at',
    }
}, {
    sequelize: sequelize,
    tableName: 'gateways',
    paranoid: true,
    createdAt: false,
    updatedAt: false,
    deletedAt: 'deleted_at'
});
// Export the Gateway model
export default Gateway;
