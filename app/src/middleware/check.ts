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

class generalCheck{

    //Method that check if the passed ID exists
    checkIDExist(req:Request, res: Response, next:NextFunction){

        next();
    }

    //Method that checks if the passed plate exists
    checkPlateExist(req:Request, res: Response, next:NextFunction){

        next();
    }

    //Check if an image is provided and try to identify the text (plate) present
    checkImage(req:Request, res: Response, next:NextFunction){

        next();
    }

}

//Export an instance of generelCheck
export default new generalCheck();