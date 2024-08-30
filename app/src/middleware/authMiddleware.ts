import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

import { MessageFactory, HttpStatus } from '../factory/Messages';

const MessageFact: MessageFactory = new MessageFactory();

const JWT_SECRET = process.env.JWT_SECRET as string;

class authMiddleware {
    authenticateJWT(req: Request, res: Response, next: NextFunction) {
        const token = req.header('Authorization')?.split(' ')[1];

        if (token == null) {
            return next(MessageFact.createMessage(HttpStatus.UNAUTHORIZED, 'Token mancante')); // return usato per correggere errore con variabile token
        }

        try {
            const verified = jwt.verify(token, JWT_SECRET);

            // Controlla il login se per utente o gateway
            if (verified && (verified as any).username) {
                req.body.user = verified;
            } else if (verified && (verified as any).highway_name && (verified as any).kilometer) {
                req.body.passage = verified;
            } else {
                next(MessageFact.createMessage(HttpStatus.FORBIDDEN, 'Accesso vietato'));
            }
            next();
        } catch (err) {
            next(MessageFact.createMessage(HttpStatus.FORBIDDEN, 'Token non valido'));
        }
    }
}

export default new authMiddleware();