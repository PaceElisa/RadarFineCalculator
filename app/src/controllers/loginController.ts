import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

// Modelli
import User from '../models/User'
import Gateway from '../models/Gateway';

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
        const { username, password }: LoginRequestBody = req.body; //levare password perche serve solo username (qui è usato per il controllo)

        try {
            // Trova l'utente per username e ne ottiene gli attributi
            const user = await User.findOne({ where: { username: username } });

            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Verifica la password in chiaro (si consiglia di utilizzare hash e salatura per la produzione) usare MIDDLEWARE
            if (password !== user.password) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            
            const payload = {
                id: user.id,
                username: user.username,
                role: user.role
            }

            // Crea un token JWT
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            // Ritorna token
            return res.status(200).json({ token: token });
        } catch (error) {
            // Gestisci l'errore con un messaggio generico per evitare di esporre dettagli sensibili
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // metodo per login Gateway 
    async loginGateway(req: Request, res: Response): Promise<Response> {
        const { highway_name, kilometer }: LoginGatewayRequestBody = req.body; //levare password perche serve solo username (qui è usato per il controllo)

        try {
            // Trova l'utente per username e ne ottiene gli attributi
            const gateway = await Gateway.findOne({ where: { highway_name: highway_name, kilometer: kilometer } });

            if (!gateway) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            
            const payload = {
                id: gateway.id,
                highway_name: gateway.highway_name,
                kilometer: gateway.kilometer
            }

            // Crea un token JWT
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            // Ritorna token
            return res.status(200).json({ token: token });
        } catch (error) {
            // Gestisci l'errore con un messaggio generico per evitare di esporre dettagli sensibili
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default new LoginController();
