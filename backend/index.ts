import dotenv from "dotenv";
dotenv.config();
import express, { Express, Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from "express";
const app: Express = express();
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Auth, ShipmentOperations } from './auth/auth'
import { AuthenticateAdmin } from "./middleware/authAdmin";
import { ShipmentFormData } from "./types/auth.types";
import { sendTrackingEmail, sendDynamicEmail } from "./utils/mailer";


// Security Middlewares
app.use(helmet());

// Trust the reverse proxy (Render/Cloudflare) so express-rate-limit gets the correct user IP
app.set('trust proxy', 1);

// STRICT CORS: Only allow your specific frontend domain or localhost to access the API
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    'https://logisticlens.online',
    'https://www.logisticlens.online'
].filter(Boolean) as string[];
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

const PORT = 4000
const auth = new Auth();
const shipment_operations = new ShipmentOperations();


// Rate Limiting Setup
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { code: 429, message: "Too many requests from this IP, please try again later." }
});

const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 failed login attempts per hour
    message: { code: 429, message: "Too many login attempts. Please try again after an hour." }
});

// Apply global rate limiter to all API routes
app.use("/api/", globalLimiter);
// Apply stricter rate limiter to login route
app.use("/api/admin/login", loginLimiter);

// TEMPORARY SETUP ROUTE
app.get("/api/setup-demo", async (request: Request, response: Response) => {
    const result = await auth.createDemoAdmin();
    console.log("result", result);
    response.status(result.code).send(result.message);
});

app.post("/api/admin/login", async (request: Request, response: Response) => {

    const email = request.body.email?.trim() || "";
    const password = request.body.password?.trim() || "";

    if (!email || !password) {
        response.status(404).send({
            message: "email and password required",
            code: 404,
            data: null
        });
        return;
    }

    const feedback = await auth.adminLogin(email, password);
    console.log("feedback", feedback.message)
    if (feedback.code === 200) {
        response.status(200).send({
            message: "admin logged in",
            data: feedback.data
        })
    } else {
        response.status(feedback.code).send({
            message: feedback.message,
            data: feedback.message
        })
    }

});



app.post("/api/admin/registerShipment", AuthenticateAdmin, async (req: Request, res: Response) => {



    const shipment_data: ShipmentFormData = {
        name: req.body.name?.trim() || "",
        email: req.body.email?.trim() || "",
        product: req.body.product?.trim() || '',
        quantity: Number(req.body.quantity) || 0,
        phone: req.body.phone?.trim() || "",
        from_address: req.body.from_address?.trim() || "",
        from_city: req.body.from_city?.trim() || "",
        from_country: req.body.from_country?.trim() || "",
        from_state: req.body.from_state?.trim() || '',
        from_postal_code: req.body.from_postal_code?.trim() || '',
        to_address: req.body.to_address?.trim() || '',
        to_city: req.body.to_city?.trim() || '',
        to_country: req.body.to_country?.trim() || '',
        to_postal_code: req.body.to_postal_code?.trim() || '',
        to_state: req.body.to_state?.trim() || '',
        package_type: req.body.package_type?.trim() || "",
        weight: Number(req.body.weight) || 0,
        service_type: req.body.service_type?.trim() || '',
        insurance: req.body.insurance || false,
        dimensions: req.body.dimensions?.trim() || '',
        signature_required: req.body.signature_required || false,
        saturday_delivery: req.body.saturday_delivery || false,
        special_instructions: req.body.special_instructions?.trim() || '',
        tracking_number: shipment_operations.generateTrackNumber()
    }

    const save_shipment = {
        ...shipment_data,
        order_status: [],
        current_status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
    };
    const feedback = await shipment_operations.registerShipment(save_shipment);
    if (feedback?.code !== 200) {
        res.status(feedback?.code || 500).send({
            message: feedback?.message,
            code: feedback?.code,
            data: feedback?.data
        })
    } else {

        let emailStatus = "not sent";
        // Send tracking email notification
        if (shipment_data.email) {
            const emailResult = await sendTrackingEmail(
                shipment_data.email,
                shipment_data.name || "Customer",
                shipment_data.tracking_number
            );
            if (emailResult.success) {
                emailStatus = "sent successfully";
            } else {
                emailStatus = `failed (${emailResult.error})`;
            }
        }

        res.status(feedback?.code || 200).send({
            message: `${feedback?.message}. Email ${emailStatus}.`,
            code: feedback?.code,
            data: feedback?.data
        })
    }


})

app.post("/api/admin/sendEmail/:trackingNumber", AuthenticateAdmin, async (req: Request, res: Response) => {
    const trackingNumber = req.params.trackingNumber?.trim();
    const { type, subject, message } = req.body;

    const feedback = await shipment_operations.getShipmentByTrackingNumber(trackingNumber);
    if (feedback.code !== 200 || !feedback.data) {
        res.status(404).send({ code: 404, message: "Shipment not found.", data: null });
        return;
    }

    const shipment = feedback.data;
    if (!shipment.email) {
        res.status(400).send({ code: 400, message: "No email address on file for this shipment.", data: null });
        return;
    }

    let finalSubject = subject;
    let htmlContent = "";
    const frontendUrl = process.env.FRONTEND_URL || (process.env.DOMAIN_NAME ? `https://www.${process.env.DOMAIN_NAME}` : 'http://localhost:5173');
    const trackLink = `<a href="${frontendUrl}/track/${trackingNumber}" style="display: inline-block; padding: 10px 20px; margin: 15px 0; color: #ffffff; background-color: #667eea; text-decoration: none; border-radius: 6px; font-weight: bold; border: 1px solid #667eea;">Track Shipment &rarr;</a>`;

    if (type === 'registration') {
        finalSubject = `Your Shipment has been Registered - Tracking ID: ${trackingNumber}`;
        htmlContent = `
            <p>Your shipment has been successfully registered with <strong>LogisticLenz</strong>.</p>
            <p>Your tracking number is: <strong style="font-size: 18px; color: #764ba2;">${trackingNumber}</strong></p>
            <p>You can track your package's progress in real-time on our website using the link below:</p>
            ${trackLink}
            ${message ? `<p><strong>Note:</strong> ${message}</p>` : ''}
        `;
    } else if (type === 'status') {
        finalSubject = `Shipment Status Update - ${trackingNumber}`;
        htmlContent = `
            <p>There is an update regarding your shipment with tracking number: <strong>${trackingNumber}</strong>.</p>
            <p>Current Status: <strong style="text-transform: capitalize; color: #667eea;">${shipment.current_status?.replace('_', ' ') || 'Updated'}</strong></p>
            ${message ? `<p><strong>Update Details:</strong> ${message}</p>` : ''}
            <p>Click below to view full tracking details:</p>
            ${trackLink}
        `;
    } else {
        finalSubject = subject || `Update regarding your shipment ${trackingNumber}`;
        htmlContent = `
            <p>${message?.replace(/\n/g, '<br/>')}</p>
            ${trackLink}
        `;
    }

    const emailResult = await sendDynamicEmail(shipment.email, shipment.name || "Customer", finalSubject, htmlContent);

    if (emailResult.success) {
        res.status(200).send({ code: 200, message: "Email sent successfully!", data: null });
    } else {
        res.status(500).send({ code: 500, message: `Failed to send email: ${emailResult.error}`, data: null });
    }
});

app.get("/api/track/:trackingNumber", async (req: Request, res: Response) => {

    const trackingNumber: string = req.params.trackingNumber?.trim() || "";
    const feedback = await shipment_operations.getShipmentByTrackingNumber(trackingNumber);
    if (feedback.code === 200) {
        res.status(200).send({
            message: feedback.message,
            data: feedback.data,
            code: feedback.code

        })
    } else if (feedback.code === 404) {
        res.status(404).send({
            message: feedback.message,
            data: feedback.data,
            code: feedback.code
        })
    } else {
        res.status(500).send({
            message: feedback.message,
            data: feedback.data,
            code: feedback.code,
        })

    }
});

app.get("/api/admin/getAllShipment", AuthenticateAdmin, async (request: Request, response: Response) => {

    const feedback = await shipment_operations.getAllShipment();
    response.status(feedback.code).send(feedback.data)
})

app.put("/api/admin/updateShipment/:trackingNumber", AuthenticateAdmin, async (request: Request, response: Response) => {
    const trackingNumber = request.params.trackingNumber.trim();
    const updateData = { ...request.body };

    // Remove _id from payload to prevent Mongo immutable field errors
    delete updateData._id;
    updateData.updated_at = new Date();

    const result = await shipment_operations.updateShipmentStatus(
        trackingNumber,
        { $set: updateData }
    );

    if (result?.code === 200) {
        response.status(result.code).send({
            message: result.message,
            code: result.code,
            data: result.data
        });
    } else {
        response.status(result?.code || 500).send({
            message: result?.message,
            code: result?.code,
            data: result?.data
        });
    }
});

app.put("/api/admin/updateShipment/:trackingNumber/status", AuthenticateAdmin, async (request: Request, response: Response) => {


    const { trackingNumber } = request.params;
    const { status, message, location, alert } = request.body;

    const getAdjustedDate = () => {
        const date = new Date();
        date.setHours(date.getHours() - 2);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    // Create status update object
    const statusUpdate = {
        status,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: getAdjustedDate(),
        message: message || '',
        location: location || null
    };

    // Create update object
    const updateData: any = {
        $push: { order_status: statusUpdate },
        $set: {
            current_status: status,
            updated_at: new Date()
        }
    };

    // Add alert if provided
    if (alert && alert.message) {
        updateData.$set.alert = {
            type: alert.type,
            message: alert.message,
            date: new Date()
        };
    } else {
        updateData.$unset = { alert: "" };
    }

    // Update shipment
    const result = await shipment_operations.updateShipmentStatus(
        trackingNumber,
        updateData
    );

    if (result?.code === 200) {
        response.status(result.code).send({
            message: result.message,
            code: result.code,
            data: result.data
        })
    } else {
        response.status(result?.code || 500).send({
            message: result?.message,
            code: result?.code,
            data: result?.data
        })
    }



});

app.delete("/api/admin/deleteShipment/:trackingNumber", AuthenticateAdmin, async (request: Request, response: Response) => {
    const { trackingNumber } = request.params
    const feedback = await shipment_operations.deleteShipment(trackingNumber.trim());
    if (feedback.code !== 200) {
        response.status(feedback.code).send({
            message: feedback.message,
            data: feedback.data,
            code: feedback.code
        })
    } else {

        response.status(feedback.code).send({
            message: feedback.message,
            data: feedback.data,
            code: feedback.code
        })
    }

});




app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`)
})  