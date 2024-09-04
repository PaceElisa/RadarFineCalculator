import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import User from '../models/User';
import Gateway from '../models/Gateway';

dotenv.config();

import { MessageFactory, HttpStatus } from '../factory/Messages';

const MessageFact: MessageFactory = new MessageFactory();

const JWT_SECRET = process.env.JWT_SECRET as string;

class authMiddleware {
    // autentica il token JWT
    authenticateJWT(req: Request, res: Response, next: NextFunction) {
        const token = req.header('Authorization')?.split(' ')[1];

        if (token == null) {
            return next(MessageFact.createMessage(HttpStatus.UNAUTHORIZED, 'Token mancante')); // return usato per correggere errore con variabile token
        }

        try {
            const verified = jwt.verify(token, JWT_SECRET);

            // Controlla il login se per utente admin/automobilista o gateway
            if (verified && (verified as any).username) {
                req.body.user = verified;
            } else if (verified && (verified as any).highway_name && (verified as any).kilometer) {
                req.body.gateway = verified;
            } else {
                next(MessageFact.createMessage(HttpStatus.FORBIDDEN, 'Accesso vietato'));
            }
            next();
        } catch (err) {
            next(MessageFact.createMessage(HttpStatus.FORBIDDEN, 'Token non valido'));
        }
    }

    // controlla se è un operatore (admin)
    async isAdmin(req: Request, res: Response, next: NextFunction) {
        const user = req.body.user;

        try {
            // Verifica che l'username sia presente nel corpo della richiesta
            if (!user) {
                return next(); //errore con factory
            }

            // Trova l'utente nel database
            const userData = await User.findUserByUsername(user.username);

            // Verifica se l'utente esiste
            if (!userData) {
                return next(); //errore con factory
            }

            // Verifica il ruolo dell'utente
            if (userData.role === 'admin') {
                next(); // L'utente ha il ruolo richiesto, passa al middleware successivo
            } else {
                return next(); //errore con factory
            }
        } catch (err) {
            // Gestisci gli errori generali
            return next(); //errore con factory
        }
    }

    // controlla se è un operatore (admin) o un automobilista -> filtra per targa
    async isAdminOrDriver(req: Request, res: Response, next: NextFunction) {
        const user = req.body.user;

        try {
            // Verifica che user esista nel body
            if (!user) {
                return next(); //errore con factory
            }

            // Trova l'utente nel database
            const userData = await User.findUserByUsername(user.username);

            // Verifica se l'utente esiste
            if (!userData) {
                return next(); //errore con factory
            }

            // Verifica il ruolo dell'utente
            if (userData.role === 'admin' || userData.role === 'driver') {
                next(); // L'utente ha il ruolo richiesto, passa al middleware successivo
            } else {
                return next(); //errore con factory
            }
        } catch (err) {
            // Gestisci gli errori generali
            return next(); //errore con factory
        }
    }

    // controlla se è un operatore (admin) o un gateway
    async isAdminOrGateway(req: Request, res: Response, next: NextFunction) {
        const user = req.body.user;
        const gateway = req.body.gateway;

        try {
            // Se l'utente è presente nel corpo della richiesta, verifica se è un admin
            if (user) {
                const userData = await User.findUserByUsername(user.username);

                // Verifica se l'utente esiste
                if (!userData) {
                    return next(); //errore con factory
                }

                // Verifica se l'utente ha il ruolo di 'admin'
                if (userData.role === 'admin') {
                    next(); // Passa al middleware successivo se l'utente è un admin
                }
            }

            // Se il gateway è presente nel corpo della richiesta, verifica se esiste
            if (gateway) {
                const gatewayData = await Gateway.findByPk(gateway.id);

                // Verifica se il gateway esiste
                if (gatewayData) {
                    next(); // Passa al middleware successivo se il gateway esiste
                } else {
                    return next(); //errore con factory
                }
            }

            // Se nessuna delle condizioni è soddisfatta, restituisci un errore
            return next(); //errore con factory

        } catch (err) {
            // Gestisci gli errori generali
            return next(); //errore con factory
        }
    }

    // controlla se l'utente esiste e se ha inserito la password associata
    async validateUserCredentials(req: Request, res: Response, next: NextFunction) {
        const { username, password } = req.body;

        // Verifica se sono stati forniti username e password
        if (!username || !password) {
            return next(); //errore con factory
        }

        try {
            const user = await User.findUserByUsername(username);

            if (!user) {
                return next(); //errore con factory
            }

            if (user.password !== password) {
                return next(); //errore con factory
            }

            req.body.user = user; // Aggiungi l'utente alla richiesta per il prossimo middleware
            next();
        } catch (err) {
            return next(); //errore con factory
        }
    }

    // controlla se il gateway esiste
    async validateGateway(req: Request, res: Response, next: NextFunction) {
        const { highway_name, kilometer } = req.body;

        // Verifica se sono stati forniti highway_name e kilometer
        if (!highway_name || !kilometer) {
            return next(); //errore con factory
        }

        try {
            const gateway = await Gateway.findGatewayByHighwayAndKilometer(highway_name, kilometer);

            if (!gateway) {
                return next(); //errore con factory
            }
            
            req.body.gateway = gateway; // Aggiungi gateway alla richiesta per il prossimo middleware
            next();
        } catch (err) {
            return next(); //errore con factory
        }
    }
}

export default new authMiddleware();