import { Request, Response } from 'express';
import { Model, ModelStatic, WhereOptions } from 'sequelize';
import Transit from '../models/Transit';
import Violation from '../models/Violation';
import Payment from '../models/Payment';

//Import factory
import { successFactory } from "../factory/SuccessMessage";
import { errorFactory } from "../factory/FailMessage";
import { SuccesMessage, ErrorMessage } from "../factory/Messages";

const errorMessageFactory: errorFactory = new errorFactory();
const successMessageFactory: successFactory = new successFactory();

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
            // Retrieve primary key attributes from the model
            const primaryKeys = model.primaryKeyAttributes;

            // Construct the where clause for composite primary keys
            const whereClause: { [key: string]: string | number } = {};
            primaryKeys.forEach(key => {
                // Ensure each primary key field is included in the where clause
                whereClause[key] = req.params[key] as unknown as string | number;
            });

            // Retrieve the record by composite primary keys
            const record = await model.findOne({
                where: whereClause as WhereOptions<T>
            });

            if (record) {
                const message = successMessageFactory.createMessage(SuccesMessage.readRecordSuccess, `${model.name} record found`);
                result = res.json({ success: message, data: record });
            } else {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `${model.name} record not found`);
                result = res.json({ error: message });
            }
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

            // Construct the where clause for composite primary keys
            const whereClause: { [key: string]: string | number } = {};
            primaryKeys.forEach(key => {
                whereClause[key] = req.params[key] as unknown as string | number;
            });

            // Update the record
            const [updated] = await model.update(req.body, {
                where: whereClause as WhereOptions<T>
            });

            if (updated) {
                // Find the updated record
                const updatedInstance = await model.findOne({
                    where: whereClause as WhereOptions<T>
                });

                if (updatedInstance) {
                    const message = successMessageFactory.createMessage(SuccesMessage.updateRecordSuccess, `${model.name} record updated successfully`);
                    result = res.json({ success: message, data: updatedInstance });
                } else {
                    const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `${model.name} record not found after updating`);
                    result = res.json({ error: message });
                }
            } else {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `${model.name} record not found`);
                result = res.json({ error: message });
            }
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

            // Construct the where clause for composite primary keys
            const whereClause: { [key: string]: string | number } = {};
            primaryKeys.forEach(key => {
                whereClause[key] = req.params[key] as unknown as string | number;
            });

            const deleted = await model.destroy({
                where: whereClause as WhereOptions<T>
            });
            if (deleted) {
                const message = successMessageFactory.createMessage(SuccesMessage.deleteRecordSuccess, `${model.name} record deleted`);
                result = res.json({ success: message });
            } else {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `${model.name} record not found`);
                result = res.json({ error: message });
            }
        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.deleteRecordError, `Error while deleting ${model.name}`);
            result = res.json({ error: message });
        }
        return result;
    }

    // aggiorna l'ultimo Transit inserito per un veicolo data la sua targa (quello al quale manca exit_at)
    async updateLastTransit(req: Request, res: Response): Promise<any> {
        var result: any;

        try {
            // Trova l'ultimo transito per la targa specificata e che non ha ancora `exit_at` impostato
            const lastRecord = await Transit.getLastInsertedRecordByPlate(req.params.plate)

            // Verifica se è stato trovato un record
            if (!lastRecord) {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `Transit with null exit_at parameter for vehicle ${req.params.plate} not found`);
                return { error: message };
            }

            // Aggiorna il record trovato con i dati forniti nel corpo della richiesta
            const updatedRecord = await lastRecord.update(req.body);

            if (updatedRecord) {
                const message = successMessageFactory.createMessage(SuccesMessage.updateRecordSuccess, `Transit for vehicle ${req.params.plate} updated successfully`);
                result = { success: message, data: updatedRecord};
            } else {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `Record not found after updating`);
                result = { error: message };
            }
        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.generalError, `Error while updating Transit for vehicle ${req.params.plate}`);
            result = { error: message };
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
