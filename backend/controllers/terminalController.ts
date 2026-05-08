import { Request, Response, NextFunction, RequestHandler } from 'express'; // Import NextFunction and RequestHandler
import { TerminalService } from '../utils/terminal';
import { ShipmentOperations } from '../auth/auth';
import { sendTrackingEmail } from '../utils/mailer';
import { ShipmentFormData } from '../types/auth.types';

const shipment_operations = new ShipmentOperations();

const formatLocationName = (name: string | undefined, defaultName: string) => {
    if (!name) return defaultName;
    if (name.includes("Federal Capital Territory")) return "Abuja";
    return name.replace(/\s+(State|Province|Region|City)$/i, '').trim();
};

export const getRates = async (request: Request, response: Response) => {
    const formData = request.body;
    const requestedCurrency = formData.currency || "NGN";

    // Pass ONLY the location requirements for the quote as per Terminal Africa docs
    const pickup = {
        city: formatLocationName(formData.fromCity, ""),
        state: formatLocationName(formData.from_state, ""),
        country: formData.fromCountryCode || "NG",
        zip: formData.fromPostalCode || ""
    };

    const delivery = {
        city: formatLocationName(formData.toCity, ""),
        state: formatLocationName(formData.to_state, ""),
        country: formData.toCountryCode || "US",
        zip: formData.toPostalCode || ""
    };

    const parcel = {
        weight: Number(formData.weight) || 1,
        length: Number(formData.length) || 20,
        width: Number(formData.width) || 20,
        height: Number(formData.height) || 20,
        items: [
            {
                name: "General Goods",
                description: "General Goods",
                value: 5000,
                currency: requestedCurrency,
                quantity: 1,
                weight: Number(formData.weight) || 1
            }
        ]
    };

    const result = await TerminalService.getRates(pickup, delivery, parcel);

    if (result?.success) {
        response.status(200).send({ code: 200, data: result.data });
    } else {
        response.status(400).send({ code: 400, message: result?.error, data: null });
    }
};

export const bookShipment = async (request: Request, response: Response) => {
    const { selectedRate, quoteData, bookingData } = request.body;

    if (!selectedRate || !quoteData || !bookingData) {
        response.status(400).send({ code: 400, message: "Missing required booking data.", data: null });
        return;
    }

    const requestedCurrency = quoteData.currency || "NGN";

    // Combine quote locations with booking specific details
    const pickup = {
        first_name: bookingData.sender_first_name,
        last_name: bookingData.sender_last_name,
        email: bookingData.sender_email,
        phone: bookingData.sender_phone,
        alt_phone: bookingData.sender_alt_phone,
        line1: bookingData.sender_line1,
        line2: bookingData.sender_line2,
        city: formatLocationName(quoteData.fromCity, ""),
        state: formatLocationName(quoteData.from_state, ""),
        country: quoteData.fromCountryCode,
        zip: bookingData.sender_postal_code || quoteData.fromPostalCode || ""
    };

    const delivery = {
        first_name: bookingData.receiver_first_name,
        last_name: bookingData.receiver_last_name,
        email: bookingData.receiver_email,
        phone: bookingData.receiver_phone,
        alt_phone: bookingData.receiver_alt_phone,
        line1: bookingData.receiver_line1,
        line2: bookingData.receiver_line2,
        city: formatLocationName(quoteData.toCity, ""),
        state: formatLocationName(quoteData.to_state, ""),
        country: quoteData.toCountryCode,
        zip: bookingData.receiver_postal_code || quoteData.toPostalCode || ""
    };

    const parcel_details = {
        description: bookingData.parcel_description || "General Goods",
        weight_unit: "kg",
        weight: Number(quoteData.weight) || 1,
        length: Number(quoteData.length) || 20,
        width: Number(quoteData.width) || 20,
        height: Number(quoteData.height) || 20,
        distance_unit: "cm",
        items: [
            {
                name: bookingData.parcel_description || "General Goods",
                description: bookingData.parcel_description || "General Goods",
                value: Number(bookingData.parcel_value) || 5000,
                currency: requestedCurrency,
                quantity: 1,
                weight: Number(quoteData.weight) || 1
            }
        ]
    };

    try {
        const bookingResult = await TerminalService.bookShipment(selectedRate.id, pickup, delivery, parcel_details);

        if (!bookingResult.success || !bookingResult.data) {
            response.status(400).send({ code: 400, message: bookingResult.error || "Failed to book shipment.", data: null });
            return;
        }

        const terminalShipment = bookingResult.data;

        const generatedTrackingNumber = shipment_operations.generateTrackNumber();

        // Register in MongoDB
        const shipment_data: ShipmentFormData = {
            name: `${delivery.first_name} ${delivery.last_name}`,
            email: delivery.email,
            phone: delivery.phone,
            from_address: pickup.line1,
            from_city: pickup.city,
            from_state: pickup.state,
            from_postal_code: pickup.zip,
            from_country: pickup.country,
            to_address: delivery.line1,
            to_city: delivery.city,
            to_state: delivery.state,
            to_postal_code: delivery.zip,
            to_country: delivery.country,
            product: parcel_details.description,
            quantity: parcel_details.items[0].quantity,
            weight: parcel_details.weight,
            dimensions: `${parcel_details.length} x ${parcel_details.width} x ${parcel_details.height} ${parcel_details.distance_unit}`,
            service_type: selectedRate.carrier_name,
            package_type: "Box",
            insurance: false,
            signature_required: false,
            saturday_delivery: false,
            special_instructions: "",
            tracking_number: generatedTrackingNumber,
            terminal_shipment_id: terminalShipment.id || terminalShipment.shipment_id,
            terminal_waybill_url: terminalShipment.extras?.waybill_url || terminalShipment.waybill_url,
            terminal_rate_id: selectedRate.id
        };

        const save_shipment = {
            ...shipment_data,
            order_status: [{ status: 'pending', date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString(), message: `Shipment booked with ${selectedRate.carrier_name}.`, location: `${pickup.city}, ${pickup.country}` }],
            current_status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
            terminal_metadata: terminalShipment // Capture all extra details from Terminal Africa
        };

        await shipment_operations.registerShipment(save_shipment);
        if (shipment_data.email) {
            await sendTrackingEmail(shipment_data.email, shipment_data.name, shipment_data.tracking_number);
        }

        response.status(200).send({
            code: 200,
            data: {
                tracking_number: generatedTrackingNumber,
                waybill_url: terminalShipment.extras?.waybill_url || terminalShipment.waybill_url || '',
                carrier_name: selectedRate.carrier_name
            }
        });
    } catch (error: any) {
        console.error("Error in /api/book-shipment:", error);
        response.status(500).send({ code: 500, message: error.message || "An unexpected error occurred.", data: null });
    }
};

export const createTerminalWebhook: RequestHandler = async (request: Request, response: Response) => {
    const { name } = request.body; // Only name is dynamic, others can be defaults or from env

    const webhookUrl = process.env.TERMINAL_WEBHOOK_URL; // Get from environment variable
    const defaultEvents = ["shipment.status_updated", "shipment.delivered", "shipment.created", "shipment.cancelled"];
    const active = true; // Always create active webhook via this trigger

    if (!webhookUrl) {
        response.status(500).send({ code: 500, message: "TERMINAL_WEBHOOK_URL environment variable is not set.", data: null });
        return;
    }

    // Determine if it's a live webhook based on the API key used
    const isTestKey = (process.env.TERMINAL_AFRICA_SECRET_KEY || '').trim().startsWith('sk_test');
    const live = !isTestKey; // If it's a test key, live is false. If it's a live key, live is true.

    // Ensure webhookUrl is HTTPS for live webhooks
    if (live && !webhookUrl.startsWith('https://')) {
        response.status(400).send({ code: 400, message: "Live webhooks must use an HTTPS URL. Please ensure TERMINAL_WEBHOOK_URL is HTTPS.", data: null });
        return;
    }

    try {
        // Force a unique name to rule out conflicts, but use standard Terminal Africa event names
        const uniqueName = `LL-Webhook-${Date.now()}`;
        const validEvents = ["shipment.created", "shipment.updated", "shipment.delivered", "shipment.cancelled"];
        const result = await TerminalService.createWebhook(uniqueName, webhookUrl, validEvents, active, live);

        if (result.success) {
            response.status(200).send({
                code: 200,
                message: "Webhook created successfully with Terminal Africa.",
                data: result.data
            });
        } else {
            response.status(400).send({
                code: 400,
                message: result.error || "Failed to create webhook with Terminal Africa.",
                data: null
            });
        }
    } catch (error: any) {
        console.error("Error creating Terminal Africa webhook:", error);
        response.status(500).send({ code: 500, message: error.message || "An unexpected error occurred.", data: null });
    }
};