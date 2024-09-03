import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Database } from '../config/database';

const sequelize: Sequelize = Database.getSequelize();

// Interfaccia per gli attributi del modello
interface GatewayAttributes {
    id: number;
    highway_name: string;
    kilometer: number;
    deleted_at?: Date; 
}

// Interfaccia per gli attributi necessari solo alla creazione
interface GatewayCreationAttributes extends Optional<GatewayAttributes, 'id'> {}

// Definizione del modello Gateway
class Gateway extends Model<GatewayAttributes, GatewayCreationAttributes> implements GatewayAttributes {
    public id!: number;
    public highway_name!: string;
    public kilometer!: number;
    public deleted_at?: Date;

    static async findGatewayByHighwayAndKilometer(highway_name: string, kilometer: number): Promise<Gateway | null> {
        try {
            const user = await Gateway.findOne({
                where: {
                    highway_name: highway_name,
                    kilometer: kilometer
                }
            });
            return user;
        } catch (error) {
            console.error('Error fetching gateway by highway_name and kilometer:', error);
            throw new Error('Error fetching gateway by highway_name and kilometer');
        }
    }
}

// Inizializzazione del modello
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

export default Gateway;
