import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Database } from '../config/database';
import Gateway from './Gateway';

const sequelize: Sequelize = Database.getSequelize();

// Interfaccia per gli attributi del modello
interface SegmentAttributes {
    id_gateway1: number; 
    id_gateway2: number; 
    distance: number; //TODO CALCOLO DA SOLO
    deleted_at?: Date; 
}

interface SegmentCreationAttributes extends Optional<SegmentAttributes, 'id_gateway1' | 'id_gateway2'> {}

// Definizione del modello Segment
class Segment extends Model<SegmentAttributes, SegmentCreationAttributes> implements SegmentAttributes {
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
    validate: {
        // id_gateway1 e id_gateway2 devono essere differenti
        idGatewaysAreDifferent() {
            if (this.id_gateway1 === this.id_gateway2) {
                throw new Error('id_gateway1 and id_gateway2 must be different.');
            }
        }
    } 
});

// Definizione delle associazioni
// Un segmento appartiene a due gateway
Segment.belongsTo(Gateway, { as: 'Gateway1', foreignKey: 'id_gateway1', onDelete: 'CASCADE' });
Segment.belongsTo(Gateway, { as: 'Gateway2', foreignKey: 'id_gateway2', onDelete: 'CASCADE' });

export default Segment;
