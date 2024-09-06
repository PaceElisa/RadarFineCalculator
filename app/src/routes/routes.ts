import { Router } from "express";

// Models
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import Gateway from '../models/Gateway';
import Segment from '../models/Segment';
import Transit from '../models/Transit';
import Violation from '../models/Violation';
import Limit from '../models/Limit';
import Payment from "../models/Payment";

// Controllers
import CRUDController from '../controllers/CRUDController';
import loginController from '../controllers/loginController';
import TransitController from "../controllers/TransitController";
import ViolationController from "../controllers/ViolationController";
import PaymentController from "../controllers/PaymentController";

// Middlewares
import authMiddleware from '../middleware/authMiddleware';
import validateData from "../middleware/validateData";
import generalCheck from "../middleware/check";
import { upload } from "../middleware/uploadMIddleware";

//Import factory
import { errorFactory } from "../factory/FailMessage";
import { ErrorMessage } from "../factory/Messages";

const errorMessageFactory: errorFactory = new errorFactory();

const router = Router();

// index prova
router.get("/", (req: any, res: any) => res.send("TEST"));

// Routes per i login
router.post('/login', authMiddleware.validateUserCredentials, loginController.login);
router.post('/loginGateway', authMiddleware.validateGateway, loginController.loginGateway);

// Esempio di una route protetta mettere dappertutto
router.get('/protected', authMiddleware.authenticateJWT, (req, res) => {
    res.status(200).json({ message: 'This is a protected route'});
});

// api con export const
// CRUD
// User (utente operatore) mancano i validate
router.post("/api/users", authMiddleware.authenticateJWT, authMiddleware.isAdmin, async (req: any, res: any) => CRUDController.createRecord(User, req, res));
router.get("/api/users/:id", authMiddleware.authenticateJWT, authMiddleware.isAdmin, async (req: any, res: any) => CRUDController.readOneRecord(User, req, res));
router.delete("/api/users/:id", authMiddleware.authenticateJWT, authMiddleware.isAdmin, async (req: any, res: any) => CRUDController.deleteRecord(User, req, res));
router.put("/api/users/:id", authMiddleware.authenticateJWT, authMiddleware.isAdmin, async (req: any, res: any) => CRUDController.updateRecord(User, req, res));

// Vehicle OK
router.post("/api/vehicles", authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validatePlate, validateData.validateVehicleDataCreation, async (req: any, res: any) => CRUDController.createRecord(Vehicle, req, res));
router.get("/api/vehicles/:plate",authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validatePlate, generalCheck.checkIDParamsExist(Vehicle), async (req: any, res: any) => CRUDController.readOneRecord(Vehicle, req, res));
router.delete("/api/vehicles/:plate",authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validatePlate, generalCheck.checkIDParamsExist(Vehicle), async (req: any, res: any) => CRUDController.deleteRecord(Vehicle, req, res));
router.put("/api/vehicles/:plate",authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validatePlate, generalCheck.checkIDParamsExist(Vehicle), validateData.validateVehicleDataUpdate, async (req: any, res: any) => CRUDController.updateRecord(Vehicle, req, res));

// Gateway OK
router.post("/api/gateways", authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateGatewayDataCreation, async (req: any, res: any) => CRUDController.createRecord(Gateway, req, res));
router.get("/api/gateways/:id", authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(Gateway), async (req: any, res: any) => CRUDController.readOneRecord(Gateway, req, res));
router.delete("/api/gateways/:id",authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(Gateway), async (req: any, res: any) => CRUDController.deleteRecord(Gateway, req, res));
router.put("/api/gateways/:id", authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(Gateway),validateData.validateGatewayDataUpdate, async (req: any, res: any) => CRUDController.updateRecord(Gateway, req, res));

// Segment OK
router.post("/api/segments", authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateSegmentDataCreation, async (req: any, res: any) => CRUDController.createRecord(Segment, req, res));
router.get("/api/segments/:id", authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(Segment), async (req: any, res: any) => CRUDController.readOneRecord(Segment, req, res));
router.delete("/api/segments/:id", authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(Segment), async (req: any, res: any) => CRUDController.deleteRecord(Segment, req, res));
router.put("/api/segments/:id", authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(Segment), validateData.validateSegmentDataUpdate, async (req: any, res: any) => CRUDController.updateRecord(Segment, req, res));



// Transit (utente operatore o varco a seconda della funzione) ritornarci
router.post("/api/transitsimage", upload.single('plate_image'),generalCheck.checkImage, validateData.validatePlate,validateData.validateTransitDataCreation, async (req: any, res: any) => CRUDController.createRecord(Transit, req, res));
// router.post("/api/transitss", async (req: any, res: any) => CRUDController.createRecord(Transit, req, res));
router.get("/api/transits/:id", async (req: any, res: any) => CRUDController.readOneRecord(Transit, req, res));
router.delete("/api/transits/:id", async (req: any, res: any) => CRUDController.deleteRecord(Transit, req, res));
router.put("/api/transits/:plate", async (req: any, res: any) => {
    // unisce i risultati delle due funzioni di update e check violation in un unico json
    try {
        const updateResult = await CRUDController.updateLastTransit(req, res);
        if (updateResult.error) return res.json(updateResult);

        const checkResult = await TransitController.checkViolation(req, res);
        if (checkResult.error) return res.json(checkResult);

        return res.json({
            update: updateResult,
            checkViolation: checkResult
        });
    } catch (error) {
        return res.json({
            error: errorMessageFactory.createMessage(ErrorMessage.generalError, `Unexpected error occurred`)
        });
    }
});
//router.post("/api/transits/upload")

// Filter Unreadable Transits: optional query for filtering by id_gateway (es query ?id=)
router.get("/api/unreadableTransits", authMiddleware.authenticateJWT, authMiddleware.isAdmin, async (req: any, res: any) => TransitController.getUnreadableTransits(req, res));

// Filter Violations for plate and date; driver can only see his plates (es query ?plates=ZZ999ZZ&start_date=2024-01-01T00:00:00Z&end_date=2024-12-01T00:00:00Z)
router.get("/api/violationsfilter", authMiddleware.authenticateJWT, authMiddleware.isAdminOrDriver, async (req: any, res: any) => {
    const user = req.body.user;

    // Se l'utente è un admin, chiama il metodo generico di filtraggio
    if (user.role === 'admin') {
        return ViolationController.getFilteredViolations(req, res);
    }

    // Se l'utente è un driver, chiama il metodo specifico per driver
    if (user.role === 'driver') {
        return ViolationController.getDriverFilteredViolations(req, res);
    }
});

// Route for downloading pdf receipt of violation with specified id
router.get("/api/receipt/:id_violation", async (req: any, res: any) => PaymentController.generatePDFReceipt(req, res));

export default router;