import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Database } from '../config/database';
import Gateway from './Gateway';

const sequelize: Sequelize = Database.getSequelize();

// Interface for the attributes of the Segment model
interface SegmentAttributes {
    id: number;
    id_gateway1: number; 
    id_gateway2: number; 
    distance: number;
    deleted_at?: Date; 
}

// Interface for attributes required only during creation
interface SegmentCreationAttributes extends Optional<SegmentAttributes, 'id' | 'distance'> {}

// Define the Segment model
class Segment extends Model<SegmentAttributes, SegmentCreationAttributes> implements SegmentAttributes {
    public id!: number;
    public id_gateway1!: number;
    public id_gateway2!: number;
    public distance!: number;
    public deleted_at?: Date;

    // Instance method to calculate the distance between two gateways
    public async calculateDistance(): Promise<void> {
        const gateway1 = await Gateway.findByPk(this.id_gateway1);
        const gateway2 = await Gateway.findByPk(this.id_gateway2);

        if (gateway1 && gateway2) {
            // Calculate the distance based on the difference in kilometers
            this.distance = Math.abs(gateway1.kilometer - gateway2.kilometer);
        } else {
            this.distance = 0;
        }
    }
}

// Initialize the Segment model
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
        // Validation to ensure id_gateway1 and id_gateway2 are different
        idGatewaysAreDifferent() {
            if (this.id_gateway1 === this.id_gateway2) {
                throw new Error('id_gateway1 and id_gateway2 must be different.');
            }
        }
    } 
});

// Hook to calculate the distance before saving the record
Segment.beforeSave(async (segment: Segment) => {
    if (segment instanceof Segment) {
        await segment.calculateDistance();
    }
});

// Define associations
// A segment belongs to two gateways
Segment.belongsTo(Gateway, { as: 'Gateway1', foreignKey: 'id_gateway1', onDelete: 'CASCADE' });
Segment.belongsTo(Gateway, { as: 'Gateway2', foreignKey: 'id_gateway2', onDelete: 'CASCADE' });

export default Segment;
