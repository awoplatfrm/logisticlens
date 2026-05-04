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


    async deleteShipment(trackingNumber: string) {

        if (!trackingNumber) {
            return {
                message: "customer id is required to delete user",
                data: null,
                code: 400
            }
        } else {


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
        }
    }





}
