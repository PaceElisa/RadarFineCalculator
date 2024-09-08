import { DataTypes, Model, Optional, Sequelize, Op } from 'sequelize';
import { Database } from '../config/database';
import Vehicle from './Vehicle';
import Segment from './Segment';

// Initialize Sequelize instance from the Database class
const sequelize: Sequelize = Database.getSequelize();

// Interface for the attributes of the Transit model
interface TransitAttributes {
    id: number;
    enter_at: Date;
    exit_at: Date | null;
    plate: string;
    id_segment: number;
    weather_conditions: 'good' | 'bad' | 'fog';
    img_route: string | null;
    img_readable: boolean;
    deleted_at?: Date;
}

// Interface for attributes needed only during creation
interface TransitCreationAttributes extends Optional<TransitAttributes, 'id' | 'enter_at' | 'img_readable'> { }

// Definition of the Transit model
class Transit extends Model<TransitAttributes, TransitCreationAttributes> implements TransitAttributes {
    public id!: number;
    public enter_at!: Date;
    public exit_at!: Date | null;
    public plate!: string;
    public id_segment!: number;
    public weather_conditions!: 'good' | 'bad' | 'fog';
    public img_route!: string | null;
    public img_readable!: boolean;
    public deleted_at?: Date;

    // Static method to get the last inserted record for a specific plate
    static async getLastInsertedRecordByPlate(plate: string): Promise<Transit | null> {
        try {
            const lastRecord = await Transit.findOne({
                where: { plate: plate, exit_at: null },
                order: [['enter_at', 'DESC']],
            });
            return lastRecord;
        } catch (error) {
            console.error('Error fetching the last inserted record by plate:', error);
            return null;
        }
    }

    // Instance method to get the distance of the segment
    async getSegmentDistance(): Promise<number | null> {
        try {
            // Find the corresponding segment
            const segment = await Segment.findOne({
                where: {
                    id: this.id_segment,
                }
            });

            if (segment) {
                return segment.distance; // Return the segment's distance
            } else {
                console.log(`Segment not found for id_segment: ${this.id_segment}`);
                return null;
            }
        } catch (error) {
            console.error('Error fetching segment distance:', error);
            return null;
        }
    }

    // Static method to find unreadable transits by gateway
    static async findUnreadableTransitsByGateway(gatewayId: number): Promise<Transit[] | null> {
        try {
            const unreadableTransits = await Transit.findAll({
                where: {
                    img_readable: false,
                    img_route: { [Op.ne]: null } // Only consider records where `img_route` is not null
                },
                include: [
                    {
                        model: Segment,
                        attributes: ['id'],
                        where: {
                            [Op.or]: [
                                { id_gateway1: gatewayId },
                                { id_gateway2: gatewayId }
                            ]
                        }
                    }
                ]
            });
            return unreadableTransits;
        } catch (error) {
            console.error('Error fetching unreadable transits by gateway:', error);
            return null;
        }
    }
}

// Model initialization
Transit.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    enter_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    exit_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    plate: {
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
            model: Vehicle,
            key: 'plate',
        }
    },
    id_segment: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Segment,
            key: 'id',
        }
    },
    weather_conditions: {
        type: DataTypes.ENUM('good', 'bad', 'fog'),
        allowNull: false,
    },
    img_route: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    img_readable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
        createdAt: false,
        updatedAt: false,
        deletedAt: 'deleted_at',
    });

// Define associations
Transit.belongsTo(Vehicle, { foreignKey: 'plate', onDelete: 'CASCADE' });
Transit.belongsTo(Segment, { foreignKey: 'id_segment', onDelete: 'CASCADE' });

export default Transit;