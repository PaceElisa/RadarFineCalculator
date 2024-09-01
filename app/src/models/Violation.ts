import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Database } from '../config/database';
import Transit from './Transit';

const sequelize: Sequelize = Database.getSequelize();

// Interfaccia per gli attributi del modello Violation
interface ViolationAttributes {
    id: number;
    id_transit: number;
    fine: number;
    average_speed: number;
    delta: number;
    deleted_at?: Date; 
}

// Interfaccia per gli attributi necessari solo alla creazione
interface ViolationCreationAttributes extends Optional<ViolationAttributes, 'id' | 'fine'> {}

// Definizione del modello Violation
class Violation extends Model<ViolationAttributes, ViolationCreationAttributes> implements ViolationAttributes {
    public id!: number;
    public id_transit!: number;
    public fine!: number;
    public average_speed!: number;
    public delta!: number;
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
    },
    average_speed: {
        type: DataTypes.FLOAT,
        allowNull: false,  
    },
    delta: {
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

// Hook per calcolare la multa basata su `delta`
Violation.beforeCreate(async (violation: Violation) => {
    await violation.calculateFine();  // Richiama il metodo di istanza per calcolare la multa
});

// Definizione delle associazioni
Violation.belongsTo(Transit, { foreignKey: 'id_transit', onDelete: 'CASCADE' });

export default Violation;
