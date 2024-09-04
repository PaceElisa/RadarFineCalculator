import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

//Import factory
import { successFactory } from "../factory/SuccessMessage";
import { errorFactory } from "../factory/FailMessage";
import { HttpStatus, SuccesMessage, ErrorMessage, MessageFactory } from "../factory/Messages";

const errorMessageFactory: errorFactory = new errorFactory();
const successMessageFactory: successFactory = new successFactory();

const JWT_SECRET = process.env.JWT_SECRET as string;

interface LoginRequestBody {
    id: number,
    username: string;
    role: string;
}

interface LoginGatewayRequestBody {
    id: number;
    highway_name: string;
    kilometer: number;
}

class LoginController {
    // metodo per login utente operatore e automobilista 
    async login(req: Request, res: Response): Promise<Response> {
        var result: any;
        let message: any;
        const { id, username, role }: LoginRequestBody = req.body;

        try {
            const payload = {
                id: id,
                username: username,
                role: role
            }

            // Crea un token JWT
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
            // Ritorna token
            if (role === 'admin') {
                message = successMessageFactory.createMessage(SuccesMessage.adminLoginSuccess, 'Login successfull');
            }
            else if (role === 'driver') {
                message = successMessageFactory.createMessage(SuccesMessage.driverLoginSuccess, 'Login successfull');
            }
            result = res.json({ success: message, token: token });
        } catch (error) {
            // Gestisci l'errore con un messaggio generico per evitare di esporre dettagli sensibili
            message = errorMessageFactory.createMessage(ErrorMessage.generalError, 'Error while logging in');
            result = res.json({ error: message });
        }
        return result;
    }

    // metodo per login Gateway 
    async loginGateway(req: Request, res: Response): Promise<Response> {
        var result: any;
        const { id, highway_name, kilometer }: LoginGatewayRequestBody = req.body;

        try {
            const payload = {
                id: id,
                highway_name: highway_name,
                kilometer: kilometer
            }

            // Crea un token JWT
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            // Ritorna token
            const message = successMessageFactory.createMessage(SuccesMessage.gatewayLoginSuccess, 'Login successfull');
            result = res.json({ success: message, token: token });
        } catch (error) {
            // Gestisci l'errore con un messaggio generico per evitare di esporre dettagli sensibili
            const message = errorMessageFactory.createMessage(ErrorMessage.generalError, 'Error while logging in');
            result = res.json({ error: message });
        }
        return result;
    }
}

export default new LoginController();
