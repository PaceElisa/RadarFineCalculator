import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Database } from '../config/database';
import Gateway from './gateway';

const sequelize: Sequelize = Database.getSequelize();

// Interfaccia per gli attributi del modello
interface SegmentAttributes {
    id_gateway1: number; 
    id_gateway2: number; 
    distance: number;
    deleted_at?: Date; 
}

// Definizione del modello Segment
class Segment extends Model<SegmentAttributes> implements SegmentAttributes {
    public id_gateway1!: number;
    public id_gateway2!: number;
    public distance!: number;
    public deleted_at?: Date;
}

// Inizializzazione del modello
Segment.init({
    id_gateway1: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: Gateway,
            key: 'id'
        }
    },
    id_gateway2: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: Gateway,
            key: 'id'
        }
    },
    distance: {
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
    tableName: 'segments',
    paranoid: true, 
    createdAt: false, 
    updatedAt: false, 
    deletedAt: 'deleted_at', 
});

export default Segment;
