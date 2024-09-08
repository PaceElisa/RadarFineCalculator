import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import User from '../models/User';
import Gateway from '../models/Gateway';
import Violation from '../models/Violation';

dotenv.config();

//Import factory
import { errorFactory } from "../factory/FailMessage";
import { ErrorMessage } from "../factory/Messages";
// Instantiate the error message factory
const errorMessageFactory: errorFactory = new errorFactory();
// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET as string;

class authMiddleware {
    // Middleware to authenticate JWT tokens
    authenticateJWT(req: Request, res: Response, next: NextFunction) {
        // Extract token from Authorization header
        const token = req.header('Authorization')?.split(' ')[1];

        if (token == null) {
            // If token is missing, pass an error message to the next middleware
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidToken, 'JWT not found'));
        }

        try {
            // Verify the token using the JWT secret
            const verified = jwt.verify(token, JWT_SECRET);
            console.log(verified);
            // Check if the verified token is for a user or a gateway
            if (verified && (verified as any).username) {
                req.body.user = verified; // Attach user information to the request
            } else if (verified && (verified as any).highway_name && (verified as any).kilometer) {
                req.body.gateway = verified; // Attach gateway information to the request
            } else {
                next(errorMessageFactory.createMessage(ErrorMessage.notAuthorized, 'Not authorized'));
            }
            next();
        } catch (err) {
            next(errorMessageFactory.createMessage(ErrorMessage.generalError, 'Invalid JWT'));
        }
    }

    // Middleware to check if the user is an admin (operatore)
    async isAdmin(req: Request, res: Response, next: NextFunction) {
        const user = req.body.user;

        try {
            // Find user by username
            const userData = await User.findUserByUsername(user.username);
            // Verify if the user has the 'admin' role
            if (userData && userData.role === 'admin') {
                next(); // User is an admin, proceed to the next middleware
            } else {
                next(errorMessageFactory.createMessage(ErrorMessage.notAuthorized, 'User not authorized'));
            }
        } catch (err) {
            // Gestisci gli errori generali
            next(errorMessageFactory.createMessage(ErrorMessage.generalError, 'Error while checking logged user'));
        }
    }

    // Middleware to check if the request is from a valid gateway
    async isGateway(req: Request, res: Response, next: NextFunction) {
        const gateway = req.body.gateway;
        try {
            // Find gateway by highway name and kilometer
            const GatewayData = await Gateway.findGatewayByHighwayAndKilometer(gateway.highway_name, gateway.kilometer);
            // Verify if the gateway exists
            if (GatewayData) {
                next(); // Gateway is valid, proceed to the next middleware
            }
        } catch (err) {
            next(errorMessageFactory.createMessage(ErrorMessage.generalError, 'Error while checking logged Gateway'));
        }
    }

    // Middleware to check if the user is an admin or a driver
    async isAdminOrDriver(req: Request, res: Response, next: NextFunction) {
        const user = req.body.user;

        try {
            // Find user by username
            const userData = await User.findUserByUsername(user.username);
            // Verify if the user has 'admin' or 'driver' role
            if (userData && (userData.role === 'admin' || userData.role === 'driver')) {
                req.body.user.role = userData.role; // Attach role to the request
                next(); // User has the required role, proceed to the next middleware
            } else {
                next(errorMessageFactory.createMessage(ErrorMessage.notAuthorized, 'User not authorized'));
            }
        } catch (err) {
            next(errorMessageFactory.createMessage(ErrorMessage.generalError, 'Error while checking logged user'));
        }
    }

    // Middleware to check if the user is an admin or a gateway
    async isAdminOrGateway(req: Request, res: Response, next: NextFunction) {
        const user = req.body.user;
        const gateway = req.body.gateway;
        try {
            // If user information is present, verify if the user is an admin
            if (user) {
                const userData = await User.findUserByUsername(user.username);
                // Verifica se l'utente ha il ruolo di 'admin'
                if (userData && userData.role === 'admin') {
                    console.log(userData?.role);
                    req.body.rolecheck = userData.role; // Attach role to the request
                    return next(); // User is an admin, proceed to the next middleware
                }
            }
            // If gateway information is present, verify if the gateway exists
            if (gateway) {
                const GatewayData = await Gateway.findGatewayByHighwayAndKilometer(gateway.highway_name, gateway.kilometer);
                if (GatewayData) {
                    req.body.rolecheck = 'gateway'; // Attach rolecheck to the request
                    return next(); // Gateway is valid, proceed to the next middleware
                }
            }
            // If neither condition is met, pass an error message to the error handler middleware
            return next(errorMessageFactory.createMessage(ErrorMessage.notAuthorized, 'User/Gateway not authorized'));

        } catch (err) {
            next(errorMessageFactory.createMessage(ErrorMessage.generalError, 'Error while checking logged user/gateway'));
        }
    }

    // Middleware to validate user credentials
    async validateUserCredentials(req: Request, res: Response, next: NextFunction) {
        const { username, password } = req.body;

        // Check if both username and password are provided
        if (!username || !password) {
            return next(errorMessageFactory.createMessage(ErrorMessage.userLoginError, 'Invalid User Credentials'));
        }

        try {
            // Find user by username
            const user = await User.findUserByUsername(username);

            if (!user) {
                return next(errorMessageFactory.createMessage(ErrorMessage.userLoginError, 'User not found'));
            }

            // Verify the provided password
            if (password !== user.password) {
                return next(errorMessageFactory.createMessage(ErrorMessage.userLoginError, 'Invalid User Credentials'));
            }
            // Attach user information to the request for the next middleware
            req.body.user = user;
            next();
        } catch (err) {
            return next(errorMessageFactory.createMessage(ErrorMessage.generalError, 'Error while logging in'));
        }
    }

    // Middleware to validate gateway credentials
    async validateGateway(req: Request, res: Response, next: NextFunction) {
        const { highway_name, kilometer } = req.body;

        // Check if both highway_name and kilometer are provided
        if (!highway_name || !kilometer) {
            return next(errorMessageFactory.createMessage(ErrorMessage.gatewayLoginError, 'Invalid Gateway Credentials'));
        }

        try {
            // Find gateway by highway name and kilometer
            const gateway = await Gateway.findGatewayByHighwayAndKilometer(highway_name, kilometer);

            if (!gateway) {
                return next(errorMessageFactory.createMessage(ErrorMessage.gatewayLoginError, 'Gateway not found'));
            }

            req.body.gateway = gateway; // Attach gateway information to the request for the next middleware
            next();
        } catch (err) {
            return next(errorMessageFactory.createMessage(ErrorMessage.generalError, 'Error while logging in'));
        }
    }

    // Middleware to check if a driver is authorized to view a specific violation
    async driverViolationCheck(req: Request, res: Response, next: NextFunction) {
        const user = req.body.user;
        const id = req.params.id_violation;
        const idViolation = Number(id);
        try {
            // Find user by username
            const userData = await User.findUserByUsername(user.username);
            if (userData && userData.role === 'driver') {
                // Find violation by ID and check if it belongs to the user
                const ViolationUserId = await Violation.findViolationUserId(idViolation);
                if (userData.id === ViolationUserId) {
                    return next() // User is authorized for this violation, proceed to the next middleware
                }
                return next(errorMessageFactory.createMessage(ErrorMessage.notAuthorized, 'User not authorized'));
            }
            next();
        } catch (err) {
            next(errorMessageFactory.createMessage(ErrorMessage.generalError, 'Error while checking logged user'));
        }
    }
}

export default new authMiddleware();