import { Router } from "express";

// Models
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import Gateway from '../models/Gateway';
import Segment from '../models/Segment';
import Transit from '../models/Transit';
import Violation from '../models/Violation';
import Limit from '../models/Limit';

// Controllers
import CRUDController from '../controllers/CRUDController';
import loginController from '../controllers/loginController';
import TransitController from "../controllers/TransitController";

// Middlewares
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// index prova
router.get("/", (req: any, res: any) => res.send("TEST"));

// Route per i login
router.post('/login', loginController.login);
router.post('/loginGateway', loginController.loginGateway);

// Esempio di una route protetta
router.get('/protected', authMiddleware.authenticateJWT, (req, res) => {
    res.status(200).json({ message: 'This is a protected route'});
});

// CRUD
// User (utente operatore???)
router.post("/api/users", async (req: any, res: any) => CRUDController.createRecord(User, req, res));
router.get("/api/users/:id", async (req: any, res: any) => CRUDController.readOneRecord(User, req, res));
router.delete("/api/users/:id", async (req: any, res: any) => CRUDController.deleteRecord(User, req, res));
router.put("/api/users/:id", async (req: any, res: any) => CRUDController.updateRecord(User, req, res));

// Vehicle (utente operatore)
router.post("/api/vehicles", async (req: any, res: any) => CRUDController.createRecord(Vehicle, req, res));
router.get("/api/vehicles/:plate", async (req: any, res: any) => CRUDController.readOneRecord(Vehicle, req, res));
router.delete("/api/vehicles/:plate", async (req: any, res: any) => CRUDController.deleteRecord(Vehicle, req, res));
router.put("/api/vehicles/:plate", async (req: any, res: any) => CRUDController.updateRecord(Vehicle, req, res));

// Gateway (utente operatore)
router.post("/api/gateways", async (req: any, res: any) => CRUDController.createRecord(Gateway, req, res));
router.get("/api/gateways/:id", async (req: any, res: any) => CRUDController.readOneRecord(Gateway, req, res));
router.delete("/api/gateways/:id", async (req: any, res: any) => CRUDController.deleteRecord(Gateway, req, res));
router.put("/api/gateways/:id", async (req: any, res: any) => CRUDController.updateRecord(Gateway, req, res));

// Segment (utente operatore)
router.post("/api/segments", async (req: any, res: any) => CRUDController.createRecord(Segment, req, res));
router.get("/api/segments/:id_gateway1/:id_gateway2", async (req: any, res: any) => CRUDController.readOneRecord(Segment, req, res));
router.delete("/api/segments/:id_gateway1/:id_gateway2", async (req: any, res: any) => CRUDController.deleteRecord(Segment, req, res));
router.put("/api/segments/:id_gateway1/:id_gateway2", async (req: any, res: any) => CRUDController.updateRecord(Segment, req, res));

// Transit (utente operatore o varco a seconda della funzione)
router.post("/api/transits", async (req: any, res: any) => CRUDController.createRecord(Transit, req, res));
router.get("/api/transits/:id", async (req: any, res: any) => CRUDController.readOneRecord(Transit, req, res));
router.delete("/api/transits/:id", async (req: any, res: any) => CRUDController.deleteRecord(Transit, req, res));
router.put("/api/transits/:plate", async (req: any, res: any) => {
    CRUDController.updateLastTransit(req, res)
    if (await TransitController.checkViolation(req,res)){
        //Controller CRUD per aggiunta Violation
        console.log("TEST VIOLATION!");
    }
});
//router.post("/api/transits/upload")

// Violation (operatore e utente ma in modo particolare)
router.post("/api/violations", async (req: any, res: any) => CRUDController.createRecord(Violation, req, res));
router.get("/api/violations/:id", async (req: any, res: any) => CRUDController.readOneRecord(Violation, req, res));
router.delete("/api/violations/:id", async (req: any, res: any) => CRUDController.deleteRecord(Violation, req, res));
router.put("/api/violations/:id", async (req: any, res: any) => CRUDController.updateRecord(Violation, req, res));

// Limit (solo TEST, NON CRUD)
router.post("/api/limits", async (req: any, res: any) => CRUDController.createRecord(Limit, req, res));
router.get("/api/limits/:vehicle_type", async (req: any, res: any) => CRUDController.readOneRecord(Limit, req, res));
router.delete("/api/limits/:vehicle_type", async (req: any, res: any) => CRUDController.deleteRecord(Limit, req, res));
router.put("/api/limits/:vehicle_type", async (req: any, res: any) => CRUDController.updateRecord(Limit, req, res));

export default router;