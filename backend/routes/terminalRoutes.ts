import express from 'express';
import { getRates, bookShipment, createTerminalWebhook } from '../controllers/terminalController';
import { AuthenticateAdmin, RestrictDemoAdmin } from '../middleware/authAdmin';


const router = express.Router();

router.post('/get-rates', getRates);
router.post('/book-shipment', AuthenticateAdmin, RestrictDemoAdmin, bookShipment);

// Route to create a webhook with Terminal Africa
// This would typically be called once during setup or by an admin
router.post('/admin/create-webhook', AuthenticateAdmin, RestrictDemoAdmin, createTerminalWebhook);

export default router;