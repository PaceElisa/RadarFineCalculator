import { Request, Response } from 'express';
import { Model, ModelStatic, WhereOptions } from 'sequelize';
import Transit from '../models/Transit';
import Violation from '../models/Violation';
import Payment from '../models/Payment';

//Import factory
import { successFactory } from "../factory/SuccessMessage";
import { errorFactory } from "../factory/FailMessage";
import { SuccesMessage, ErrorMessage } from "../factory/Messages";
import Gateway from '../models/Gateway';
import Segment from '../models/Segment';

const errorMessageFactory: errorFactory = new errorFactory();
const successMessageFactory: successFactory = new successFactory();

// Funzione generica per creare una clausola WHERE basata su una chiave primaria
const wherePrimaryKey = <T>(key: string, value: string | number): WhereOptions<T> => ({ [key]: value } as unknown as WhereOptions<T>);

class CRUDController {

    // Crea un record
    async createRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            const record = await model.create(req.body);
            const message = successMessageFactory.createMessage(SuccesMessage.createRecordSuccess, `New ${model.name} record created`)
            result = res.json({ success: message, data: record });
        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.createRecordError, `Error while creating new ${model.name} record`);
            return res.json({ error: message });
        }
        return result;
    }

    // Leggi un solo record data la sua chiave primaria (o piu di una)
    async readOneRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            // Get the primary key from the request parameters
            const pk = req.params.id as unknown as number | string;
            // Find the record by its primary key
            const record = await model.findByPk(pk);
            const message = successMessageFactory.createMessage(SuccesMessage.readRecordSuccess, `${model.name} record found`);
            result = res.json({ success: message, data: record });
        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.readRecordError, `Error while reading ${model.name} record`);
            result = res.json({ error: message });
        }
        return result;
    }

    // aggiorna un record data la sua chiave primaria (o piu di una)
    async updateRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            // Retrieve primary key attributes from the model
            const primaryKeys = model.primaryKeyAttributes;
            // Costruisci la clausola WHERE per la chiave primaria
            const primaryKeyValue = req.params.id as string | number;
            const whereClause = wherePrimaryKey<T>(primaryKeys[0], primaryKeyValue);

            // Update the record
            await model.update(req.body, {
                where: whereClause as WhereOptions<T>
            });

            // Find the updated record
            const updatedInstance = await model.findOne({
                where: whereClause as WhereOptions<T>
            });

            const message = successMessageFactory.createMessage(SuccesMessage.updateRecordSuccess, `${model.name} record updated successfully`);
            result = res.json({ success: message, data: updatedInstance });

        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.updateRecordError, `Error while updating ${model.name}`);
            result = res.json({ error: message });
        }
        return result;
    }

    // cancella un record data la sua chiave primaria (o piu di una)
    async deleteRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            // Retrieve primary key attributes from the model
            const primaryKeys = model.primaryKeyAttributes;
            // Costruisci la clausola WHERE per la chiave primaria
            const primaryKeyValue = req.params.id as string | number;
            const whereClause = wherePrimaryKey<T>(primaryKeys[0], primaryKeyValue);

            const deleted = await model.destroy({
                where: whereClause as WhereOptions<T>
            });

            const message = successMessageFactory.createMessage(SuccesMessage.deleteRecordSuccess, `${model.name} record deleted`);
            result = res.json({ success: message });
            
        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.deleteRecordError, `Error while deleting ${model.name}`);
            result = res.json({ error: message });
        }
        return result;
    }

    // aggiorna l'ultimo Transit inserito per un veicolo data la sua targa (quello al quale manca exit_at)
    async updateLastTransit(req: Request, res: Response): Promise<any> {
        var result: any;
        const plate = req.params.id;
        try {
            // Trova l'ultimo transito per la targa specificata e che non ha ancora `exit_at` impostato
            const lastRecord = await Transit.getLastInsertedRecordByPlate(plate)

            // Verifica se è stato trovato un record
            if (!lastRecord) {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `Transit with null exit_at parameter for vehicle ${plate} not found`);
                return { error: message };
            }

            // Aggiorna il record trovato con i dati forniti nel corpo della richiesta
            const updatedRecord = await lastRecord.update(req.body);

            if (updatedRecord) {
                const message = successMessageFactory.createMessage(SuccesMessage.updateRecordSuccess, `Transit for vehicle ${plate} updated successfully`);
                result = { success: message, data: updatedRecord };
            } else {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `Record not found after updating`);
                result = { error: message };
            }
        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.generalError, `Error while updating Transit for vehicle ${plate}`);
            result = { error: message };
        }
        return result;
    }

    // Crea un record Transit dal Gateway loggato
    async createTransitWithGateway(req: Request, res: Response): Promise<Response> {
        var result: any;
        const { highway_name, kilometer } = req.body.gateway;
        const { plate, weather_conditions } = req.body;
        try {
            const gatewayData = await Gateway.findGatewayByHighwayAndKilometer(highway_name, kilometer);
            if (!gatewayData) {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `Gateway not found for highway ${highway_name} at kilometer ${kilometer}`);
                return res.status(404).json({ error: message });
            }
            const segmentData = await Segment.findOne({ where: { id_gateway1: gatewayData.id } });
            if (!segmentData) {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `Segment not found for gateway ID ${gatewayData.id}`);
                return res.status(404).json({ error: message });
            }

            const transit = await Transit.create({
                id_segment: segmentData.id,
                plate: plate,
                weather_conditions: weather_conditions
            });

            const message = successMessageFactory.createMessage(SuccesMessage.createRecordSuccess, `New Transit record created`)
            result = res.json({ success: message, data: transit });
        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.createRecordError, `Error while creating new Transit record`);
            return res.json({ error: message });
        }
        return result;
    }

    // crea violation e il pagamento associato
    async createViolationAndPayment(id_transit: number, average_speed: number, delta: number): Promise<Response> {
        var result: any;
        try {
            // Crea una nuova violazione
            const violation = await Violation.create({
                id_transit,
                average_speed,
                delta
            });
            const payment = await Payment.create({
                id_violation: violation.id
            })

            result = { violation: violation, payment: payment };
        } catch (error) {
            console.log("Error while creating Violation and Payment", error);
            result = null;
        }
        return result;
    }
}

export default new CRUDController();
