// Enum per i codici HttpStatus
export enum HttpStatus {
    OK = 200, 
    CREATED = 201,
    NO_CONTENT = 204, 
    BAD_REQUEST = 400, 
    UNAUTHORIZED = 401, 
    FORBIDDEN = 403, 
    NOT_FOUND = 404, 
    INTERNAL_SERVER_ERROR = 500 
}

// Interfaccia per la Factory di messaggi
interface IMessage {
    httpStatus: number;
    content: string;
    description?: string; // Campo opzionale
}

// SUCCESSO
class OKMessage implements IMessage {
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        this.httpStatus = HttpStatus.OK;
        this.content = "Operazione completata con successo.";
        this.description = description;
    }
}

class CreatedMessage implements IMessage {
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        this.httpStatus = HttpStatus.CREATED;
        this.content = "Risorsa creata con successo.";
        this.description = description;
    }
}

class NoContentMessage implements IMessage {
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        this.httpStatus = HttpStatus.NO_CONTENT;
        this.content = "Operazione completata, nessun contenuto restituito.";
        this.description = description;
    }
}

// ERRORE
class BadRequestMessage implements IMessage {
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        this.httpStatus = HttpStatus.BAD_REQUEST;
        this.content = "Richiesta non valida.";
        this.description = description;
    }
}

class UnauthorizedMessage implements IMessage {
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        this.httpStatus = HttpStatus.UNAUTHORIZED;
        this.content = "Non autorizzato.";
        this.description = description;
    }
}

class ForbiddenMessage implements IMessage {
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        this.httpStatus = HttpStatus.FORBIDDEN;
        this.content = "Accesso vietato.";
        this.description = description;
    }
}

class NotFoundMessage implements IMessage {
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        this.httpStatus = HttpStatus.NOT_FOUND;
        this.content = "Risorsa non trovata.";
        this.description = description;
    }
}

class InternalServerErrorMessage implements IMessage {
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        this.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        this.content = "Errore interno del server.";
        this.description = description;
    }
}

// Factory per creare i messaggi
export class MessageFactory {
    createMessage(httpStatus: HttpStatus, description?: string): IMessage {
        switch (httpStatus) {
            case HttpStatus.OK:
                return new OKMessage(description);
            case HttpStatus.CREATED:
                return new CreatedMessage(description);
            case HttpStatus.NO_CONTENT:
                return new NoContentMessage(description);
            case HttpStatus.BAD_REQUEST:
                return new BadRequestMessage(description);
            case HttpStatus.UNAUTHORIZED:
                return new UnauthorizedMessage(description);
            case HttpStatus.FORBIDDEN:
                return new ForbiddenMessage(description);
            case HttpStatus.NOT_FOUND:
                return new NotFoundMessage(description);
            case HttpStatus.INTERNAL_SERVER_ERROR:
                return new InternalServerErrorMessage(description);
            default:
                throw new Error("HTTP status non supportato.");
        }
    }
}




