import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Create a dedicated axios instance for Terminal Africa
export const terminalApi = axios.create({
    headers: {
        'Content-Type': 'application/json'
    }
});

terminalApi.interceptors.request.use((config) => {
    // Safely get the key and trim any accidental whitespace or newlines
    const key = (process.env.TERMINAL_AFRICA_SECRET_KEY || '').trim();

    // Dynamically route to Sandbox or Live based on the API Key
    const isTestKey = key.startsWith('sk_test');
    config.baseURL = isTestKey ? 'https://sandbox.terminal.africa/v1' : 'https://api.terminal.africa/v1';

    config.headers.set('Authorization', `Bearer ${key}`);
    return config;
});

export const TerminalService = {
    // Phase 1 Test: Fetch all available carriers (DHL, FedEx, etc.)
    getCarriers: async () => {
        try {
            const response = await terminalApi.get('/carriers');
            return { success: true, data: response.data.data };
        } catch (error: any) {
            console.error("Terminal API Error:", error.response?.data || error.message);
            return { success: false, error: error.response?.data?.message || error.message };
        }
    },

    // Phase 1: Fetch Live Shipping Rates
    getRates: async (pickup_address: any, delivery_address: any, parcel_details: any) => {
        try {

            // 4. Request Rates from Couriers
            const packaging_payload = {
                weight_unit: "kg",
                weight: parcel_details.weight,
                length: parcel_details.length,
                width: parcel_details.width,
                height: parcel_details.height,
                size_unit: "cm",
                type: "box",
                name: "General Goods",

            }

            const packaging = await terminalApi.post("/packaging", packaging_payload);
            if (packaging) {

                const packagingId = packaging.data.data.packaging_id || packaging.data.data.id;
                const parcel = {
                    description: "General Goods",
                    packaging: packagingId, // Use the created packaging ID
                    items: parcel_details.items || [ // Use items from parcel_details or fallback
                        {
                            name: "General Goods",
                            description: "General Goods",
                            value: parcel_details.items?.[0]?.value || 5000, // Use dynamic value or default
                            currency: parcel_details.items?.[0]?.currency || "NGN", // Use dynamic currency or default
                            quantity: parcel_details.items?.[0]?.quantity || 1, // Use dynamic quantity or default
                            weight: parcel_details.items?.[0]?.weight || parcel_details.weight, // Use dynamic weight or default
                        }
                    ],
                    weight_unit: "kg",
                    weight: parcel_details.weight, // Ensure parcel weight is also dynamic
                };
                // Pass the objects directly instead of creating addresses first!
                const ratesRes = await terminalApi.post("/rates/shipment/quotes", { pickup_address, delivery_address, parcel });
                return { success: true, data: ratesRes.data.data || [] }; // Corrected: ratesRes.data.data is already the array of rates
            }

        } catch (error: any) {
            console.error("Terminal Rate Error:", JSON.stringify(error.response?.data || error.message, null, 2));
            const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || error.message;
            return { success: false, error: errorMessage };
        }
    },

    // Phase 2: Book a Shipment
    bookShipment: async (rate_id: string, pickup_address: any, delivery_address: any, parcel_details: any) => {
        try {
            // 1. Create Addresses in Terminal Africa and get their IDs
            const pickupRes = await terminalApi.post('/addresses', pickup_address);
            const pickupId = pickupRes.data.data.address_id || pickupRes.data.data.id;

            const deliveryRes = await terminalApi.post('/addresses', delivery_address);
            const deliveryId = deliveryRes.data.data.address_id || deliveryRes.data.data.id;

            // 2. Recreate the EXACT same packaging object used in the quote
            const packaging_payload = {
                weight_unit: parcel_details.weight_unit || "kg",
                weight: parcel_details.weight,
                length: parcel_details.length || 20,
                width: parcel_details.width || 20,
                height: parcel_details.height || 20,
                size_unit: parcel_details.distance_unit || "cm",
                type: "box",
                name: "General Goods",
            };
            const packaging = await terminalApi.post("/packaging", packaging_payload);
            const packagingId = packaging.data.data.packaging_id || packaging.data.data.id;

            // 3. Create the Parcel and get its ID
            const parcelPayload = {
                description: parcel_details.description,
                weight_unit: parcel_details.weight_unit || "kg",
                weight: parcel_details.weight,
                packaging: packagingId, // Must use the ID, not raw dimensions!
                items: parcel_details.items
            };
            const parcelRes = await terminalApi.post('/parcels', parcelPayload);
            const parcelId = parcelRes.data.data.parcel_id || parcelRes.data.data.id;

            // 4. Book the Shipment using ONLY the IDs
            const bookingPayload: any = {
                rate_id: rate_id,
                address_from: pickupId,
                address_to: deliveryId,
                parcel: parcelId
            };

            console.log("\n=== FINAL BOOKING PAYLOAD SENT TO TERMINAL AFRICA ===");
            console.log(JSON.stringify(bookingPayload, null, 2));
            console.log("=====================================================\n");
            const response = await terminalApi.post('/shipments', bookingPayload);
            return { success: true, data: response.data.data };
        } catch (error: any) {
            console.error("Terminal Booking Error:", JSON.stringify(error.response?.data || error.message, null, 2));
            const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || error.message;
            return { success: false, error: errorMessage };
        }
    },

    // Phase 3: Cancel a Shipment with Terminal Africa
    cancelShipment: async (terminalShipmentId: string) => {
        try {
            const response = await terminalApi.delete(`/shipments/${terminalShipmentId}`);
            return { success: true, data: response.data };
        } catch (error: any) {
            console.error("Terminal Cancel Shipment Error:", JSON.stringify(error.response?.data || error.message, null, 2));
            const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || error.message;
            return { success: false, error: errorMessage };
        }
    },

    // Phase 3: Create a Webhook with Terminal Africa
    createWebhook: async (name: string, url: string, events: string[], active: boolean, live: boolean) => {
        try {
            console.log("\n--- Attempting to Create Terminal Africa Webhook ---");
            const webhookPayload = {
                name,
                url,
                events,
                active,
                live
            };
            console.log("Webhook Payload being sent:", JSON.stringify(webhookPayload, null, 2));
            const response = await terminalApi.post('/webhooks', webhookPayload);
            console.log("Terminal Africa Webhook Creation Response:", JSON.stringify(response.data, null, 2));
            return { success: true, data: response.data.data };
        } catch (error: any) {
            console.error("Terminal Create Webhook Error:", JSON.stringify(error.response?.data || error.message, null, 2));
            const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || error.message;
            return { success: false, error: errorMessage };
        }
    }
};