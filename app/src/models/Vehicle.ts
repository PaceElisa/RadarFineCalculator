import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Database } from '../config/database';
import User from './User';

const sequelize: Sequelize = Database.getSequelize();

// Interfaccia per gli attributi del modello
interface VehicleAttributes {
    plate: string;
    type: string;
    id_user: number;
    deleted_at?: Date;
}

// Interfaccia per gli attributi necessari solo alla creazione
interface VehicleCreationAttributes extends Optional<VehicleAttributes, 'id_user'> {}

// Definizione del modello Vehicle
class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
    public plate!: string;
    public type!: string;
    public id_user!: number;
    public deleted_at?: Date;
}

// Inizializzazione del modello
Vehicle.init({
    plate: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING(32),
        allowNull: false,
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

export default Vehicle;
