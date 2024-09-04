import { DataTypes, Model, Optional, Sequelize, Op } from 'sequelize';
import { Database } from '../config/database';
import Vehicle from './Vehicle';
import Segment from './Segment';

const sequelize: Sequelize = Database.getSequelize();

// Interfaccia per gli attributi del modello
interface TransitAttributes {
    id: number;
    enter_at: Date;
    exit_at: Date | null;
    plate: string;
    id_segment: number;
    weather_conditions: 'good' | 'bad' | 'fog';
    img_route: string;
    img_readable: boolean;
    deleted_at?: Date;
}

// Interfaccia per gli attributi necessari solo alla creazione
interface TransitCreationAttributes extends Optional<TransitAttributes, 'id'> {}

// Definizione del modello Transit
class Transit extends Model<TransitAttributes, TransitCreationAttributes> implements TransitAttributes {
    public id!: number;
    public enter_at!: Date;
    public exit_at!: Date | null;
    public plate!: string;
    public id_segment! : number;
    public weather_conditions!: 'good' | 'bad' | 'fog';
    public img_route!: string;
    public img_readable!: boolean;
    public deleted_at?: Date;

    // Metodo per ottenere l'ultimo record inserito per una specifica plate
    static async getLastInsertedRecordByPlate(plate: string): Promise<Transit | null> {
        try {
            const lastRecord = await Transit.findOne({
                where: { plate: plate, exit_at: null },
                order: [['enter_at', 'DESC']], // Ordina per `enter_at` in ordine decrescente
            });
            return lastRecord;
        } catch (error) {
            console.error('Error fetching the last inserted record by plate:', error);
            return null;
        }
    }

    // Metodo per ottenere la distanza del segmento
    async getSegmentDistance(): Promise<number | null> {
        try {
            // Trova il segmento corrispondente
            const segment = await Segment.findOne({
                where: {
                    id: this.id_segment,
                }
            });

            if (segment) {
                return segment.distance; // Restituisci la distanza del segmento
            } else {
                console.log(`Segment not found for id_segment: ${this.id_segment}`);
                return null;
            }
        } catch (error) {
            console.error('Error fetching segment distance:', error);
            return null;
        }
    }

    static async findUnreadableTransitsByGateway(gatewayId: number): Promise<Transit[] | null> {
        try {
            const unreadableTransits = await Transit.findAll({
                where: {
                    img_readable: false,
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

// Inizializzazione del modello
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
        allowNull: false,
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

// Definizione delle associazioni
Transit.belongsTo(Vehicle, { foreignKey: 'plate', onDelete: 'CASCADE' });
Transit.belongsTo(Segment, { foreignKey: 'id_segment', onDelete: 'CASCADE' });

export default Transit;
