import express from 'express';
import { handleTerminalWebhook } from '../controllers/webhookController';

const router = express.Router();

// This route will receive events from Terminal Africa
// Note: No authentication middleware here, as Terminal Africa sends the request.
// We will implement signature verification inside the controller for security.
router.post('/terminal', handleTerminalWebhook);

export default router;