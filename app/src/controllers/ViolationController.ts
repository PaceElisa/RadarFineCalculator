//Import neccesary modules
import { Request, Response } from "express";
import Violation from "../models/Violation";
import Vehicle from "../models/Vehicle";
import User from "../models/User";

//Import factory
import { successFactory } from "../factory/SuccessMessage";
import { errorFactory } from "../factory/FailMessage";
import { SuccesMessage, ErrorMessage } from "../factory/Messages";
// Initialize factories for error and success messages
const errorMessageFactory: errorFactory = new errorFactory();
const successMessageFactory: successFactory = new successFactory();

//Define class ViolationController class
class ViolationController {
    // Filter violations by plates and a time period
    async getFilteredViolations(req: Request, res: Response): Promise<Response> {
        var result: any;
        const { plates, start_date, end_date } = req.query;
        // Convert plates to an array if necessary
        const plateArray = Array.isArray(plates) ? plates : [plates];
        const startDate = new Date(start_date as string);
        const endDate = new Date(end_date as string);

        try {
            // Fetch violations based on the plate array and time period
            const violations = await Violation.findViolationsByPlates(plateArray as string[], startDate, endDate);
            const message = successMessageFactory.createMessage(SuccesMessage.generalSuccess, 'Data has been filtered successfully')
            result = res.json({ success: message, data: violations });
        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.generalError, `Error while filtering data`);
            return res.json({ error: message });
        }
        return result;
    }

    // Filter violations only by plates associated with the driver's vehicles and a time period
    async getDriverFilteredViolations(req: Request, res: Response): Promise<Response> {
        var result: any;
        const { start_date, end_date } = req.query;
        const startDate = new Date(start_date as string);
        const endDate = new Date(end_date as string);

        try {
            // Retrieve the user (driver) making the request
            const driver = req.body.user;
            const driverData = await User.findUserByUsername(driver.username);
            // Check if the driver data exists
            if (!driverData) {
                const message = errorMessageFactory.createMessage(ErrorMessage.generalError, `Error while filtering data`);
                return res.json({ error: message });
            }

            // Fetch the vehicles associated with the driver
            const vehicles = await Vehicle.findAll({
                where: { id_user: driverData.id }
            });

            // Extract plates from the vehicles
            const plateArray = vehicles.map(vehicle => vehicle.plate);
            // Check if the driver has any associated vehicles
            if (plateArray.length === 0) {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, 'No vehicles found for the driver');
                return res.json({ success: message, data: [] });
            }

            // Filter violations using the driver's plates and the time period
            const violations = await Violation.findViolationsByPlates(plateArray, startDate, endDate);
            const message = successMessageFactory.createMessage(SuccesMessage.generalSuccess, 'Data has been filtered successfully');
            result = res.json({ success: message, data: violations });
        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.generalError, `Error while filtering data`);
            return res.json({ error: message });
        }
        return result;
    }
}
// Export an instance of the ViolationController class
export default new ViolationController();