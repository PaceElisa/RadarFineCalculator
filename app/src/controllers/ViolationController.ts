//Import neccesary modules
import { Request, Response } from "express";
import Violation from "../models/Violation";
import Vehicle from "../models/Vehicle";
import User from "../models/User";

//Import factory
import { successFactory } from "../factory/SuccessMessage";
import { errorFactory } from "../factory/FailMessage";
import { SuccesMessage, ErrorMessage } from "../factory/Messages";

const errorMessageFactory: errorFactory = new errorFactory();
const successMessageFactory: successFactory = new successFactory();

//Define class ViolationController class
class ViolationController {
    // Filtra le violations per targhe e periodo temporale
    async getFilteredViolations(req: Request, res: Response): Promise<Response> {
        var result: any;
        const { plates, start_date, end_date } = req.query;
        const plateArray = Array.isArray(plates) ? plates : [plates];
        const startDate = new Date(start_date as string);
        const endDate = new Date(end_date as string);

        try {
            const violations = await Violation.findViolationsByPlates(plateArray as string[], startDate, endDate);
            const message = successMessageFactory.createMessage(SuccesMessage.generalSuccess, 'Data has been filtered successfully')
            result = res.json({ success: message, data: violations });
        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.generalError, `Error while filtering data`);
            return res.json({ error: message });
        }
        return result;
    }

    // Filtra solo per le targhe associate ai veicoli del driver che fa richiesta e periodo temporale
    async getDriverFilteredViolations(req: Request, res: Response): Promise<Response> {
        var result: any;
        const { start_date, end_date } = req.query;
        const startDate = new Date(start_date as string);
        const endDate = new Date(end_date as string);

        try {
            // Ottieni l'utente (driver) dalla richiesta
            const driver = req.body.user;
            const driverData = await User.findUserByUsername(driver.username);

            if (!driverData) {
                const message = errorMessageFactory.createMessage(ErrorMessage.generalError, `Error while filtering data`);
                return res.json({ error: message });
            }

            // Recupera le targhe dei veicoli associati al driver
            const vehicles = await Vehicle.findAll({
                where: { id_user: driverData.id }
            });

            // Estrai le targhe dai veicoli
            const plateArray = vehicles.map(vehicle => vehicle.plate);

            if (plateArray.length === 0) {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, 'No vehicles found for the driver');
                return res.json({ success: message, data: [] });
            }

            // Filtra le violazioni usando le targhe del driver e il periodo temporale
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

export default new ViolationController();