import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

// Modelli
import User from '../models/User'
import Gateway from '../models/Gateway';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface LoginRequestBody {
    username: string;
    password: string;
}

class LoginController {
    public async login(req: Request, res: Response): Promise<Response> {
        const { username, password }: LoginRequestBody = req.body;

        try {
            // Trova l'utente per username
            const user = await User.findOne({ where: { username } });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Verifica la password in chiaro (si consiglia di utilizzare hash e salatura per la produzione) usare MIDDLEWARE
            if (password !== user.password) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            
            // Crea un token JWT
            const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

            return res.status(200).json({ token: token });
        } catch (error) {
            // Gestisci l'errore con un messaggio generico per evitare di esporre dettagli sensibili
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default new LoginController();
