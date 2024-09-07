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
import { SuccesMessage, ErrorMessage } from "../factory/Messages";

//Import CustomRequest
import { ICustomRequest } from "./check";

//Initialize error and success message factory
const errorMessageFactory: errorFactory = new errorFactory();
const successMessageFactory: successFactory = new successFactory();

//Enum for checking weather
enum Weather {
    Good = 'good',
    Bad = 'bad',
    Fog = 'fog'
}

//create class validateData
class validateData {

    //Middleware that validate the ID parameter provieded in the request
    validateRequestId(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        //Check if the ID is specified and a valid number
        if (!id || isNaN(Number(id))) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "ID Not Valid"));
        }

        next();
    }

    //Middleware that validate data for creating a new transit record
    async validateTransitDataCreation(req: ICustomRequest, res: Response, next: NextFunction) {
        const { id, enter_at, exit_at, id_segment, weather_conditions } = req.body;
        const iso8601DateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;


        //Check if the record Id was input manually
        if (id) {
            return next(errorMessageFactory.createMessage(ErrorMessage.noManualRecordIDChange));
        }

        // Check the format and the type of enter_at and exit_at, if provided, otherwise added server side
        if (enter_at && (!isStringValid(enter_at) || !iso8601DateRegex.test(enter_at))) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid enter_at format. Expect AAAA-MM-GGTHH:MM:SSZ"))
        }

        if (exit_at && (!isStringValid(exit_at) || !iso8601DateRegex.test(exit_at))) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid enter_at format. Expect AAAA-MM-GGTHH:MM:SSZ"))
        }

        //Check if weather_condition is a string and one of those three (good, bad, fog)
        //Returns an array containing all Weather enum values, then cast weather_condition as Weather type and finally check if weather condition is includeded in the enum weather values
        if ((!isStringValid(weather_conditions)) || !Object.values(Weather).includes(weather_conditions as Weather)) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, `Invalid weather_condition. Weather_condition must be a string and one of ${Object.values(Weather).join(',')}`));
        }



        try {
            const segment = await Segment.findByPk(id_segment);

            //Check if id_segment correspond to an existing segment
            if (!segment) {
                return next(errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `The record of the segment with this id: ${id_segment} was not found or does not exist.`))
            }
            next();

        } catch (error) {
            return next(errorMessageFactory.createMessage(ErrorMessage.generalError, `Error: ${error}.`));

        }

    }

    //Middleware that validate data for creating a new gateway record
    async validateGatewayDataCreation(req: Request, res: Response, next: NextFunction) {
        const { id, highway_name, kilometer } = req.body;

        //Check if the record Id was input manually
        if (id) {
            return next(errorMessageFactory.createMessage(ErrorMessage.noManualRecordIDChange))
        }

        //Verify if highway_name is a string of maximum 32 characters
        if ((!isStringValid(highway_name)) || highway_name.length > 32) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid highway. Highway must be a string of maximum 32 characters."));
        }

        //Verify if kilometer is a number
        if (typeof kilometer !== 'number') {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid kilometer. Kilometer must be a number"));
        }

        try {
            const highway = await Gateway.findOne({
                where: {
                    highway_name: highway_name,
                    kilometer: kilometer
                }
            });

            //Check if a record, with the same attributes, exists
            if (highway)
                return next(errorMessageFactory.createMessage(ErrorMessage.recordAlreadyExist, `This specific gateway ${highway_name} at the ${kilometer} km already exist.`));

            next();

        } catch (error) {
            next(errorMessageFactory.createMessage(ErrorMessage.generalError, `Error: ${error}.`));
        }


    }

    //Middleware that validate data for creating a new segment record
    async validateSegmentDataCreation(req: Request, res: Response, next: NextFunction) {
        const { id_segment, id_gateway1, id_gateway2, distance } = req.body;

        //Check if the record Id was input manually
        if (id_segment) {
            return next(errorMessageFactory.createMessage(ErrorMessage.noManualRecordIDChange))
        }
        //Check if Gateway IDs are a number
        if ((typeof id_gateway1 !== 'number') || (typeof id_gateway2 !== 'number')) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid gateway ID value. Gateway ID must be a number."));
        }

        //Check if the two IDs gateway passed are equal
        if (id_gateway1 === id_gateway2) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "A segment can not have the same ID for gateway 1 and 2. Specificy two different ID."));
        }

        //Check ,if provied, that distance is a number 
        if (distance && (typeof distance !== 'number')) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid distance value. Distance must be a number."));
        }

        try {

            const segment = await Segment.findOne({
                where: {
                    id_gateway1: id_gateway1,
                    id_gateway2: id_gateway2
                }
            });

            const gateway1 = await Gateway.findByPk(id_gateway1);
            const gateway2 = await Gateway.findByPk(id_gateway2);

            //Check if id_gateway provieded correspond to an existing gateway
            if (!gateway1) {
                return next(errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `The record of the gateway with this id: ${id_gateway1} was not found or does not exist.`))
            }
            if (!gateway2) {
                return next(errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `The record of the gateway with this id: ${id_gateway2} was not found or does not exist.`))
            }

            //Check if already exist a record with these two id_gateways
            if (segment) {
                return next(errorMessageFactory.createMessage(ErrorMessage.recordAlreadyExist, `Record with this IDs already exist.`));
            }

            next();

        } catch (error) {
            return next(errorMessageFactory.createMessage(ErrorMessage.generalError, `Error: ${error}.`));

        }
    }

    //Middleware that validate data for creating a new vehicle record
    async validateVehicleDataCreation(req: Request, res: Response, next: NextFunction) {
        const { plate, vehicle_type, id_user } = req.body;

        //Check if plate is a string
        if (!isStringValid(plate) || plate.length > 10) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidPlateFormat, "Invalid plate. Must be a string."))
        }

        //Check if vehicle_type is a string
        if (!isStringValid(vehicle_type) || vehicle_type.length > 32) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid vehicle type. Must be a string of maximum 32 characters"));
        }

        //Check if id_user is a number
        if (typeof id_user !== 'number') {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid user ID. Must be a number."))
        }

        try {

            const vehicle = await Vehicle.findByPk(plate);

            //Check if there is a vehicle with the same registration plate
            if (vehicle) {
                return next(errorMessageFactory.createMessage(ErrorMessage.recordAlreadyExist, "A vehicle with this plate already exist."));
            }

            const driver = await User.findByPk(id_user);

            //Check if there is an existing user with that id
            if (!driver) {
                return next(errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `The record of the user with this id: ${id_user} was not found or does not exist.`));
            }
            next();

        } catch (error) {
            return next(errorMessageFactory.createMessage(ErrorMessage.generalError, `Error: ${error}`));
        }
    }

    //Middleware that validate data for updating a Vehicle record
    async validateVehicleDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { plate, vehicle_type, id_user } = req.body;
        const plate_params = req.params.id as unknown as string;


        //check if the license plate inserted in the body of the request is equal to that specified in the route parameters
        if (plate && (plate !== plate_params)) {
            return next(errorMessageFactory.createMessage(ErrorMessage.noManualRecordIDChange, "The plate specified in the body of the request, must be equal to the plate provied in the route parameters."))
        }
        try {

            //Check if vehicle_type is present and a string
            if (vehicle_type && (!isStringValid(vehicle_type) || vehicle_type.length > 32)) {
                return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid type of vehicle. Must be a string of maximum 32 characters."));
            }

            //Check if id_user  is present and a number
            if (id_user && (typeof id_user !== 'number')) {
                return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid user ID. Must me a number."));
            }

            next();


        } catch (error) {
            return next(errorMessageFactory.createMessage(ErrorMessage.generalError, `Error: ${error}`));

        }

    }

    //Middleware that validate data for updating a Segment record
    async validateSegmentDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { id_segment, id_gateway1, id_gateway2, distance } = req.body;
        const id_params = req.params.id as unknown as number;

        if (id_segment && (typeof id_segment !== 'number')) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid segment ID. Must be a number."));
        }

        //check if the ID segment inserted in the body of the request is equal to that specified in the route parameters
        //Prevent  PK ID modification
        if (id_segment && (id_segment !== id_params)) {
            return next(errorMessageFactory.createMessage(ErrorMessage.noManualRecordIDChange, "The segment ID specified in the body of the request, must be equal to the ID provied in the route parameters."))
        }

        //Check if Gateway IDs are present and  numbers
        if ((id_gateway1 && (typeof id_gateway1 !== 'number')) || ((typeof id_gateway2 !== 'number') && id_gateway2)) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid gateway ID value. Gateway ID must be a number."));
        }

        //Check if, provied, that distance is a number
        if (distance && (typeof distance !== 'number')) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid distance value. Distance must be a number."));
        }


        try {


            //If id_gateway1 is specified check if it corresponds to an existing gateway
            if (id_gateway1) {
                const gateway1 = await Gateway.findByPk(id_gateway1);

                if (!gateway1) {
                    return next(errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `The record of the gateway with this id: ${id_gateway1} was not found or does not exist.`))
                }
            }

            //If id_gateway2 is specified check if it corresponds to an existing gateway
            if (id_gateway2) {
                const gateway2 = await Gateway.findByPk(id_gateway2);

                if (!gateway2) {
                    return next(errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `The record of the gateway with this id: ${id_gateway2} was not found or does not exist.`))
                }

            }

            if (id_gateway1 && id_gateway2) {

                //If the two gateway IDs are present check if they are the same
                if (id_gateway1 === id_gateway2) {
                    return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "A segment can not have the same ID for gateway 1 and 2. Specificy two different ID."));
                }


                const segment = await Segment.findOne({
                    where: {
                        id_gateway1: id_gateway1,
                        id_gateway2: id_gateway2
                    }
                });



                //Check if already exist a record with these two id_gateways
                if (segment) {
                    return next(errorMessageFactory.createMessage(ErrorMessage.recordAlreadyExist, `Record with this IDs already exist.`));
                }
            }

            next();

        } catch (error) {
            return next(errorMessageFactory.createMessage(ErrorMessage.generalError, `Error: ${error}.`));

        }

    }

    //Middleware that validate data for updating a Gateway record
    async validateGatewayDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { id, highway_name, kilometer } = req.body;
        const id_params = req.params.id as unknown as number;


        if (id && (typeof id !== 'number')) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid gateway ID. Must be a number."));
        }
        //check if the ID gateway inserted in the body of the request is equal to that specified in the route parameters
        //Prevent  PK ID modification
        if (id && (id !== id_params)) {
            return next(errorMessageFactory.createMessage(ErrorMessage.noManualRecordIDChange, "The gateway ID specified in the body of the request, must be equal to the ID provied in the route parameters."))
        }

        try {

            const gateway = await Gateway.findByPk(id);

            //If the gateway ID specified already exist or if ID is not a number
            if (gateway && (typeof id !== 'number')) {
                return next(errorMessageFactory.createMessage(ErrorMessage.readRecordError, `Please first check if the specified ID: ${id} already exist.`))
            }

            //Verify if highway_name is present and a string of maximum 32 characters
            if (highway_name && (!isStringValid(highway_name) || highway_name.length > 32)) {
                return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid highway name. Must be a string with maximum 32 characters."));
            }

            //Verify if kilometer is present and a number
            if (kilometer && (typeof kilometer !== 'number')) {
                return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid kilometer value. Kilometer must be a number."))
            }
            //Check if already exist a record with these two attributes, if both are present
            if (highway_name && kilometer) {

                const highway = await Gateway.findOne({
                    where: {
                        highway_name: highway_name,
                        kilometer: kilometer
                    }
                });

                if (highway)
                    return next(errorMessageFactory.createMessage(ErrorMessage.recordAlreadyExist, `This specific gateway ${highway_name} at the ${kilometer} km already exist.`));

            }
            next();

        } catch (error) {
            next(errorMessageFactory.createMessage(ErrorMessage.generalError, `Error: ${error}. `));

        }

    }

    //Middleware that validate data for updating a Transit record
    validateTransitDataUpdate(req: Request, res: Response, next: NextFunction) {
        const { id, enter_at, exit_at, id_segment, weather_conditions } = req.body;
        const iso8601DateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
        const id_params = req.params.id as unknown as number;

        if (id && (typeof id !== 'number')) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid transit ID. Must be a number."));
        }

        //check if the ID transit inserted in the body of the request is equal to that specified in the route parameters
        //Prevent  PK ID modification
        if (id && (id !== id_params)) {
            return next(errorMessageFactory.createMessage(ErrorMessage.noManualRecordIDChange, "The transit ID specified in the body of the request, must be equal to the ID provied in the route parameters."))
        }

        // Check the format and the type of enter_at and exit_at, if provided
        if (enter_at && (!isStringValid(enter_at) || !iso8601DateRegex.test(enter_at))) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid enter_at format. Expect AAAA-MM-GGTHH:MM:SSZ"))
        }

        if (exit_at && (!isStringValid(exit_at) || !iso8601DateRegex.test(exit_at))) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid enter_at format. Expect AAAA-MM-GGTHH:MM:SSZ"))
        }

        //Check if weather_condition is present, a string and one of those three (good, bad, fog)
        //Returns an array containing all Weather enum values, then cast weather_condition as Weather type and finally check if weather condition is includeded in the enum weather values
        if (((!isStringValid(weather_conditions)) || !Object.values(Weather).includes(weather_conditions as Weather) && weather_conditions)) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, `Invalid weather_condition. Weather_condition must be a string and one of${Object.values(Weather).join(',')}`));
        }
        next();
    }

    //Middleware that validate plate and if an image was upload, checks if the analysed image produced a readable plate
    validatePlate(req: ICustomRequest, res: Response, next: NextFunction) {
        const plateRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;
        let plate: string | undefined = req.params.id; //Check first in the parameters then in the body
        if (!plate) {
            plate = req.body.plate;
        }
        const islicenseplateValid: boolean = plateRegex.test(plate as string);

        //If an image has been uploaded I have to check that the license plate was recognized correctly without stopping the middleware
        if (req.imageUpload) {

            if (!req.messages) {
                req.messages = [];
            }

            if (!islicenseplateValid) {
                req.body.img_readable = false;//Specificy that the plate is unreadable

                //Set the license plate with a custom license plate assigned as unreadable
                req.body.plate = "ZZ999ZZ";
                req.messages.push(successMessageFactory.createMessage(SuccesMessage.createRecordSuccess, "Transit memorized as Unreadable"));
            } else {
                //Plate must be readable and valid, so if not, set img_readable at true
                req.body.img_readable = true;
                req.messages.push(successMessageFactory.createMessage(SuccesMessage.createRecordSuccess, "Transit memorized as Readable"));

            }

        } else {
            if (!plate || !islicenseplateValid) {
                return next(errorMessageFactory.createMessage(ErrorMessage.invalidPlateFormat, "Invalid License Plate. Expected thid format [A-Z]{2}[0-9]{3}[A-Z]{2}"));
            }
        }
        next();

    }

    //Middleware that validate data for creating a new user record
    validateUserCredentials(req: Request, res: Response, next: NextFunction) {
        const { id, role, username, password } = req.body;

        //Prevent Primary Key ID modification
        if (id) {
            return next(errorMessageFactory.createMessage(ErrorMessage.noManualRecordIDChange))
        }

        //Check if username is valid
        if (!isStringValid(username) || username.length > 255) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid username. Must be a string with maximum 255 characters."));
        }

        //Check if password is valid
        if (!isStringValid(password) || password.length > 255) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid password. Must be a string with maximum 255 characters."));
        }

        //Check if role is valid
        if (!isStringValid(role) || role.length > 32 || (role !== 'admin' && role !== 'driver')) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid role. Must be a string with maximum 32 characters and can be either 'admin' or 'driver'"));
        }

        next();
    }

    //Middleware that validate data for updating a User record
    async validateUpdateUserCredentials(req: Request, res: Response, next: NextFunction) {
        const { id, role, username, password } = req.body;
        const id_params = req.params.id as unknown as number;

        if (id && (typeof id !== 'number')) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid user ID. Must be a number."));
        }

        //check if the ID user inserted in the body of the request is equal to that specified in the route parameters
        //Prevent  PK ID modification
        if (id && (id !== id_params)) {
            return next(errorMessageFactory.createMessage(ErrorMessage.noManualRecordIDChange, "The ID specified in the body of the request, must be equal to the ID provied in the route."));
        }

        //Check if username is present and valid
        if (username && (!isStringValid(username) || username.length > 255)) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid username. Must be a string with maximum 255 characters."));
        }

        //Check if password is present and valid
        if (password && (!isStringValid(password) || password.length > 255)) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid password. Must be a string with maximum 255 characters."));
        }


        //Check if role is present and valid
        if ((!isStringValid(role) || role.length > 32 || (role !== 'admin' && role !== 'driver')) && role) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid role. Must be a string with maximum 32 characters and can be either 'admin' or 'driver'"));
        }

        try {
            const existing_user = await User.findOne({
                where: {
                    role: role,
                    username: username,
                    password: password
                }
            });

            //Check if a user with thid attributes already exist
            if (existing_user) {
                return next(errorMessageFactory.createMessage(ErrorMessage.recordAlreadyExist, `This specific user: ${username} already exist.`))
            }
            next();

        } catch (error) {
            next(errorMessageFactory.createMessage(ErrorMessage.generalError, `Error: ${error}. `));
        }



    }

    // Middleware to validate query parameters for filtering
    validateFilterQuery(req: Request, res: Response, next: NextFunction) {
        const { plates, start_date, end_date } = req.query;
        // Regular expressions to validate date and plate formats
        const iso8601DateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
        const plateRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;

        // Validate 'plates' query parameter
        if (plates) {
            // Convert 'plates' to an array if it is a single string
            const plateArray = Array.isArray(plates) ? plates : [plates];
            // Check if all plates are valid strings matching the plate regex
            const invalidPlates = plateArray.filter((plate: any) => typeof plate !== 'string' || !plateRegex.test(plate));
            if (invalidPlates.length > 0) {
                // Pass an error if any plate is invalid
                return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, `Invalid plate format. The following plates are invalid: ${invalidPlates.join(', ')}`));
            }
        }
        // Validate 'start_date' query parameter
        if (start_date) {
            if (typeof start_date !== 'string' || !iso8601DateRegex.test(start_date)) {
                return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid start_date format. Expect YYYY-MM-DDTHH:MM:SSZ"));
            }
        }
        // Validate 'end_date' query parameter
        if (end_date) {
            if (typeof end_date !== 'string' || !iso8601DateRegex.test(end_date)) {
                return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "Invalid end_date format. Expect YYYY-MM-DDTHH:MM:SSZ"));
            }
        }
        // Ensure 'end_date' is after 'start_date' if both are provided
        if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
            return next(errorMessageFactory.createMessage(ErrorMessage.invalidFormat, "end_date must be after start_date."));
        }
        // If all validations pass, proceed to the next middleware
        next();
    }
}

// Helper function to check if a value is a valid string
export function isStringValid(value: any): boolean {
    return typeof value === 'string' && value.trim().length > 0;
}

//Export an instance of validateData
export default new validateData();