import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import User from '../models/User';
import Gateway from '../models/Gateway';

dotenv.config();

//Import factory
import { successFactory } from "../factory/SuccessMessage";
import { errorFactory } from "../factory/FailMessage";
import { HttpStatus, SuccesMessage, ErrorMessage, MessageFactory } from "../factory/Messages";

const errorMessageFactory: errorFactory = new errorFactory();
const successMessageFactory: successFactory = new successFactory();

const JWT_SECRET = process.env.JWT_SECRET as string;

class authMiddleware {
    // autentica il token JWT
    authenticateJWT(req: Request, res: Response, next: NextFunction) {
        const token = req.header('Authorization')?.split(' ')[1];

        if (token == null) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidToken, 'JWT not found'));
        }

        try {
            const verified = jwt.verify(token, JWT_SECRET);
            console.log(verified);
            // Controlla il login se per utente admin/automobilista o gateway
            if (verified && (verified as any).username) {
                req.body.user = verified;
            } else if (verified && (verified as any).highway_name && (verified as any).kilometer) {
                req.body.gateway = verified;
            } else {
                next(errorMessageFactory.createMessage(ErrorMessage.notAuthorized, 'Not authorized'));
            }
            next();
        } catch (err) {
            next(errorMessageFactory.createMessage(ErrorMessage.generalError, 'Invalid JWT'));
        }
    }

    // controlla se è un operatore (admin)
    async isAdmin(req: Request, res: Response, next: NextFunction) {
        const user = req.body.user;

        try {
            const userData = await User.findUserByUsername(user.username);
            // Verifica il ruolo dell'utente
            if (userData && userData.role === 'admin') {
                next(); // L'utente ha il ruolo richiesto, passa al middleware successivo
            } else {
                next(errorMessageFactory.createMessage(ErrorMessage.notAuthorized, 'User not authorized'));
            }
        } catch (err) {
            // Gestisci gli errori generali
            next(errorMessageFactory.createMessage(ErrorMessage.generalError, 'Error while checking logged user'));
        }
    }

    // controlla se è un operatore (admin) o un automobilista -> filtra per targa
    async isAdminOrDriver(req: Request, res: Response, next: NextFunction) {
        const user = req.body.user;

        try {
            const userData = await User.findUserByUsername(user.username);
            // Verifica il ruolo dell'utente
            if (userData && (userData.role === 'admin' || userData.role === 'driver')) {
                next(); // L'utente ha il ruolo richiesto, passa al middleware successivo
            } else {
                next(errorMessageFactory.createMessage(ErrorMessage.notAuthorized, 'User not authorized'));
            }
        } catch (err) {
            // Gestisci gli errori generali
            next(errorMessageFactory.createMessage(ErrorMessage.generalError, 'Error while checking logged user'));
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
                // Verifica se l'utente ha il ruolo di 'admin'
                if (userData && userData.role === 'admin') {
                    next(); // Passa al middleware successivo se l'utente è un admin
                }
            }
            // Se il gateway è presente nel corpo della richiesta, verifica se esiste
            if (gateway) {
                const GatewayData = await Gateway.findGatewayByHighwayAndKilometer(gateway.highway_name, gateway.kilometer);
                if (GatewayData) {
                    next(); // Passa al middleware successivo se l'utente è gateway
                }
            }
            // Se nessuna delle condizioni è soddisfatta, restituisci un errore
            return next(errorMessageFactory.createMessage(ErrorMessage.notAuthorized, 'User/Gateway not authorized'));

        } catch (err) {
            // Gestisci gli errori generali
            next(errorMessageFactory.createMessage(ErrorMessage.generalError, 'Error while checking logged user/gateway'));
        }
    }

    // controlla se l'utente esiste e se ha inserito la password associata
    async validateUserCredentials(req: Request, res: Response, next: NextFunction) {
        const { username, password } = req.body;

        // Verifica se sono stati forniti username e password
        if (!username || !password) {
            return next(errorMessageFactory.createMessage(ErrorMessage.userLoginError, 'Invalid User Credentials'));
        }

        try {
            const user = await User.findUserByUsername(username);

            if (!user) {
                return next(errorMessageFactory.createMessage(ErrorMessage.userLoginError, 'User not found'));
            }

            // Verifica la password
            if (password !== user.password) {
                return next(errorMessageFactory.createMessage(ErrorMessage.userLoginError, 'Invalid User Credentials'));
            }

            req.body.user = user; // Aggiungi l'utente alla richiesta per il prossimo middleware
            next();
        } catch (err) {
            return next(errorMessageFactory.createMessage(ErrorMessage.generalError, 'Error while logging in'));
        }
    }

    // controlla se il gateway esiste
    async validateGateway(req: Request, res: Response, next: NextFunction) {
        const { highway_name, kilometer } = req.body;

        // Verifica se sono stati forniti highway_name e kilometer
        if (!highway_name || !kilometer) {
            return next(errorMessageFactory.createMessage(ErrorMessage.gatewayLoginError, 'Invalid Gateway Credentials'));
        }

        try {
            const gateway = await Gateway.findGatewayByHighwayAndKilometer(highway_name, kilometer);

            if (!gateway) {
                return next(errorMessageFactory.createMessage(ErrorMessage.gatewayLoginError, 'Gateway not found'));
            }

            req.body.gateway = gateway; // Aggiungi gateway alla richiesta per il prossimo middleware
            next();
        } catch (err) {
            return next(errorMessageFactory.createMessage(ErrorMessage.generalError, 'Error while logging in'));
        }
    }
}

export default new authMiddleware();