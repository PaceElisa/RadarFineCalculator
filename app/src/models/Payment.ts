import { DataTypes, Model, Optional, Sequelize} from 'sequelize';
import { Database } from '../config/database';
import Violation from './Violation';

const sequelize: Sequelize = Database.getSequelize();

// Interfaccia per gli attributi del modello Payment
interface PaymentAttributes {
    uuid: string;
    id_violation: number;
    is_payed: boolean;
}

// Interfaccia per gli attributi necessari solo alla creazione
interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'uuid' | 'is_payed'> { }

// Definizione del modello Payment
class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
    public uuid!: string;
    public id_violation!: number;
    public is_payed!: boolean;
}

// Inizializzazione del modello
Payment.init({
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Genera un UUID v4 di default
        primaryKey: true,
    },
    id_violation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: Violation,
            key: 'id',
        }
    },
    is_payed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize: sequelize,
    tableName: 'payments',
    timestamps: false,
});

// Definizione delle associazioni
Violation.hasOne(Payment, { foreignKey: 'id_violation' });
Payment.belongsTo(Violation, { foreignKey: 'id_violation', onDelete: 'CASCADE' });

export default Payment;