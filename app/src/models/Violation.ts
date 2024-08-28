import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Database } from '../config/database';
import Transit from './Transit';

const sequelize: Sequelize = Database.getSequelize();

// Interfaccia per gli attributi del modello Violation
interface ViolationAttributes {
    id: number;
    id_transit: number;
    fine: number;
    deleted_at?: Date; 
}

// Interfaccia per gli attributi necessari solo alla creazione
interface ViolationCreationAttributes extends Optional<ViolationAttributes, 'id'> {}

// Definizione del modello Violation
class Violation extends Model<ViolationAttributes, ViolationCreationAttributes> implements ViolationAttributes {
    public id!: number;
    public id_transit!: number;
    public fine!: number;
    public deleted_at?: Date;
}

// Inizializzazione del modello
Violation.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_transit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Transit,  
            key: 'id',       
        }
    },
    fine: {
        type: DataTypes.FLOAT,
        allowNull: false,  
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at', 
    }
}, {
    sequelize: sequelize,
    tableName: 'violations',
    paranoid: true, 
    createdAt: false, 
    updatedAt: false, 
    deletedAt: 'deleted_at', 
});

// Definizione delle associazioni
Violation.belongsTo(Transit, { foreignKey: 'id_transit', onDelete: 'CASCADE' });

export default Violation;
