
export interface ShipmentFormData {
    // Customer Information
    name: string;
    email: string;
    phone: string;

    // Origin Address (From)
    from_address: string;
    from_city: string;
    from_state: string;
    from_postal_code: string;
    from_country: string;

    // Destination Address (To)
    to_address: string;
    to_city: string;
    to_state: string;
    to_postal_code: string;
    to_country: string;

    // Package Details
    product: string;
    quantity: number;
    weight: number;
    dimensions: string;
    service_type: string;
    package_type: string;

    // Additional Options
    insurance: boolean;
    signature_required: boolean;
    saturday_delivery: boolean;
    special_instructions: string;
}


export interface TrackingDetailsProps {
    shipment: {
        tracking_number: string;
        name: string;
        email: string;
        phone: string;
        product: string;
        quantity: number;
        weight: number;
        dimensions?: string;
        service_type: string;
        package_type: string;
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
        insurance?: boolean;
        signature_required?: boolean;
        special_instructions?: string;
        order_status: Array<{
            status: string;
            date: string;
            time: string;
            message: string;
            location: string;
        }>;
        current_status: string;
        created_at: string;
    };
}
