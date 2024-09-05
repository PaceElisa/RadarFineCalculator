//Import neccesary modules
import { Request, Response } from "express";
import Violation from "../models/Violation";

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

    //Aggiungere metodo per filtrare solo per la targa del driver che fa richiesta
    /*async getDriverFilteredViolations(req: Request, res: Response): Promise<Response> {
        
    }*/
}

export default new ViolationController();