import { Request, Response, RequestHandler } from 'express';
import { ShipmentOperations } from '../auth/auth';

const shipment_operations = new ShipmentOperations();

export const handleTerminalWebhook: RequestHandler = async (req: Request, res: Response) => {
    // The raw body is needed for signature verification, which we'll add later in this file.
    // However, the middleware in index.ts has already parsed the JSON body for us
    // and placed it back into req.body.
    // So, we can directly use req.body as the event object.
    const event: any = req.body;

    if (!event) {
        res.status(400).send({ received: false, message: "No event body received" });
        return;
    }

    console.log("\n=== RECEIVED TERMINAL AFRICA WEBHOOK ===");
    console.log("Headers:", req.headers);
    console.log("Event Type:", event?.event);
    console.log("Event Data:", event?.data);
    console.log("========================================\n");

    try {
        // Check if this is an event we care about
        if (event.event && event.event.startsWith('shipment.')) {
            const terminalShipmentId = event.data?.id || event.data?.shipment_id;
            const terminalStatus = (event.data?.status || '').toLowerCase();

            if (terminalShipmentId && terminalStatus) {
                // Map Terminal Africa statuses to our LogisticLens statuses
                let localStatus = 'pending';

                if (terminalStatus === 'processing') localStatus = 'picked_up';
                if (terminalStatus === 'shipped') localStatus = 'in_transit';
                if (terminalStatus === 'out_for_delivery') localStatus = 'out_for_delivery';
                if (terminalStatus === 'delivered') localStatus = 'delivered';
                if (['cancelled', 'returned', 'failed', 'rejected'].includes(terminalStatus)) localStatus = 'exception';

                // Prepare the update query (updates status AND adds to history timeline)
                const updateQuery = {
                    $set: {
                        current_status: localStatus,
                        updated_at: new Date()
                    },
                    $push: {
                        order_status: {
                            status: localStatus,
                            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                            message: `Shipment status updated to '${localStatus.replace('_', ' ')}' by Terminal Africa.`,
                            location: 'Terminal Africa Hub'
                        }
                    }
                };

                // Update the database
                const result = await shipment_operations.updateShipmentByTerminalId(terminalShipmentId, updateQuery);

                if (result.code === 200) {
                    console.log(`✅ Successfully auto-updated shipment ${terminalShipmentId} to status: ${localStatus}`);
                } else {
                    console.log(`⚠️ Could not find a local shipment matching Terminal ID: ${terminalShipmentId}`);
                }
            }
        }

        // Always return 200 OK so Terminal Africa knows we received it
        res.status(200).send({ received: true, message: "Webhook processed successfully" });

    } catch (error) {
        console.error("❌ Error processing webhook:", error);
        // Return 500 if our code crashes so Terminal Africa might retry
        res.status(500).send({ received: false, message: "Error processing webhook" });
    }
};