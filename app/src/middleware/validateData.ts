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

//Import CustomRequest
import { ICustomRequest } from "./check";
import Gateway from "../models/Gateway";

const messageFact: MessageFactory = new MessageFactory();

//create class validateData
class validateData{

    validateRequestId(req:Request, res: Response, next:NextFunction){
        const {id} = req.params;

        //Check if the id is specified and a valid number
        if(!id || isNaN(Number(id))){
            return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "ID Not Valid"));
        }
        
        next();
    }

    validateTransitDataCreation(req:Request, res: Response, next:NextFunction){
        //TO DO ... 
        next();
    }

    async validateGatewayDataCreation(req:Request, res: Response, next:NextFunction){
        const {highway_name, kilometer} =req.body;

        if(!isStringValid(highway_name)){
            next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "Invalid highway. Highway must be a string"));

        } 

        if(highway_name.trim().length > 32){
            next(messageFact.createMessage(HttpStatus.BAD_REQUEST, `The highway name specified is too long. Maximum 32 letters. `))
        }
        if(typeof kilometer !== 'number'){
            next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "Invalid kilometer. Kilometer must be a number"));
        }

        try{
        const highway = await Gateway.findOne({
            where: {
            highway_name: highway_name,
            kilometer: kilometer
          }
        });
        if(!highway)
            next(messageFact.createMessage(HttpStatus.BAD_REQUEST,  `This specific gateway ${highway_name} at the ${kilometer} km already exist.`));

        next();

        } catch(err){
            next(messageFact.createMessage(HttpStatus.INTERNAL_SERVER_ERROR, "Ops... Something went wrong!"));
        }

        
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

    validatePlate(req:ICustomRequest, res: Response, next:NextFunction){
        const plateRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;
        const plate:string = req.body.plate;
        const islicenseplateValid: boolean = plateRegex.test(plate);

        //If an image has been uploaded I have to check that the license plate was recognized correctly without stopping the middleware
        if(req.imageUpload){

            if (!req.messages) {
                req.messages = [];
            }

            if(!islicenseplateValid){
                req.body.img_readable = false;//Specificy that the plate is unreadable

                //Set the license plate with a custom license plate assigned as unreadable
                req.body.plate = "ZZ999ZZ";
                req.messages.push(messageFact.createMessage(HttpStatus.OK, "Transit memorized as Unreadable"));
            }else{
                //Plate must be readable and valid, so if not, set img_readable at true
                req.body.img_readable = true;
                req.messages.push(messageFact.createMessage(HttpStatus.OK, "Transit memorized as Readable"));

            }
            
        }else{
            if(!plate || !islicenseplateValid ){
            next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "Invalid License Plate"));
            }
        }
        next();

    }
}

    // Helper function to check if a value is a valid string
    export function isStringValid(value: any): boolean {
    return typeof value === 'string' && value.trim().length > 0;
    }
//Export an instance of validateDAta
export default new validateData();