import { Router } from "express";

// Models
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import Gateway from '../models/Gateway';
import Segment from '../models/Segment';
import Transit from '../models/Transit';

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
// Instantiate error message factory
const errorMessageFactory: errorFactory = new errorFactory();

// Create an Express router instance
const router = Router();

// API prefix used for all routes
export const API_PREFIX = '/api';

// Login Routes
router.post('/login', authMiddleware.validateUserCredentials, loginController.login);
router.post('/loginGateway', authMiddleware.validateGateway, loginController.loginGateway);

// CRUD Routes for Users
router.post(`${API_PREFIX}/users`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, async (req: any, res: any) => CRUDController.createRecord(User, req, res));
router.get(`${API_PREFIX}/users/:id`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(User), async (req: any, res: any) => CRUDController.readOneRecord(User, req, res));
router.delete(`${API_PREFIX}/users/:id`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(User), async (req: any, res: any) => CRUDController.deleteRecord(User, req, res));
router.put(`${API_PREFIX}/users/:id`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(User), async (req: any, res: any) => CRUDController.updateRecord(User, req, res));

// CRUD Routes for Vehicles
router.post(`${API_PREFIX}/vehicles`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validatePlate, validateData.validateVehicleDataCreation, async (req: any, res: any) => CRUDController.createRecord(Vehicle, req, res));
router.get(`${API_PREFIX}/vehicles/:id`,authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validatePlate, generalCheck.checkIDParamsExist(Vehicle), async (req: any, res: any) => CRUDController.readOneRecord(Vehicle, req, res));
router.delete(`${API_PREFIX}/vehicles/:id`,authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validatePlate, generalCheck.checkIDParamsExist(Vehicle), async (req: any, res: any) => CRUDController.deleteRecord(Vehicle, req, res));
router.put(`${API_PREFIX}/vehicles/:id`,authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validatePlate, generalCheck.checkIDParamsExist(Vehicle), validateData.validateVehicleDataUpdate, async (req: any, res: any) => CRUDController.updateRecord(Vehicle, req, res));

// CRUD Routes for Gateways
router.post(`${API_PREFIX}/gateways`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateGatewayDataCreation, async (req: any, res: any) => CRUDController.createRecord(Gateway, req, res));
router.get(`${API_PREFIX}/gateways/:id`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(Gateway), async (req: any, res: any) => CRUDController.readOneRecord(Gateway, req, res));
router.delete(`${API_PREFIX}/gateways/:id`,authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(Gateway), async (req: any, res: any) => CRUDController.deleteRecord(Gateway, req, res));
router.put(`${API_PREFIX}/gateways/:id`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(Gateway),validateData.validateGatewayDataUpdate, async (req: any, res: any) => CRUDController.updateRecord(Gateway, req, res));

// CRUD Routes for Segments
router.post(`${API_PREFIX}/segments`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateSegmentDataCreation, async (req: any, res: any) => CRUDController.createRecord(Segment, req, res));
router.get(`${API_PREFIX}/segments/:id`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(Segment), async (req: any, res: any) => CRUDController.readOneRecord(Segment, req, res));
router.delete(`${API_PREFIX}/segments/:id`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(Segment), async (req: any, res: any) => CRUDController.deleteRecord(Segment, req, res));
router.put(`${API_PREFIX}/segments/:id`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(Segment), validateData.validateSegmentDataUpdate, async (req: any, res: any) => CRUDController.updateRecord(Segment, req, res));

// Transit Routes
// Gateway can upload an image and specify weather conditions to create a Transit (from the image we get the plate of the vehicle)
router.post(`${API_PREFIX}/transitsimage`, authMiddleware.authenticateJWT, authMiddleware.isGateway, upload.single('plate_image'), generalCheck.checkImage, validateData.validatePlate, validateData.validateTransitDataCreation, async (req: any, res: any) => CRUDController.createRecord(Transit, req, res));
// Admin and Gateway can create a Transit without an image in input
router.post(`${API_PREFIX}/transits`, authMiddleware.authenticateJWT, authMiddleware.isAdminOrGateway, validateData.validatePlate, validateData.validateTransitDataCreation, async (req: any, res: any) => {
    const rolecheck = req.body.rolecheck;
    // If the user is an admin, they can create a Transit with any segment ID
    if (rolecheck === 'admin') {
        CRUDController.createRecord(Transit, req, res)
    }
    // If the user is a gateway, they can only assign a segment ID where id_gateway1 matches the logged gateway's ID
    if (rolecheck === 'gateway') {
        CRUDController.createTransitWithGateway(req, res)
    }
});
// Get a Transit by its ID
router.get(`${API_PREFIX}/transits/transitId/:id`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(Transit), async (req: any, res: any) => CRUDController.readOneRecord(Transit, req, res));
// Get Transits filtered by Gateway ID
router.get(`${API_PREFIX}/transits/GatewayId/:id`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(Gateway), async (req: any, res: any) => TransitController.getTransitsFilteredByGateway(req, res));
// Delete a Transit by its ID
router.delete(`${API_PREFIX}/transits/:id`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(Transit), async (req: any, res: any) => CRUDController.deleteRecord(Transit, req, res));
// Update a Transit by its ID (used to interpret a plate from an image)
router.put(`${API_PREFIX}/transits/transitId/:id`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validateRequestId, generalCheck.checkIDParamsExist(Transit), validateData.validateTransitDataUpdate, async (req: any, res: any) => CRUDController.updateRecord(Transit, req, res));
// Update the `exit_at` field of the last Transit for a vehicle (ID corresponds to the vehicle's plate)
router.put(`${API_PREFIX}/transits/plate/:id`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, validateData.validatePlate, async (req: any, res: any) => {
    try {
        // Combine results of updating the last Transit and checking violations into one JSON response
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

// Filter unreadable Transits with optional query for filtering by gateway ID (example: ?id=1)
router.get(`${API_PREFIX}/unreadableTransits`, authMiddleware.authenticateJWT, authMiddleware.isAdmin, async (req: any, res: any) => TransitController.getUnreadableTransits(req, res));

// Filter Violations by plate and date; driver can only see their own plates (example: ?plates=ZZ999ZZ&start_date=2024-01-01T00:00:00Z&end_date=2024-12-01T00:00:00Z)
router.get(`${API_PREFIX}/violationsfilter`, authMiddleware.authenticateJWT, authMiddleware.isAdminOrDriver, validateData.validateFilterQuery, async (req: any, res: any) => {
    const user = req.body.user;

    // If the user is an admin, call the generic filtering method
    if (user.role === 'admin') {
        ViolationController.getFilteredViolations(req, res);
    }

    // If the user is a driver, call the specific filtering method for drivers
    if (user.role === 'driver') {
        ViolationController.getDriverFilteredViolations(req, res);
    }
});

// Route for downloading a PDF receipt of a violation with a specified ID (driver can only download their own receipts)
router.get(`${API_PREFIX}/receipt/:id_violation`, authMiddleware.authenticateJWT, authMiddleware.isAdminOrDriver, authMiddleware.driverViolationCheck, async (req: any, res: any) => PaymentController.generatePDFReceipt(req, res));

// Export the router to be used in the main application
export default router;