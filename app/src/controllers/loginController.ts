import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

// Modelli
import User from '../models/User'
import Gateway from '../models/Gateway';

import { MessageFactory, HttpStatus } from '../factory/Messages';

const MessageFact: MessageFactory = new MessageFactory();

const JWT_SECRET = process.env.JWT_SECRET as string;

interface LoginRequestBody { //togliere poiche password non serve piu dopo il validator
    username: string;
    password: string;
}

interface LoginGatewayRequestBody { // serve per gateway
    highway_name: string;
    kilometer: number;
}

class LoginController {
    // metodo per login utente operatore e automobilista 
    async login(req: Request, res: Response): Promise<Response> {
        var result: any;
        const { username, password }: LoginRequestBody = req.body; //levare password perche serve solo username (qui è usato per il controllo)

        try {
            // Trova l'utente per username e ne ottiene gli attributi
            const user = await User.findOne({ where: { username: username } });

            if (!user) {
                const message = MessageFact.createMessage(HttpStatus.UNAUTHORIZED, 'Credenziali Utente non valide');
                return res.json({ error: message });
            }

            // Verifica la password in chiaro (si consiglia di utilizzare hash e salatura per la produzione) usare MIDDLEWARE
            if (password !== user.password) {
                const message = MessageFact.createMessage(HttpStatus.UNAUTHORIZED, 'Credenziali Utente non valide');
                return res.json({ error: message });
            }
            
            const payload = {
                id: user.id,
                username: user.username,
                role: user.role
            }

            // Crea un token JWT
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            // Ritorna token
            const message = MessageFact.createMessage(HttpStatus.OK, 'Login effettuato con successo');
            result = res.json({ success: message, token: token });
        } catch (error) {
            // Gestisci l'errore con un messaggio generico per evitare di esporre dettagli sensibili
            const message = MessageFact.createMessage(HttpStatus.INTERNAL_SERVER_ERROR);
            result = res.json({ error: message });
        }
        return result;
    }

    // metodo per login Gateway 
    async loginGateway(req: Request, res: Response): Promise<Response> {
        var result: any;
        const { highway_name, kilometer }: LoginGatewayRequestBody = req.body; //levare password perche serve solo username (qui è usato per il controllo)

        try {
            // Trova l'utente per username e ne ottiene gli attributi
            const gateway = await Gateway.findOne({ where: { highway_name: highway_name, kilometer: kilometer } });

            if (!gateway) {
                const message = MessageFact.createMessage(HttpStatus.UNAUTHORIZED, 'Credenziali Gateway non valide');
                return res.json({ error: message });
            }
            
            const payload = {
                id: gateway.id,
                highway_name: gateway.highway_name,
                kilometer: gateway.kilometer
            }

            // Crea un token JWT
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            // Ritorna token
            const message = MessageFact.createMessage(HttpStatus.OK, 'Login effettuato con successo');
            result = res.json({ success: message, token: token });
        } catch (error) {
            // Gestisci l'errore con un messaggio generico per evitare di esporre dettagli sensibili
            const message = MessageFact.createMessage(HttpStatus.INTERNAL_SERVER_ERROR);
            result = res.json({ error: message });
        }
        return result;
    }
}

export default new LoginController();
