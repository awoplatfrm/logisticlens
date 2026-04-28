import { api } from "./api";
import { ShipmentFormData } from "../types/shipment.types";




export const shipments = {

    register_shipment: async (shipment_data: ShipmentFormData) => {
        return await api.post('/admin/registerShipment', shipment_data)
    },

    track_shipment: async (trackingNumber: string) => {
        return await api.get(`/track/${trackingNumber}`)
    },

    get_all_shipment: async () => {
        return await api.get('/admin/getAllShipment');
    },
    updateShipments: async (trackingNumber: string, shipment_data: any) => {
        return await api.put(`/admin/updateShipment/${trackingNumber}`, shipment_data)
    },
    updateShipmentsStatus: async (trackingNumber: string, status_data: any) => {
        return await api.put(`/admin/updateShipment/${trackingNumber}/status`, status_data)
    },
    deleteShipment: async (trackingNumber: string) => {
        return await api.delete(`/admin/deleteShipment/${trackingNumber}`)

    },
    sendEmail: async (trackingNumber: string, emailData: any) => {
        return await api.post(`/admin/sendEmail/${trackingNumber}`, emailData)
    }




}