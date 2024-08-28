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
    deletedAt: 'deleted_at',
    validate: {
        // id_gateway1 e id_gateway2 devono essere differenti
        idGatewaysAreDifferent() {
            if (this.id_gateway1 === this.id_gateway2) {
                throw new Error('id_gateway1 and id_gateway2 must be different.');
            }
        }
    }
});

export default Gateway;
