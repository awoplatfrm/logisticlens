import express from 'express';
import { getRates, bookShipment } from './terminalController';
import { AuthenticateAdmin, RestrictDemoAdmin } from './middleware/authAdmin';


const router = express.Router();

router.post('/get-rates', getRates);
router.post('/book-shipment', AuthenticateAdmin, RestrictDemoAdmin, bookShipment);

export default router;