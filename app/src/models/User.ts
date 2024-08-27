import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Database } from '../config/database';

const sequelize: Sequelize = Database.getSequelize();

// Interfaccia per gli attributi del modello
interface UserAttributes {
    id: number;
    role: string;
    username: string;
    password: string;
    deletedAt?: Date;
}

// Interfaccia per gli attributi necessari solo alla creazione
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// Definizione del modello User
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public role!: string;
    public username!: string;
    public password!: string;
    public deletedAt?: Date;
}

// Inizializzazione del modello
User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    role: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at'
    }
}, {
    sequelize: sequelize,
    tableName: 'users',
    paranoid: true,
    createdAt: false,
    updatedAt: false,
    deletedAt: 'deleted_at',
});

export default User;