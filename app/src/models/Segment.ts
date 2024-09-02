import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Database } from '../config/database';
import Gateway from './Gateway';

const sequelize: Sequelize = Database.getSequelize();

// Interfaccia per gli attributi del modello
interface SegmentAttributes {
    id: number;
    id_gateway1: number; 
    id_gateway2: number; 
    distance: number;
    deleted_at?: Date; 
}

interface SegmentCreationAttributes extends Optional<SegmentAttributes, 'id'> {}

// Definizione del modello Segment
class Segment extends Model<SegmentAttributes, SegmentCreationAttributes> implements SegmentAttributes {
    public id!: number;
    public id_gateway1!: number;
    public id_gateway2!: number;
    public distance!: number;
    public deleted_at?: Date;

    // Metodo di istanza per calcolare la distanza
    public async calculateDistance(): Promise<void> {
        const gateway1 = await Gateway.findByPk(this.id_gateway1);
        const gateway2 = await Gateway.findByPk(this.id_gateway2);

        if (gateway1 && gateway2) {
            // calcolo della distanza basata sulla differenza tra i chilometri
            this.distance = Math.abs(gateway1.kilometer - gateway2.kilometer);
        } else {
            this.distance = 0;
        }
    }
}

// Inizializzazione del modello
Segment.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_gateway1: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Gateway,
            key: 'id'
        }
    },
    id_gateway2: {
        type: DataTypes.INTEGER,
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

// Hook per calcolare la distanza prima di salvare il record
Segment.beforeSave(async (segment: Segment) => {
    if (segment instanceof Segment) {
        await segment.calculateDistance();
    }
});

// Definizione delle associazioni
// Un segmento appartiene a due gateway
Segment.belongsTo(Gateway, { as: 'Gateway1', foreignKey: 'id_gateway1', onDelete: 'CASCADE' });
Segment.belongsTo(Gateway, { as: 'Gateway2', foreignKey: 'id_gateway2', onDelete: 'CASCADE' });

export default Segment;
