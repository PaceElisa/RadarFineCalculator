//Import neccesary modules
import { Request, Response, NextFunction } from "express";
import { MessageFactory, HttpStatus } from '../factory/Messages';
import Violation from "../models/Violation";
import { start } from "repl";

const MessageFact: MessageFactory = new MessageFactory();

//Define class ViolationController class
class ViolationController {
    // Filtra le violations per targhe e periodo temporale
    async getFilteredViolations(req: Request, res: Response): Promise<Response> {
        var result: any;
        const { plates, start_date, end_date } = req.query;
        const plateArray = Array.isArray(plates) ? plates : [plates];
        const startDate = new Date(start_date as string);
        const endDate = new Date(end_date as string);
        console.log(start_date, " ", end_date);
        try {
            const violations = await Violation.findViolationsByPlates(plateArray as string[], startDate, endDate);
            const message = MessageFact.createMessage(HttpStatus.OK)
            result = res.json({ success: message, data: violations });
        } catch (error) {
            const message = MessageFact.createMessage(HttpStatus.INTERNAL_SERVER_ERROR, `Errore durante l'operazione di filtraggio`);
            return res.json({ error: message });
        }
        return result;
    }
}

export default new ViolationController();