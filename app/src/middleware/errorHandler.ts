//Import factory
import { errorFactory } from "../factory/FailMessage";
import { ErrorMessage } from "../factory/Messages";

const errorMessageFactory: errorFactory = new errorFactory();

export function routeNotFound(req: any, res: any, next: any) {
    next(errorMessageFactory.createMessage(ErrorMessage.missingRoute));
}

// Error Handler
export function ErrorHandler(err: any, req: any, res: any, next: any) {
    var message = (err).getMessage();
    // Prepara la risposta completa
    
    const responseBody = {
        status: message.status,
        message: message.message,
        description: message.description, // Aggiungi description se presente
        type: message.type
    };

    // Invia la risposta
    res.setHeader('Content-Type', message.type)
        .status(message.status)
        .send(JSON.stringify(responseBody));

}