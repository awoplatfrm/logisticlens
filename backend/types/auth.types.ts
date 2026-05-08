export interface ShipmentFormData {
    name: string;
    email: string;
    phone: string;

    from_address: string;
    from_city: string;
    from_state: string;
    from_postal_code: string;
    from_country: string;

    to_address: string;
    to_city: string;
    to_state: string;
    to_postal_code: string;
    to_country: string;

    product: string;
    quantity: number;
    weight: number;
    dimensions?: string;
    service_type: string;
    package_type?: string;

    insurance: boolean;
    signature_required: boolean;
    saturday_delivery: boolean;
    special_instructions?: string;
    tracking_number: string;
    terminal_shipment_id?: string; // New field for Terminal Africa's shipment ID
    terminal_waybill_url?: string; // New field for Terminal Africa's waybill URL
    terminal_rate_id?: string; // New field to store the rate ID used
    terminal_webhook_id?: string; // New field to store the webhook ID if needed
}