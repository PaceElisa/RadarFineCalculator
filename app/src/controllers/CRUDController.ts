import { Request, Response } from 'express';
import { Model, ModelStatic, WhereOptions } from 'sequelize';

class CRUDController {

    // Crea un record
    async createRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
        try {
            const record = await model.create(req.body);
            return res.status(201).json(record);
        } catch (error) {
            console.error(`Error: `, error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Leggi un solo record data la sua chiave primaria (o piu di una)
    async readOneRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
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
                return res.status(200).json(record);
            } else {
                return res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            console.error(`Error: `, error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // aggiorna un record data la sua chiave primaria (o piu di una)
    async updateRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
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
                    return res.status(200).json(updatedInstance);
                } else {
                    return res.status(404).json({ message: 'Not found' });
                }
            } else {
                return res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            console.error(`Error: `, error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // cancella un record data la sua chiave primaria (o piu di una)
    async deleteRecord<T extends Model>(model: ModelStatic<T>, req: Request, res: Response): Promise<Response> {
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
                return res.status(204).end();
            } else {
                return res.status(404).json({ message: 'Not found' });
            }
        } catch (error) {
            console.error(`Error: `, error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default new CRUDController();
