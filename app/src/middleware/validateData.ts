//Import neccesary modules
import { Request, Response, NextFunction } from "express";

//Import Models
import Vehicle from "../models/Vehicle";
import Limit from "../models/Limit";
import Segment from "../models/Segment";
import Transit from "../models/Transit";
import User from "../models/User";
import Violation from "../models/Violation";

//Import factory
import { MessageFactory } from "../factory/Messages";
import { HttpStatus } from "../factory/Messages";

const MessageFact: MessageFactory = new MessageFactory();

//create class validateData
class validateData{

    validateRequestId(req:Request, res: Response, next:NextFunction){
        const {id} = req.params;

        //Check if the id is specified and a valid number
        if(!id || isNaN(Number(id))){
            return next(MessageFact.createMessage(HttpStatus.BAD_REQUEST, "ID Not Valid"));
        }
        
        next();
    }

    validateTransitDataCreation(req:Request, res: Response, next:NextFunction){
        //TO DO ... 
        next();
    }

    validateGatewayDataCreation(req:Request, res: Response, next:NextFunction){
        //TO DO ... 
        next();
    }

    validateSegmentDataCreation(req:Request, res: Response, next:NextFunction){
        //TO DO ... 
        next();
    }

    validateVehicleDataCreation(req:Request, res: Response, next:NextFunction){
        //TO DO ... 
        next();
    }

    validateVehicleDataUpdate(req:Request, res: Response, next:NextFunction){
        //TO DO ... 
        next();
    }

    validateSegmentDataUpdate(req:Request, res: Response, next:NextFunction){
        //TO DO ... 
        next();
    }

    validateGatewayDataUpdate(req:Request, res: Response, next:NextFunction){
        //TO DO ... 
        next();
    }

    validateTransitDataUpdate(req:Request, res: Response, next:NextFunction){
        //TO DO ... 
        next();
    }

    validatePlate(req:Request, res: Response, next:NextFunction){
        //TO DO ... 
        next();
    }


}
//Export an instance of validateDAta
export default new validateData();