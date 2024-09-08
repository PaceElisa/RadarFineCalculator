import { Request, Response } from 'express';
import { Model, ModelStatic, WhereOptions } from 'sequelize';
import Transit from '../models/Transit';
import Violation from '../models/Violation';
import Payment from '../models/Payment';
import Gateway from '../models/Gateway';
import Segment from '../models/Segment';

//Import factory
import { successFactory } from "../factory/SuccessMessage";
import { errorFactory } from "../factory/FailMessage";
import { SuccesMessage, ErrorMessage } from "../factory/Messages";
// Instantiate factory classes for success and error messages
const errorMessageFactory: errorFactory = new errorFactory();
const successMessageFactory: successFactory = new successFactory();

// Generic function to create a WHERE clause based on a primary key
const wherePrimaryKey = <T>(key: string, value: string | number): WhereOptions<T> => ({ [key]: value } as unknown as WhereOptions<T>);

class CRUDController {

    // Create a new record in the database
    async createRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            // Create a new record with the request body
            const record = await model.create(req.body);
            const message = successMessageFactory.createMessage(SuccesMessage.createRecordSuccess, `New ${model.name} record created`)
            result = res.json({ success: message, data: record });
        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.createRecordError, `Error while creating new ${model.name} record`);
            return res.json({ error: message });
        }
        return result;
    }

    // Read a single record given its primary key
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

    // Update a record given its primary key
    async updateRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            // Retrieve primary key attributes from the model
            const primaryKeys = model.primaryKeyAttributes;
            // Construct the WHERE clause for the primary key
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

    // Delete a record given its primary key
    async deleteRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            // Retrieve primary key attributes from the model
            const primaryKeys = model.primaryKeyAttributes;
            // Construct the WHERE clause for the primary key
            const primaryKeyValue = req.params.id as string | number;
            const whereClause = wherePrimaryKey<T>(primaryKeys[0], primaryKeyValue);
            // Delete the record
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

    // Update the last inserted Transit record for a vehicle given its plate (the one with missing exit_at)
    async updateLastTransit(req: Request, res: Response): Promise<any> {
        var result: any;
        const plate = req.params.id;
        try {
            // Find the last Transit record for the specified plate with a null `exit_at`
            const lastRecord = await Transit.getLastInsertedRecordByPlate(plate)

            // Check if a record was found
            if (!lastRecord) {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `Transit with null exit_at parameter for vehicle ${plate} not found`);
                return { error: message };
            }

            // Update the found record with the request body data
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

    // Create a Transit record from a logged Gateway
    async createTransitWithGateway(req: Request, res: Response): Promise<Response> {
        var result: any;
        const { highway_name, kilometer } = req.body.gateway;
        const { plate, weather_conditions } = req.body;
        try {
            // Find Gateway data by highway name and kilometer
            const gatewayData = await Gateway.findGatewayByHighwayAndKilometer(highway_name, kilometer);
            if (!gatewayData) {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `Gateway not found for highway ${highway_name} at kilometer ${kilometer}`);
                return res.status(404).json({ error: message });
            }
            // Find the Segment associated with the Gateway
            const segmentData = await Segment.findOne({ where: { id_gateway1: gatewayData.id } });
            if (!segmentData) {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `Segment not found for gateway ID ${gatewayData.id}`);
                return res.status(404).json({ error: message });
            }
            // Create a new Transit record
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

    // Create a Violation and the associated Payment
    async createViolationAndPayment(id_transit: number, average_speed: number, delta: number): Promise<Response> {
        var result: any;
        try {
            // Create a new Violation
            const violation = await Violation.create({
                id_transit,
                average_speed,
                delta
            });
            // Create an associated Payment
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
// Export a new instance of the CRUDController
export default new CRUDController();
