import { DataTypes, Model, Optional, Sequelize} from 'sequelize';
import { Database } from '../config/database';
import Violation from './Violation';

// Get the Sequelize instance from the Database class
const sequelize: Sequelize = Database.getSequelize();

// Interface for the attributes of the Payment model
interface PaymentAttributes {
    uuid: string;
    id_violation: number;
    is_payed: boolean;
}

// Interface for attributes required only for creation
interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'uuid' | 'is_payed'> { }

// Define the Payment model
class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
    public uuid!: string;
    public id_violation!: number;
    public is_payed!: boolean;
}

// Initialize the Payment model
Payment.init({
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Generate by default a UUID v4
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

// Define associations
Violation.hasOne(Payment, { foreignKey: 'id_violation' });
Payment.belongsTo(Violation, { foreignKey: 'id_violation', onDelete: 'CASCADE' });

export default Payment;