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
import { MessageFactory } from "../factory/Messages";
import { HttpStatus } from "../factory/Messages";

//Import CustomRequest
import { ICustomRequest } from "./check";


const messageFact: MessageFactory = new MessageFactory();

//create class validateData
class validateData{

    validateRequestId(req:Request, res: Response, next:NextFunction){
        const {id} = req.params;

        //Check if the ID is specified and a valid number
        if(!id || isNaN(Number(id))){
            return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "ID Not Valid"));
        }
        
        next();
    }

    validateTransitDataCreation(req:Request, res: Response, next:NextFunction){
       const {id, enter_at, exit_at, plate, id_segment, weather_conditions, img_route, img_readable} = req.body;



        next();
    }

    async validateGatewayDataCreation(req:Request, res: Response, next:NextFunction){
        const {id,highway_name, kilometer} =req.body;

        if(typeof id !== 'number'){
            return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "Invalid ID. ID must be a number."))
        }

        try{
            //Check if the id provided in the body is already used
            const existingID = await Gateway.findByPk(id);
            if(existingID){
                return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, `The specified ID: ${id} is already used.`));
            }
        }catch(err){
             return next(messageFact.createMessage(HttpStatus.INTERNAL_SERVER_ERROR,`Ops... Something went wrong: ${err}`));
        }


        if(!isStringValid(highway_name)){
            return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "Invalid highway. Highway must be a string."));

        } 

        if(highway_name.length > 32){
            return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, `The highway name specified is too long. Maximum 32 letters. `))
        }
        if(typeof kilometer !== 'number'){
            return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "Invalid kilometer. Kilometer must be a number"));
        }

        try{
            const highway = await Gateway.findOne({
                where: {
                highway_name: highway_name,
                kilometer: kilometer
                }
            });
            if(highway)
            return next(messageFact.createMessage(HttpStatus.BAD_REQUEST,  `This specific gateway ${highway_name} at the ${kilometer} km already exist.`));

            next();

        } catch(err){
            next(messageFact.createMessage(HttpStatus.INTERNAL_SERVER_ERROR, "Ops... Something went wrong!"));
        }

        
    }

    async validateSegmentDataCreation(req:Request, res: Response, next:NextFunction){
        const {id_gateway1, id_gateway2, distance} = req.body;
        
        if((typeof id_gateway1 !== 'number') || (typeof id_gateway2 !== 'number')){
            return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "Invalid gateway ID value. Gateway ID must be a number."));
        }

        //check if the two ID gateway passed are the same
        if(id_gateway1 === id_gateway2){
            return next(messageFact.createMessage(HttpStatus.BAD_REQUEST,"A segment can not have the same ID for gateway 1 and 2. Specificy two different ID."));
        }

        if(typeof distance !== 'number'){
            return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "Invalid distance value. Distance must be a number."));
        }

        try{
            
            
            const segment = await Segment.findOne({
                where:{
                    id_gateway1 : id_gateway1,
                    id_gateway2 : id_gateway2
                }
            });

            if(segment){
                return next(messageFact.createMessage(HttpStatus.BAD_REQUEST,`Record with this IDs already exist.`));
            }
            next();

        }catch(err){
            return next(messageFact.createMessage(HttpStatus.INTERNAL_SERVER_ERROR, "Ops... Something went wrong!"));

        }
    }

    async validateVehicleDataCreation(req:Request, res: Response, next:NextFunction){
        const {plate, vehicle_type, id_user} = req.body;

        if(!isStringValid(plate) || plate.length >10){
            return next(messageFact.createMessage(HttpStatus.BAD_REQUEST,"Invalid plate. Must be a string."))
        }

        if(!isStringValid(vehicle_type)){
            return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "Invalid vehicle type. Must be a string"));
        }

        if(typeof id_user !== 'number'){
            return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "Invalid user ID. Must be a number."))
        }

        try{
            const vehicle = await Vehicle.findByPk(plate);
            if(vehicle){
                return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "A vehicle with this plate already exist."));
            }
            next();

        }catch(error){
            return next(messageFact.createMessage(HttpStatus.INTERNAL_SERVER_ERROR, "Ops... Something went wrong."))
        }
    }

    async validateVehicleDataUpdate(req:Request, res: Response, next:NextFunction){
        const {plate, vehicle_type, id_user} = req.body;
        try{

            const vehicle = await Vehicle.findByPk(plate);

            if((vehicle && !isStringValid(plate)) || plate.length > 7){
                return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "Invalid plate. Must be a string of 7 characters"));
            }

            if((vehicle_type && !isStringValid(vehicle_type)) || vehicle_type.length >32){
                return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "Invalid type of vehicle. Must be a string of maximum 32 characters."));
            }

            if(id_user &&(typeof id_user !== 'number')){
                return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "Invalid user ID. Must me a number."));
            }
            


        }catch(err){
        return next(messageFact.createMessage(HttpStatus.INTERNAL_SERVER_ERROR, "Ops... Something went wrong."));

        }
        next();
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

            //If the gateway ID specified already exist or if ID is not a number
            if(gateway && (typeof gateway !== 'number')){
                return next(messageFact.createMessage(HttpStatus.BAD_REQUEST,`Gateway ID must be a number. Please first check if the specified ID: ${id} already exist.`))
            }

            if(highway_name && (!isStringValid(highway_name) || highway_name.length > 32)){
                return next(messageFact.createMessage(HttpStatus.BAD_REQUEST,"Invalid highway name. Must be a string with maximum 32 characters."));
            }

            if(kilometer && (typeof kilometer !== 'number')){
                return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "Invalid kilometer value. Kilometer must be a number."))
            }
            next();

         }catch(error){
            next(messageFact.createMessage(HttpStatus.INTERNAL_SERVER_ERROR, `Ops... Something went wrong: ${error} `));

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
                req.messages.push(messageFact.createMessage(HttpStatus.OK, "Transit memorized as Unreadable"));
            }else{
                //Plate must be readable and valid, so if not, set img_readable at true
                req.body.img_readable = true;
                req.messages.push(messageFact.createMessage(HttpStatus.OK, "Transit memorized as Readable"));

            }
            
        }else{
            if(!plate || !islicenseplateValid ){
            return next(messageFact.createMessage(HttpStatus.BAD_REQUEST, "Invalid License Plate"));
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