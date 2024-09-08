import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Database } from '../config/database';

// Initialize Sequelize instance from the Database class
const sequelize: Sequelize = Database.getSequelize();

// Interface for the attributes of the User model
interface UserAttributes {
    id: number;
    role: string;
    username: string;
    password: string;
    deleted_at?: Date;
}

// Interface for attributes needed only during creation
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> { }

// Definition of the User model
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public role!: string;
    public username!: string;
    public password!: string;
    public deleted_at?: Date;

    // Static method to find a user by username
    static async findUserByUsername(username: string): Promise<User | null> {
        try {
            const user = await User.findOne({
                where: {
                    username: username
                }
            });
            return user;
        } catch (error) {
            console.error('Error fetching user by username:', error);
            return null;
        }
    }
}

// Model initialization
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
    deleted_at: {
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