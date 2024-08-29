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
import CRUDController from '../controllers/CRUDController'

// Middlewares

const router = Router();

// index prova
router.get("/", (req, res) => res.send("TEST"));

// test CRUD
// User
router.post("/api/users", async (req, res) => CRUDController.createRecord(User, req, res));
router.get("/api/users", async (req, res) => CRUDController.readOneRecord(User, req, res));
router.delete("/api/users/:id", async (req, res) => CRUDController.deleteRecord(User, req, res));
router.put("/api/users/:id", async (req, res) => CRUDController.updateRecord(User, req, res));

// Vehicle
router.post("/api/vehicles", async (req, res) => CRUDController.createRecord(Vehicle, req, res));
router.get("/api/vehicles", async (req, res) => CRUDController.readOneRecord(Vehicle, req, res));
router.delete("/api/vehicles/:plate", async (req, res) => CRUDController.deleteRecord(Vehicle, req, res));
router.put("/api/vehicles/:plate", async (req, res) => CRUDController.updateRecord(Vehicle, req, res));

// Gateway
router.post("/api/gateways", async (req, res) => CRUDController.createRecord(Gateway, req, res));
router.get("/api/gateways", async (req, res) => CRUDController.readOneRecord(Gateway, req, res));
router.delete("/api/gateways/:id", async (req, res) => CRUDController.deleteRecord(Gateway, req, res));
router.put("/api/gateways/:id", async (req, res) => CRUDController.updateRecord(Gateway, req, res));

// Segment
router.post("/api/segments", async (req, res) => CRUDController.createRecord(Segment, req, res));
router.get("/api/segments", async (req, res) => CRUDController.readOneRecord(Segment, req, res));
router.delete("/api/segments/:id", async (req, res) => CRUDController.deleteRecord(Segment, req, res));
router.put("/api/segments/:id", async (req, res) => CRUDController.updateRecord(Segment, req, res));

// Transit
router.post("/api/transits", async (req, res) => CRUDController.createRecord(Transit, req, res));
router.get("/api/transits", async (req, res) => CRUDController.readOneRecord(Transit, req, res));
router.delete("/api/transits/:id", async (req, res) => CRUDController.deleteRecord(Transit, req, res));
router.put("/api/transits/:id", async (req, res) => CRUDController.updateRecord(Transit, req, res));

// Violation
router.post("/api/violations", async (req, res) => CRUDController.createRecord(Violation, req, res));
router.get("/api/violations", async (req, res) => CRUDController.readOneRecord(Violation, req, res));
router.delete("/api/violations/:id", async (req, res) => CRUDController.deleteRecord(Violation, req, res));
router.put("/api/violations/:id", async (req, res) => CRUDController.updateRecord(Violation, req, res));

// Limit
router.post("/api/limits", async (req, res) => CRUDController.createRecord(Limit, req, res));
router.get("/api/limits", async (req, res) => CRUDController.readOneRecord(Limit, req, res));
router.delete("/api/limits/:vehicle_type", async (req, res) => CRUDController.deleteRecord(Limit, req, res));
router.put("/api/limits/:vehicle_type", async (req, res) => CRUDController.updateRecord(Limit, req, res));

export default router;