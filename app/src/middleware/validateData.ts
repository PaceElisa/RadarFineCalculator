//Import neccesary modules
import { Request, Response, NextFunction } from "express";

//Import Models
import Vehicle from "../models/Vehicle";
import Limit from "../models/Limit";
import Segment from "../models/Segment";
import Transit from "../models/Transit";
import User from "../models/User";
import Violation from "../models/Violation";

//create class validateData
class validateData{

    validateRequestId(req:Request, res: Response, next:NextFunction){
        //TO DO ... 
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

}