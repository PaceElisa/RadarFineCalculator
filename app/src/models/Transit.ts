import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Database } from '../config/database';
import Vehicle from './vehicle';
import Segment from './segment';

const sequelize: Sequelize = Database.getSequelize();

// Interfaccia per gli attributi del modello
interface TransitAttributes {
    id: number;
    created_at: Date;
    plate: string;
    id_gateway1: number;
    id_gateway2: number;
    average_speed: number;
    weather_conditions: string;
    delta: number;
    img_route: string;
    img_readable: boolean;
    deleted_at?: Date;
}

// Interfaccia per gli attributi necessari solo alla creazione
interface TransitCreationAttributes extends Optional<TransitAttributes, 'id'> {}

// Definizione del modello Transit
class Transit extends Model<TransitAttributes, TransitCreationAttributes> implements TransitAttributes {
    public id!: number;
    public created_at!: Date;
    public plate!: string;
    public id_gateway1!: number;
    public id_gateway2!: number;
    public average_speed!: number;
    public weather_conditions!: string;
    public delta!: number;
    public img_route!: string;
    public img_readable!: boolean;
    public deleted_at?: Date;
}

// Inizializzazione del modello
Transit.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    plate: {
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
            model: Vehicle,
            key: 'plate',
        }
    },
    id_gateway1: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Segment,
            key: 'id_gateway1',
        }
    },
    id_gateway2: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Segment,
            key: 'id_gateway2',
        }
    },
    average_speed: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    weather_conditions: {
        type: DataTypes.STRING(32),
        allowNull: false,
    },
    delta: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    img_route: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    img_readable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at',
    }
}, 
    {
    sequelize: sequelize,
    tableName: 'transits',
    paranoid: true, 
    createdAt: 'created_at', 
    updatedAt: false, 
    deletedAt: 'deleted_at', 
});

// Definizione delle associazioni
Transit.belongsTo(Vehicle, { foreignKey: 'plate', onDelete: 'CASCADE'});
Transit.belongsTo(Segment, { foreignKey: 'id_gateway1', targetKey: 'id_gateway1', onDelete: 'CASCADE' });
Transit.belongsTo(Segment, { foreignKey: 'id_gateway2', targetKey: 'id_gateway2', onDelete: 'CASCADE' });

export default Transit;
