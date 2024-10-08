import { DataTypes, Model, Optional, Sequelize, Op } from 'sequelize';
import { Database } from '../config/database';
import Transit from './Transit';
import Segment from './Segment';
import Gateway from './Gateway';
import Vehicle from './Vehicle';
import User from './User';

// Initialize Sequelize instance from the Database class
const sequelize: Sequelize = Database.getSequelize();

// Interface for the attributes of the Violation model
interface ViolationAttributes {
    id: number;
    id_transit: number;
    fine: number;
    average_speed: number;
    delta: number;
    created_at: Date;
    deleted_at?: Date;
}

// Interface for attributes needed only during creation
interface ViolationCreationAttributes extends Optional<ViolationAttributes, 'id' | 'fine' | 'created_at'> { }

// Definition of the Violation model
class Violation extends Model<ViolationAttributes, ViolationCreationAttributes> implements ViolationAttributes {
    public id!: number;
    public id_transit!: number;
    public fine!: number;
    public average_speed!: number;
    public delta!: number;
    public created_at!: Date;
    public deleted_at?: Date;

    // Method to calculate the fine based on the delta (speed over the limit)
    public async calculateFine(): Promise<void> {
        if (this.delta <= 10) {
            this.fine = 50; // Fine for exceeding the limit by up to 10 km/h
        } else if (this.delta > 10 && this.delta <= 40) {
            this.fine = 200; // Fine for exceeding the limit by 10 to 40 km/h
        } else if (this.delta > 40 && this.delta <= 60) {
            this.fine = 500; // Fine for exceeding the limit by 40 to 60 km/h
        } else {
            this.fine = 1000; // Fine for exceeding the limit by more than 60 km/h
        }
    }

    // Static method to find violations based on vehicle plates and a time period
    static async findViolationsByPlates(plates: string[], startDate: Date, endDate: Date): Promise<Violation[] | null> {
        try {
            const violations = await Violation.findAll({
                attributes: ['id', 'created_at', 'average_speed', ['delta', 'delta_over_speed_limit']],
                where: {
                    created_at: {
                        [Op.between]: [startDate, endDate]  // Filter by date range
                    }
                },
                include: [
                    {
                        model: Transit,
                        attributes: ['plate', ['id', 'transit_id'], 'weather_conditions'],
                        where: {
                            plate: plates
                        },
                        include: [
                            {
                                model: Segment,
                                attributes: ['id', ['distance', 'segment_length']],
                                include: [
                                    {
                                        model: Gateway,
                                        as: 'Gateway1',
                                        attributes: ['highway_name', 'kilometer']
                                    },
                                    {
                                        model: Gateway,
                                        as: 'Gateway2',
                                        attributes: ['highway_name', 'kilometer']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            return violations;
        } catch (err) {
            console.error('Error fetching violations by plates:', err);
            return null;
        }
    }

    // Static method to find the user ID associated with a violation
    static async findViolationUserId(violation_id: number): Promise<number | null> {
        try {
            const violation = await Violation.findOne({
                attributes: ['id'],
                where: { id: violation_id },
                include: [
                    {
                        model: Transit,
                        attributes: ['plate'],
                        include: [
                            {
                                model: Vehicle,
                                attributes: ['id_user'],
                                include: [
                                    {
                                        model: User,
                                        attributes: ['id']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (violation) {
                const transit = violation.get('Transit') as Transit;
                const vehicle = transit.get('Vehicle') as Vehicle;
                const user = vehicle.get('User') as User;
                return user.id;
            }
            return null; // Restituisce null se non trova la violazione
        } catch (err) {
            console.error('Error fetching violation user ID');
            return null;
        }
    }
}

// Model initialization
Violation.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_transit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: Transit,
            key: 'id',
        }
    },
    fine: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    average_speed: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    delta: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
    createdAt: 'created_at',
    updatedAt: false,
    deletedAt: 'deleted_at',
});

// Hook to calculate the fine before creating a violation record
Violation.beforeCreate(async (violation: Violation) => {
    await violation.calculateFine();  // Call the method to calculate the fine
});

// Define associations
Violation.belongsTo(Transit, { foreignKey: 'id_transit', onDelete: 'CASCADE' });

export default Violation;
