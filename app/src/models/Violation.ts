import { DataTypes, Model, Optional, Sequelize, Op } from 'sequelize';
import { Database } from '../config/database';
import Transit from './Transit';
import Segment from './Segment';
import Gateway from './Gateway';

const sequelize: Sequelize = Database.getSequelize();

// Interfaccia per gli attributi del modello Violation
interface ViolationAttributes {
    id: number;
    id_transit: number;
    fine: number;
    average_speed: number;
    delta: number;
    created_at: Date;
    deleted_at?: Date;
}

// Interfaccia per gli attributi necessari solo alla creazione
interface ViolationCreationAttributes extends Optional<ViolationAttributes, 'id' | 'fine' | 'created_at'> { }

// Definizione del modello Violation
class Violation extends Model<ViolationAttributes, ViolationCreationAttributes> implements ViolationAttributes {
    public id!: number;
    public id_transit!: number;
    public fine!: number;
    public average_speed!: number;
    public delta!: number;
    public created_at!: Date;
    public deleted_at?: Date;

    public async calculateFine(): Promise<void> {
        if (this.delta <= 10) {
            this.fine = 50; // Multa per superamento fino a 10 km/h
        } else if (this.delta > 10 && this.delta <= 40) {
            this.fine = 200; // Multa per superamento tra 10 e 40 km/h
        } else if (this.delta > 40 && this.delta <= 60) {
            this.fine = 500; // Multa per superamento tra 40 e 60 km/h
        } else {
            this.fine = 1000; // Multa per superamento oltre 60 km/h
        }
    }

    // Method to find Violations by plates and by a time period
    static async findViolationsByPlates(plates: string[], startDate: Date, endDate: Date): Promise<Violation[] | null> {
        try {
            const violations = await Violation.findAll({
                attributes: ['average_speed', ['delta', 'delta_over_speed_limit']],
                where: {
                    created_at: {
                        [Op.between]: [startDate, endDate]  // Filter by date range
                    }},
                include: [
                    {
                        model: Transit,
                        attributes: [['id', 'transit_id'],'weather_conditions'],
                        where: {
                            plate: plates
                        },
                        include: [
                            {
                                model: Segment,
                                attributes: ['id', ['distance','segment_length']],
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

// Hook per calcolare la multa basata su `delta`
Violation.beforeCreate(async (violation: Violation) => {
    await violation.calculateFine();  // Richiama il metodo di istanza per calcolare la multa
});

// Definizione delle associazioni
Violation.belongsTo(Transit, { foreignKey: 'id_transit', onDelete: 'CASCADE' });

export default Violation;
