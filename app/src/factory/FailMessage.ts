/**This file contains various concrete products and also a Concrete Creator 
 * of the Pattern Factory Method dedicated to fail messages
 */
import { IMessage, HttpStatus, ErrorMessage, MessageFactory } from "./Messages";


/** Concrete Products - Classes */

class userLoginError extends IMessage{
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        super()
        this.httpStatus = HttpStatus.UNAUTHORIZED;
        this.content = "Unauthorized - User login failed.";
        this.description = description;
    }
}

class driverLoginError extends IMessage{
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        super()
        this.httpStatus = HttpStatus.UNAUTHORIZED;
        this.content = "Unauthorized - Driver login failed.";
        this.description = description;
    }
}

class gatewayLoginError extends IMessage{
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        super()
        this.httpStatus = HttpStatus.UNAUTHORIZED;
        this.content = "Unauthorized - Gateway login failed.";
        this.description = description;
    }
}

class createRecordError extends IMessage{
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        super()
        this.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        this.content = "Internal Server Error - Record creation failed.";
        this.description = description;
    }
}

class updateRecordError extends IMessage{
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        super()
        this.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        this.content = "Internal Server Error - Record update failed.";
        this.description = description;
    }
}

class readRecordError extends IMessage{
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        super()
        this.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        this.content = "Internal Server Error - Record reading failed.";
        this.description = description;
    }
}

class deleteRecordError extends IMessage{
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        super()
        this.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        this.content = "Internal Server Error - Record deletion failed.";
        this.description = description;
    }
}

class notAuthorized extends IMessage{
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        super()
        this.httpStatus = HttpStatus.FORBIDDEN;
        this.content = "Forbidden - Not authorized for this operation.";
        this.description = description;
    }
}

class recordNotFound extends IMessage{
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        super()
        this.httpStatus = HttpStatus.NOT_FOUND;
        this.content = "Not Found - The record was not found or does not exist";
        this.description = description;
    }
}

class recordAlreadyExist extends IMessage{
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        super()
        this.httpStatus = HttpStatus.FORBIDDEN;
        this.content = "Forbidden - Record already exist.";
        this.description = description;
    }
}

class invalidFormat extends IMessage{
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        super()
        this.httpStatus = HttpStatus.BAD_REQUEST;
        this.content = "Bad Request - Format not valid.";
        this.description = description;
    }
}

class invalidPlateFormat extends IMessage{
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        super()
        this.httpStatus = HttpStatus.BAD_REQUEST;
        this.content = "Bad Request - Plate not valid.";
        this.description = description;
    }
}

class generalError extends IMessage{
    httpStatus: number;
    content: string;
    description?: string;

    constructor(description?: string) {
        super()
        this.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        this.content = "Ops... Something went wrong!";
        this.description = description;
    }
}

export class errorFactory implements MessageFactory{
    createMessage(typeMessage: ErrorMessage, description?: string): IMessage {
        switch (typeMessage) {

            case ErrorMessage.userLoginError:
                return new userLoginError(description);

            case ErrorMessage.driverLoginError:
                return new driverLoginError(description);

            case ErrorMessage.gatewayLoginError:
                return new gatewayLoginError(description);
                    
            case ErrorMessage.createRecordError:
                return new createRecordError(description);
                
            case ErrorMessage.updateRecordError:
                return new updateRecordError(description);

            case ErrorMessage.readRecordError:
                return new readRecordError(description);

            case ErrorMessage.deleteRecordError:
                return new deleteRecordError(description);
                    
            case ErrorMessage.notAuthorized:
                return new notAuthorized(description);

            case ErrorMessage.recordNotFound:
                return new recordNotFound(description);

            case ErrorMessage.recordAlreadyExist:
                return new recordAlreadyExist(description);

            case ErrorMessage.invalidFormat:
                return new invalidFormat(description);
                    
            case ErrorMessage.invalidPlateFormat:
                return new invalidPlateFormat(description);

            case ErrorMessage.generalError:
                return new generalError(description);
           
            default:
                throw new Error("HTTP status non supportato.");
        }
    }
}