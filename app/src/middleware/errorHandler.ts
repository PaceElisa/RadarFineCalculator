//Import factory
import { errorFactory } from "../factory/FailMessage";
import { ErrorMessage } from "../factory/Messages";

const errorMessageFactory: errorFactory = new errorFactory();

export function routeNotFound(req: any, res: any, next: any) {
    next(errorMessageFactory.createMessage(ErrorMessage.missingRoute));
}

// Error Handler
export function ErrorHandler(err: any, req: any, res: any, next: any) {
    var response = (err).getMessage();
    
    res.setHeader('Content-Type', response.type).status(response.status).send(JSON.stringify({"response" : response.message}))
}