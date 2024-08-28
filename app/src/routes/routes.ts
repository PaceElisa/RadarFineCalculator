import { Router } from "express";

// Models
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import Gateway from '../models/Gateway';
import Segment from '../models/Segment';
import Transit from '../models/Transit';
import Violation from '../models/Violation';

// Controllers

// Middlewares

const router = Router();

// index prova
router.get("/", (req, res) => res.send("TEST"));

// test CRUD
// User
router.post("/api/users", async (req, res) => { const user = await User.create(req.body); return res.status(201).json(user);});
router.get("/api/users", async (req, res) => { const users = await User.findAll(); return res.status(200).json(users);});
router.delete("/api/users/:id", async (req, res) => { await User.destroy({ where: { id: req.params.id } }); return res.status(204).send();});
router.put("/api/users/:id", async (req, res) => { await User.update(req.body, { where: { id: req.params.id } }); const updatedUser = await User.findByPk(req.params.id); return res.status(200).json(updatedUser);});

// Vehicle
router.post("/api/vehicles", async (req, res) => { const vehicle = await Vehicle.create(req.body); return res.status(201).json(vehicle);});
router.get("/api/vehicles", async (req, res) => { const vehicles = await Vehicle.findAll(); return res.status(200).json(vehicles);});
router.delete("/api/vehicles/:id", async (req, res) => { await Vehicle.destroy({ where: { plate: req.params.id } }); return res.status(204).send();});
router.put("/api/vehicles/:id", async (req, res) => { await Vehicle.update(req.body, { where: { plate: req.params.id } }); const updatedVehicle = await Vehicle.findByPk(req.params.id); return res.status(200).json(updatedVehicle);});

// Gateway
router.post("/api/gateways", async (req, res) => { const gateway = await Gateway.create(req.body); return res.status(201).json(gateway);});
router.get("/api/gateways", async (req, res) => { const gateways = await Gateway.findAll(); return res.status(200).json(gateways);});
router.delete("/api/gateways/:id", async (req, res) => { await Gateway.destroy({ where: { id: req.params.id } }); return res.status(204).send();});
router.put("/api/gateways/:id", async (req, res) => { await Gateway.update(req.body, { where: { id: req.params.id } }); const updatedGateway = await Gateway.findByPk(req.params.id); return res.status(200).json(updatedGateway);});

// Segment
router.post("/api/segments", async (req, res) => { const segment = await Segment.create(req.body); return res.status(201).json(segment);});
router.get("/api/segments", async (req, res) => { const segments = await Segment.findAll(); return res.status(200).json(segments);});
router.delete("/api/segments/:id", async (req, res) => { await Segment.destroy({ where: { id_gateway1: req.params.id } }); return res.status(204).send();});
router.put("/api/segments/:id", async (req, res) => { await Segment.update(req.body, { where: { id_gateway1: req.params.id } }); const updatedSegment = await Segment.findByPk(req.params.id); return res.status(200).json(updatedSegment);});

// Transit
router.post("/api/transits", async (req, res) => { const transit = await Transit.create(req.body); return res.status(201).json(transit);});
router.get("/api/transits", async (req, res) => { const transits = await Transit.findAll(); return res.status(200).json(transits);});
router.delete("/api/transits/:id", async (req, res) => { await Transit.destroy({ where: { id: req.params.id } }); return res.status(204).send();});
router.put("/api/transits/:id", async (req, res) => { await Transit.update(req.body, { where: { id: req.params.id } }); const updatedTransit = await Transit.findByPk(req.params.id); return res.status(200).json(updatedTransit);});

// Violation
router.post("/api/violations", async (req, res) => { const violation = await Violation.create(req.body); return res.status(201).json(violation);});
router.get("/api/violations", async (req, res) => { const violations = await Violation.findAll(); return res.status(200).json(violations);});
router.delete("/api/violations/:id", async (req, res) => { await Violation.destroy({ where: { id: req.params.id } }); return res.status(204).send();});
router.put("/api/violations/:id", async (req, res) => { await Violation.update(req.body, { where: { id: req.params.id } }); const updatedViolation = await Violation.findByPk(req.params.id); return res.status(200).json(updatedViolation);});

export default router;