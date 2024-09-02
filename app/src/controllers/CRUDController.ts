import { Request, Response } from 'express';
import { Model, ModelStatic, WhereOptions } from 'sequelize';

import { MessageFactory, HttpStatus } from '../factory/Messages';
import TransitController from './TransitController';
import Transit from '../models/Transit';
import Violation from '../models/Violation';

const MessageFact: MessageFactory = new MessageFactory();

class CRUDController {

    // Crea un record
    async createRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            const record = await model.create(req.body);
            const message = MessageFact.createMessage(HttpStatus.CREATED)
            result = res.json({ success: message, data: record });
        } catch (error) {
            const message = MessageFact.createMessage(HttpStatus.INTERNAL_SERVER_ERROR, `Errore durante la creazione della risorsa ${model.name}`);
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
                const message = MessageFact.createMessage(HttpStatus.OK, 'Risorsa individuata');
                result = res.json({ success: message, data: record });
            } else {
                const message = MessageFact.createMessage(HttpStatus.NOT_FOUND, `Risorsa ${model.name} non trovata`);
                result = res.json({ error: message });
            }
        } catch (error) {
            const message = MessageFact.createMessage(HttpStatus.INTERNAL_SERVER_ERROR, `Errore durante il recupero della risorsa ${model.name}`);
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
                    const message = MessageFact.createMessage(HttpStatus.OK, `Risorsa ${model.name} aggiornata`);
                    result = res.json({ success: message, data: updatedInstance });
                } else {
                    const message = MessageFact.createMessage(HttpStatus.NOT_FOUND, `Risorsa ${model.name} non trovata dopo l'aggiornamento`);
                    result = res.json({ error: message });
                }
            } else {
                const message = MessageFact.createMessage(HttpStatus.NOT_FOUND, `Risorsa ${model.name} non trovata`);
                result = res.json({ error: message });
            }
        } catch (error) {
            const message = MessageFact.createMessage(HttpStatus.INTERNAL_SERVER_ERROR, `Errore durante l'aggiornamento della risorsa ${model.name}`);
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
                const message = MessageFact.createMessage(HttpStatus.NO_CONTENT, `Risorsa ${model.name} eliminata`);
                result = res.json({ success: message });
            } else {
                const message = MessageFact.createMessage(HttpStatus.NOT_FOUND, `Risorsa ${model.name} non trovata`);
                result = res.json({ error: message });
            }
        } catch (error) {
            const message = MessageFact.createMessage(HttpStatus.INTERNAL_SERVER_ERROR, `Errore durante la cancellazione della risorsa ${model.name}`);
            return res.json({ error: message });
        }
        return result;
    }

    // aggiorna l'ultimo Transit inserito per un veicolo data la sua targa (quello al quale manca exit_at)
    async updateLastTransit(req: Request, res: Response): Promise<Response> {
        var result: any;
        try {
            // Trova l'ultimo transito per la targa specificata e che non ha ancora `exit_at` impostato
            const lastRecord = await Transit.findOne({
                where: { plate: req.params.plate },
                order: [['enter_at', 'DESC']], // Ordina per `enter_at` in ordine decrescente
            });

            // Verifica se è stato trovato un record
            if (!lastRecord) {
                const message = MessageFact.createMessage(HttpStatus.NOT_FOUND, `Transito non trovato per il veicolo con targa ${req.params.plate}`);
                return res.status(404).json({ error: message });
            }

            // Aggiorna il record trovato con i dati forniti nel corpo della richiesta
            const updatedRecord = await lastRecord.update(req.body);

            if (updatedRecord) {
                const message = MessageFact.createMessage(HttpStatus.OK, `Transito aggiornato con successo per il veicolo con targa ${req.params.plate}`);
                result = res.status(200).json({ success: message, data: updatedRecord });
            } else {
                const message = MessageFact.createMessage(HttpStatus.INTERNAL_SERVER_ERROR, `Errore durante l'aggiornamento del transito per il veicolo con targa ${req.params.plate}`);
                result = res.status(500).json({ error: message });
            }
        } catch (error) {
            console.error('Errore durante l\'aggiornamento del transito:', error);
            const message = MessageFact.createMessage(HttpStatus.INTERNAL_SERVER_ERROR, `Errore durante l'aggiornamento del transito per il veicolo con targa ${req.params.plate}`);
            result = res.status(500).json({ error: message });
        }
        return result;
    }

    // crea violation
    async createViolation(id_transit: number, average_speed: number, delta: number): Promise<Response> {
        var result: any;
        try {
            // Crea una nuova violazione
            const violation = await Violation.create({
                id_transit,
                average_speed,
                delta
            });

            result = violation;
        } catch (error) {
            console.log("errore durante la creazione della risorsa.", error);
            result = null;
        }
        return result;
    }
}

export default new CRUDController();
