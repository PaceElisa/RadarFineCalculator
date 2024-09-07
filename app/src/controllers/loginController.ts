import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

// Import factory classes for success and error messages
import { successFactory } from "../factory/SuccessMessage";
import { errorFactory } from "../factory/FailMessage";
import { SuccesMessage, ErrorMessage } from "../factory/Messages";

const errorMessageFactory: errorFactory = new errorFactory();
const successMessageFactory: successFactory = new successFactory();

// Retrieve the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET as string;

// Interface to define the expected structure of the login request body for users
interface LoginRequestBody {
    id: number,
    username: string;
    role: string;
}
// Interface to define the expected structure of the login request body for gateways
interface LoginGatewayRequestBody {
    id: number;
    highway_name: string;
    kilometer: number;
}

class LoginController {
    // Method for logging in user admin (operatori) and drivers
    async login(req: Request, res: Response): Promise<Response> {
        var result: any;
        let message: any;
        const { username }: LoginRequestBody = req.body;

        try {
            // Create a payload for the JWT token containing the username
            const payload = {
                username: username
            }

            // Create a JWT token with an expiration time of 1 hour
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
            // Return the token as part of the response
            message = successMessageFactory.createMessage(SuccesMessage.userLoginSuccess, 'Login successfull');
            result = res.json({ success: message, token: token });
        } catch (error) {
            message = errorMessageFactory.createMessage(ErrorMessage.generalError, 'Error while logging in');
            result = res.json({ error: message });
        }
        return result;
    }

    // Method for logging in Gateways
    async loginGateway(req: Request, res: Response): Promise<Response> {
        var result: any;
        const { id, highway_name, kilometer }: LoginGatewayRequestBody = req.body;

        try {
            // Create a payload for the JWT token containing gateway details
            const payload = {
                id: id,
                highway_name: highway_name,
                kilometer: kilometer
            }

            // Create a JWT token with an expiration time of 1 hour
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            // Return the token as part of the response
            const message = successMessageFactory.createMessage(SuccesMessage.gatewayLoginSuccess, 'Login successfull');
            result = res.json({ success: message, token: token });
        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.generalError, 'Error while logging in');
            result = res.json({ error: message });
        }
        return result;
    }
}
// Export an instance of the LoginController class
export default new LoginController();
