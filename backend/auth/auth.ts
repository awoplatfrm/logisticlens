import mongodb, { MongoClient, ObjectId, Db, Collection } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config()
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { ShipmentFormData } from '../types/auth.types';


class Database {
    protected client: MongoClient;
    protected db: Db;
    protected collection: Collection;

    constructor() {
        this.client = new MongoClient(process.env.DB_URL as string);
        this.db = this.client.db(process.env.DB_NAME);
        this.collection = this.db.collection(process.env.DB_TB as string);
    }
}



export class Auth extends Database {

    async adminLogin(email: string, password: string) {
        try {
            // Find admin by email 
            const admin = await this.db.collection('admins').findOne({ email });
            // console.log("admin", admin)

            if (!admin) {
                return { code: 401, message: 'admin does not exist', data: null };
            }
            // Compare password
            const isValid = await bcrypt.compare(password, admin.password);

            if (!isValid) {
                return { code: 401, message: 'Invalid credentials', data: null };
            }

            //generate token for admin to login
            const token = jwt.sign({
                id: admin._id,
                email: admin.email,
                loginTime: new Date().toISOString()
            }, process.env.JWT_KEY as string, { expiresIn: "7d" });

            const updateAdmin = await this.db.collection("admins").updateOne({ _id: admin._id }, {
                $set: {
                    currentToken: token,
                    lastLogin: new Date()
                }
            });


            return {
                code: 200,
                message: 'Login successful',
                data: { token, admin: { email: admin.email } }
            };

        } catch (error) {
            return { code: 500, message: `Login error: ${error}`, data: null };
        }


    }

    async createDemoAdmin() {
        try {
            const email = "demo@logisticlens.online";
            const existing = await this.db.collection('admins').findOne({ email });
            if (existing) {
                return { code: 200, message: "Demo admin already exists!" };
            }

            const hashedPassword = await bcrypt.hash("demo12345", 10);
            await this.db.collection('admins').insertOne({
                email: email,
                password: hashedPassword,
                createdAt: new Date()
            });

            return { code: 200, message: "Demo admin created successfully! You can now log in with demo@logisticlens.online and demo12345" };
        } catch (error) {
            return { code: 500, message: `Error: ${error}` };
        }
    }

    async getAllDemos() {
        try {
            const demos = await this.db.collection('admins').find({ role: 'demo' }).project({ password: 0 }).toArray();
            return { code: 200, message: "Demos retrieved", data: demos };
        } catch (error) {
            return { code: 500, message: `Error: ${error}`, data: null };
        }
    }

    async createDemoAccount(email: string, password: string) {
        try {
            const existing = await this.db.collection('admins').findOne({ email });
            if (existing) {
                return { code: 400, message: "An account with this email already exists!", data: null };
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await this.db.collection('admins').insertOne({
                email: email,
                password: hashedPassword,
                role: 'demo',
                createdAt: new Date()
            });

            return { code: 200, message: "Demo account created successfully!", data: null };
        } catch (error) {
            return { code: 500, message: `Error: ${error}`, data: null };
        }
    }

    async deleteDemoAccount(id: string) {
        try {
            const result = await this.db.collection('admins').deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount > 0) {
                return { code: 200, message: "Demo account deleted successfully!", data: null };
            } else {
                return { code: 404, message: "Demo account not found!", data: null };
            }
        } catch (error) {
            return { code: 500, message: `Error: ${error}`, data: null };
        }
    }

    async verifyToken(token: string): Promise<boolean> {

        try {
            const decoded = jwt.verify(token, process.env.JWT_KEY as string) as JwtPayload;
            if (typeof decoded === "string") {
                console.log("payload is string");
                return false;
            }

            const userId = decoded.id.toString() as string;


            const admin = await this.db.collection("admins").findOne({ _id: new ObjectId(userId), currentToken: token });
            return !!admin;


        } catch (error) {
            return false
        }

    }


}


export class ShipmentOperations extends Database {

    generateTrackNumber(): string {
        const name = "LENZ"
        return `${name}-${Math.random().toString(34).substring(2, 9).toUpperCase()}`
    }
    async registerTerminalShipment(shipment_data: ShipmentFormData) {
        return await this.db.collection("shipments").insertOne(shipment_data);
    }
    async registerShipment(shipment_data: ShipmentFormData) {
        // console.log("shipment data", shipment_data);


        try {

            const feedback = await this.db.collection("shipments").insertOne(shipment_data);
            if (!feedback) {
                return {
                    message: "something went wrong try again",
                    code: 500,
                    data: null
                }
            } else {
                const shipment = await this.getShipmentByTrackingNumber(shipment_data.tracking_number);
                if (shipment.code === 200) {
                    return {
                        message: "shipment registered successfully",
                        code: 200,
                        data: shipment.data
                    }
                } else {
                    return {
                        message: "shipment registered successfully but could not get the data",
                        code: 200,
                        data: feedback
                    }
                }
            }




        } catch (error) {
            return ({
                message: `${error} while saving shipment}`,
                data: null,
                code: 500
            })
        }


    }

    async getShipmentByTrackingNumber(tracking_number: any) {

        if (!tracking_number) {

            return ({
                message: "Tracking number is required for getting order",
                code: 400,
                data: null
            });

        } else {
            const feedback = await this.db.collection("shipments").findOne({ tracking_number })
            // 
            if (feedback) {
                return ({
                    message: "Order found",
                    data: feedback,
                    code: 200
                });
            } else {
                return ({
                    message: "Order not found",
                    data: null,
                    code: 404
                });
            }
        }
    }

    async getAllShipment() {
        const response = await this.db.collection("shipments").find().toArray();
        if (response) {
            return {
                message: "shipments found",
                code: 200,
                data: response
            }
        } else {
            return {
                message: "something wents wrong",
                code: 500,
                data: null
            }
        }
    }

    async updateShipmentStatus(tracking_number: string, shipment_data: any) {
        try {
            const result = await this.db.collection("shipments").updateOne({ tracking_number: tracking_number }, shipment_data);

            if (result?.matchedCount === 0) {
                return {
                    code: 404,
                    message: 'Shipment not found',
                    data: null
                };
            }

            return {
                code: 200,
                message: 'Status updated successfully',
                data: {
                    tracking_number: tracking_number,
                    statusUpdatedData: shipment_data,

                }
            };
        } catch (error) {
            console.log("something went wrong", error)
        }
    }

    async updateShipmentByTerminalId(terminal_shipment_id: string, update_query: any) {
        try {
            const result = await this.db.collection("shipments").updateOne(
                { terminal_shipment_id: terminal_shipment_id },
                update_query
            );

            if (result?.matchedCount === 0) {
                return {
                    code: 404,
                    message: 'Shipment not found by terminal ID',
                    data: null
                };
            }

            return {
                code: 200,
                message: 'Status updated successfully via webhook',
                data: null
            };
        } catch (error) {
            console.log("Error updating shipment by terminal ID:", error);
            return { code: 500, message: "Internal server error" };
        }
    }


    async deleteShipment(trackingNumber: string) {

        if (!trackingNumber) {
            return {
                message: "Tracking number is required to delete shipment",
                data: null,
                code: 400
            }
        } else {
            try {
                const shipmentToDelete = await this.db.collection("shipments").findOne({ tracking_number: trackingNumber });

                if (!shipmentToDelete) {
                    return {
                        message: "Shipment not found",
                        data: null,
                        code: 404
                    };
                }

                // If it's a Terminal Africa shipment, attempt to cancel it first
                if (shipmentToDelete.terminal_shipment_id) {
                    // Dynamically import TerminalService to avoid circular dependency
                    const { TerminalService } = await import('../utils/terminal');
                    console.log(`Attempting to cancel Terminal Africa shipment ID: ${shipmentToDelete.terminal_shipment_id}`);
                    const cancelResult = await TerminalService.cancelShipment(shipmentToDelete.terminal_shipment_id);

                    if (!cancelResult.success) {
                        console.error(`Failed to cancel shipment with Terminal Africa: ${cancelResult.error}`);
                        // Optionally, you could return an error here and prevent local deletion
                        // return {
                        //     message: `Failed to cancel shipment with Terminal Africa: ${cancelResult.error}`,
                        //     data: null,
                        //     code: 500
                        // };
                    } else {
                        console.log(`Successfully cancelled shipment with Terminal Africa: ${shipmentToDelete.terminal_shipment_id}`);
                    }
                }


                const response = await this.db.collection("shipments").deleteOne({ tracking_number: trackingNumber })
                console.log("delete", response)
                if (response.deletedCount > 0) {
                    return {
                        message: "user deleted succcessfully",
                        data: null,
                        code: 200
                    }
                } else {
                    return {
                        message: "could not delete user, something went wrong!",
                        data: null,
                        code: 500
                    }
                }
            } catch (error) {
                console.error("Error deleting shipment:", error);
                return {
                    message: `Error deleting shipment: ${error}`,
                    data: null,
                    code: 500
                };
            }
        }
    }





}
