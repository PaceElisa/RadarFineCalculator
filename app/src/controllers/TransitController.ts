//Import neccesary modules
import { Request, Response } from "express";
import { Op } from "sequelize";
import Transit from "../models/Transit";
import Vehicle from "../models/Vehicle";
import Segment from "../models/Segment";
import { recognizeTextFromImage } from "../services/ocrService";
import { upload } from "../middleware/uploadMIddleware";
import CRUDController from "./CRUDController";

//Import factory
import { successFactory } from "../factory/SuccessMessage";
import { errorFactory } from "../factory/FailMessage";
import { SuccesMessage, ErrorMessage } from "../factory/Messages";

const errorMessageFactory: errorFactory = new errorFactory();
const successMessageFactory: successFactory = new successFactory();

//Define class TransitController class
class TransitController {
    // dopo che aggiorno un transit con la data di uscita dal segment controllo se c'è stata una violazione dei limiti
    async checkViolation(req: Request, res: Response): Promise<any> {
        var result: any;
        try {
            // Extract plate from route parameters
            const plate = req.params.id;
            const { exit_at } = req.body;

            // Ottieni l'ultimo record inserito per la plate che è anche l'ultimo aggiornato
            const lastTransit = await Transit.findOne({
                where: { plate: plate },
                order: [['enter_at', 'DESC']], // Ordina per `enter_at` in ordine decrescente
            });

            // Verifica se è stato trovato un record
            if (!lastTransit) {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `No records found for the specified plate`);
                return { error: message };
            }

            // Extract other attributes from lastTransit
            const { enter_at, weather_conditions } = lastTransit;

            // Ensure enter_at, exit_at, and weather_conditions are provided
            if (!enter_at || !exit_at || !weather_conditions) {
                const message = errorMessageFactory.createMessage(ErrorMessage.missingParameters, `Missing required parameters`);
                return { error: message };
            }

            // Convert enter_at and exit_at to Date objects
            const enterAtDate = new Date(enter_at);
            const exitAtDate = new Date(exit_at);

            if (isNaN(enterAtDate.getTime()) || isNaN(exitAtDate.getTime())) {
                const message = errorMessageFactory.createMessage(ErrorMessage.invalidFormat, `Invalid Date Format. Try YYYY-MM-DDTHH:MM:SSZ`);
                return { error: message };
            }

            // Ottieni la distanza del segmento
            const segmentDistance = await lastTransit.getSegmentDistance();

            // Fetch the good weather limits for the vehicle
            const goodWeatherLimits = await Vehicle.getGoodWeatherLimits(plate);
            // Fetch the bad weather limits for the vehicle
            const badWeatherLimits = await Vehicle.getBadWeatherLimits(plate);
            const fogWeatherLimits: number = 50;

            // Calcola la durata del transito in minuti
            const duration = (exitAtDate.getTime() - enterAtDate.getTime()) / (1000 * 60); // Converti millisecondi in minuti

            // Calcola la velocità media in km/h
            const averageSpeed = (segmentDistance as number / duration) * 60; // Converti km/min in km/h

            // Determina il limite applicabile basato sulle condizioni meteorologiche
            let applicableLimit: number;
            switch (weather_conditions) {
                case 'good':
                    applicableLimit = goodWeatherLimits as number;
                    break;
                case 'bad':
                    applicableLimit = badWeatherLimits as number;
                    break;
                case 'fog':
                    applicableLimit = fogWeatherLimits;
                    break;
            }

            const delta = averageSpeed - applicableLimit;
            console.log("delta: ", delta);
            // Verifica se la velocità media supera il limite
            if (averageSpeed > applicableLimit) {
                // Crea una violazione e il pagamento associato
                CRUDController.createViolationAndPayment(lastTransit.id, averageSpeed, delta); //aggiungere una response per ritornare il json di violation e payment
                const message = successMessageFactory.createMessage(SuccesMessage.generalSuccess, `Violation detected for vehicle with plate ${plate}. Average Speed: ${averageSpeed.toFixed(2)} km/h, Limit: ${applicableLimit} km/h.`);
                result = { success: message };
            } else {
                const message = successMessageFactory.createMessage(SuccesMessage.generalSuccess, `No violation for vehicle with plate ${plate}. Average Speed: ${averageSpeed.toFixed(2)} km/h, Limit: ${applicableLimit} km/h.`);
                result = { success: message };
            }
            return result;
        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.generalError, `Error while checking violation for plate ${req.params.plate}`);
            result = { error: message };
        }
        return result;
    }

    // ottieni unreadable transits
    async getUnreadableTransits(req: Request, res: Response): Promise<Response> {
        var result: any;
        const { id } = req.query;
        try {
            // Se l'ID non è presente, procedi senza filtrare per gateway specifico
            let unreadableTransits;
            if (id) {
                const gatewayId: number = Number(id);
                unreadableTransits = await Transit.findUnreadableTransitsByGateway(gatewayId);
            } else {
                unreadableTransits = await Transit.findAll({
                    where: { img_readable: false, img_route: {[Op.ne]: null}}
                });
            }

            // Mappare il risultato per includere l'URL dell'immagine
            const formattedTransits = unreadableTransits?.map(transit => ({
                ...transit.toJSON(),
                img_url: `${req.protocol}://${req.get('host')}/images/${transit.img_route}`
            }));

            const message = successMessageFactory.createMessage(SuccesMessage.generalSuccess, `Unreadable Transits filtered successfully`);
            result = res.json({ success: message, data: formattedTransits });
        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.generalError, `Error while filtering unreadable Transits`);
            return res.json({ error: message });
        }
        return result;
    }

    // ottieni transiti filtrati per varco (segmenti con quel varco)
    async getTransitsFilteredByGateway(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            const gatewayId: number = Number(id);

            // Find segments where id_gateway1 or id_gateway2 matches the gatewayId
            const segments = await Segment.findAll({
                where: {
                    [Op.or]: [
                        { id_gateway1: gatewayId },
                        { id_gateway2: gatewayId }
                    ]
                },
                attributes: ['id']
            });
            const segmentIds = segments.map(segment => segment.id);

            // Find transits for the found segment IDs
            const filteredTransits = await Transit.findAll({
                where: {
                    id_segment: segmentIds
                }
            });
            const message = successMessageFactory.createMessage(SuccesMessage.generalSuccess, `Transits filtered by gateway id successfully`);
            return res.json({ success: message, data: filteredTransits });

        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.generalError, `Error while filtering Transits by gateway id`);
            return res.status(500).json({ error: message });
        }
    }

}

export default new TransitController();