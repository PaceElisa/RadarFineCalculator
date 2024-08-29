import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

class authMiddleware {
    authenticateJWT(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token == null) return res.sendStatus(401);
        
        try {
            const verified = jwt.verify(token, JWT_SECRET);

            // Controlla il login se per utente o gateway
            if (verified && (verified as any).username) {
                req.body.user = verified;
            } else if (verified && (verified as any).highway_name && (verified as any).kilometer) {
                req.body.passage = verified;
            } else {
                return res.sendStatus(403);
            }
            next();
        } catch (err) {
            return res.sendStatus(403);
        }
    }
}

export default new authMiddleware();