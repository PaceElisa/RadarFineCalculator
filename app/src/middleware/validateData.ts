//Import neccesary modules
import { Request, Response, NextFunction } from "express";

//Import Models
import Vehicle from "../models/Vehicle";
import Limit from "../models/Limit";
import Segment from "../models/Segment";
import Transit from "../models/Transit";
import User from "../models/User";
import Violation from "../models/Violation";
import Gateway from "../models/Gateway";

//Import factory
import { successFactory } from "../factory/SuccessMessage";
import { errorFactory } from "../factory/FailMessage";
import { HttpStatus, SuccesMessage, ErrorMessage, MessageFactory } from "../factory/Messages";

//Import CustomRequest
import { ICustomRequest } from "./check";


const errorMessageFactory: errorFactory = new errorFactory();
const successMessageFactory: successFactory = new successFactory();

//create class validateData
class validateData{

    validateRequestId(req:Request, res: Response, next:NextFunction){
        const {id} = req.params;

        //Check if the ID is specified and a valid number
        if(!id || isNaN(Number(id))){
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "ID Not Valid"));
        }
        
        next();
    }

    validateTransitDataCreation(req:Request, res: Response, next:NextFunction){
       const {id, enter_at, exit_at, plate, id_segment, weather_conditions, img_route, img_readable} = req.body;



        next();
    }

    async validateGatewayDataCreation(req:Request, res: Response, next:NextFunction){
        const {id,highway_name, kilometer} =req.body;

        if( id){
            return next(errorMessageFactory.createMessage(ErrorMessage.noManualRecordIDChange))
        }

        if(!isStringValid(highway_name)){
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid highway. Highway must be a string."));

        } 

        if(highway_name.length > 32){
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, `The highway name specified is too long. Maximum 32 letters. `))
        }
        if(typeof kilometer !== 'number'){
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid kilometer. Kilometer must be a number"));
        }

        try{
            const highway = await Gateway.findOne({
                where: {
                highway_name: highway_name,
                kilometer: kilometer
                }
            });
            if(highway)
            return next(errorMessageFactory.createMessage(ErrorMessage.recordAlreadyExist,  `This specific gateway ${highway_name} at the ${kilometer} km already exist.`));

            next();

        } catch(error){
            next(errorMessageFactory.createMessage(ErrorMessage.generalError, `Error: ${error}.`));
        }

        
    }

    async validateSegmentDataCreation(req:Request, res: Response, next:NextFunction){
        const {id_gateway1, id_gateway2, distance} = req.body;
        
        if((typeof id_gateway1 !== 'number') || (typeof id_gateway2 !== 'number')){
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid gateway ID value. Gateway ID must be a number."));
        }

        //check if the two ID gateway passed are the same
        if(id_gateway1 === id_gateway2){
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat,"A segment can not have the same ID for gateway 1 and 2. Specificy two different ID."));
        }

        if(typeof distance !== 'number'){
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid distance value. Distance must be a number."));
        }

        try{
            
            
            const segment = await Segment.findOne({
                where:{
                    id_gateway1 : id_gateway1,
                    id_gateway2 : id_gateway2
                }
            });

            if(segment){
                return next(errorMessageFactory.createMessage(ErrorMessage.recordAlreadyExist,`Record with this IDs already exist.`));
            }
            next();

        }catch(error){
            return next(errorMessageFactory.createMessage(ErrorMessage.generalError, `Error: ${error}.`));

        }
    }

    async validateVehicleDataCreation(req:Request, res: Response, next:NextFunction){
        const {plate, vehicle_type, id_user} = req.body;

        if(!isStringValid(plate) || plate.length >10){
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidPlateFormat,"Invalid plate. Must be a string."))
        }

        if(!isStringValid(vehicle_type)){
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid vehicle type. Must be a string"));
        }

        if(typeof id_user !== 'number'){
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid user ID. Must be a number."))
        }

        try{
            const vehicle = await Vehicle.findByPk(plate);
            if(vehicle){
                return next(errorMessageFactory.createMessage(ErrorMessage.recordAlreadyExist, "A vehicle with this plate already exist."));
            }
            next();

        }catch(error){
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, ))
        }
    }

    async validateVehicleDataUpdate(req:Request, res: Response, next:NextFunction){
        const {plate, vehicle_type, id_user} = req.body;
        try{

            const vehicle = await Vehicle.findByPk(plate);

            if((vehicle && !isStringValid(plate)) || plate.length > 7){
                return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid plate. Must be a string of 7 characters"));
            }

            if((vehicle_type && !isStringValid(vehicle_type)) || vehicle_type.length >32){
                return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid type of vehicle. Must be a string of maximum 32 characters."));
            }

            if(id_user &&(typeof id_user !== 'number')){
                return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid user ID. Must me a number."));
            }
            next();


        }catch(error){
        return next(errorMessageFactory.createMessage(ErrorMessage.generalError, `Error: ${error}`));

        }
        
    }

    async validateSegmentDataUpdate(req:Request, res: Response, next:NextFunction){
        const {id_gateway1, id_gateway2, distance} = req.body;
        
        
        //To DO: se la distanza viene specificata, controllare che sia un numero e che sia corretta


        next();
    }

    async validateGatewayDataUpdate(req:Request, res: Response, next:NextFunction){
         const {id, highway_name, kilometer} = req.body;
         try{

            const gateway = await Gateway.findByPk(id);
            if(typeof id !== 'number'){
                return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid gateway ID. Gateway ID must be a number"))
            }

            //If the gateway ID specified already exist or if ID is not a number
            if(gateway && (typeof id !== 'number')){
                return next(errorMessageFactory.createMessage(ErrorMessage.readRecordError,`Please first check if the specified ID: ${id} already exist.`))
            }

            if(highway_name && (!isStringValid(highway_name) || highway_name.length > 32)){
                return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat,"Invalid highway name. Must be a string with maximum 32 characters."));
            }

            if(kilometer && (typeof kilometer !== 'number')){
                return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid kilometer value. Kilometer must be a number."))
            }
            next();

         }catch(error){
            next(errorMessageFactory.createMessage(ErrorMessage.generalError, `Error: ${error}. `));

         }
        
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
                req.messages.push(successMessageFactory.createMessage(SuccesMessage.createRecordSuccess, "Transit memorized as Unreadable"));
            }else{
                //Plate must be readable and valid, so if not, set img_readable at true
                req.body.img_readable = true;
                req.messages.push(successMessageFactory.createMessage(SuccesMessage.createRecordSuccess, "Transit memorized as Readable"));

            }
            
        }else{
            if(!plate || !islicenseplateValid ){
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidPlateFormat, "Invalid License Plate"));
            }
        }
        next();

    }

    validateCredentials(req: Request, res: Response, next: NextFunction){
        //TO DO ...

    }
}

    // Helper function to check if a value is a valid string
    export function isStringValid(value: any): boolean {
    return typeof value === 'string' && value.trim().length > 0;
    }
//Export an instance of validateDAta
export default new validateData();