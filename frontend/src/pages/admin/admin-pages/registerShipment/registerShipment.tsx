// frontend/src/pages/AdminShipmentForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipments } from '../../../../services/shipments';
import { ShipmentFormData } from '../../../../types/shipment.types';
import './registerShipment.css'

// interface ShipmentFormData {
//     // Customer Information
//     name: string;
//     email: string;
//     phone: string;

//     // Origin Address (From)
//     from_address: string;
//     from_city: string;
//     from_state: string;
//     from_postal_code: string;
//     from_country: string;

//     // Destination Address (To)
//     to_address: string;
//     to_city: string;
//     to_state: string;
//     to_postal_code: string;
//     to_country: string;

//     // Package Details
//     product: string;
//     quantity: number;
//     weight: number;
//     dimensions: string;
//     service_type: string;
//     package_type: string;

//     // Additional Options
//     insurance: boolean;
//     signature_required: boolean;
//     saturday_delivery: boolean;
//     special_instructions: string;
// }

const AdminShipmentForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState<ShipmentFormData>({
        name: '',
        email: '',
        phone: '',

        from_address: '',
        from_city: '',
        from_state: '',
        from_postal_code: '',
        from_country: '',

        to_address: '',
        to_city: '',
        to_state: '',
        to_postal_code: '',
        to_country: '',

        product: '',
        quantity: 1,
        weight: 1,
        dimensions: '',
        service_type: '',
        package_type: '',

        insurance: false,
        signature_required: false,
        saturday_delivery: false,
        special_instructions: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;

        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            setFormData(prev => ({
                ...prev,
                [id]: checkbox.checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [id]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // console.log("form data", formData)
            const response = await shipments.register_shipment(formData);

            if (response.data.code === 200) {
                setSuccess(`Shipment registered! Tracking #: ${response.data.data.tracking_number}`);
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    from_address: '',
                    from_city: '',
                    from_state: '',
                    from_postal_code: '',
                    from_country: '',
                    to_address: '',
                    to_city: '',
                    to_state: '',
                    to_postal_code: '',
                    to_country: '',
                    product: '',
                    quantity: 1,
                    weight: 1,
                    dimensions: '',
                    service_type: '',
                    package_type: '',
                    insurance: false,
                    signature_required: false,
                    saturday_delivery: false,
                    special_instructions: ''
                });
            } else {
                setError(response.data.message || 'Failed to register shipment');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error registering shipment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="shipment-container">
            <button
                onClick={() => navigate('/admin')}
                style={{ padding: '10px 20px', background: '#ffffff', border: '1px solid #eef2f6', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#555', fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', alignSelf: 'flex-start' }}
            >
                &larr; Back to Dashboard
            </button>

            <div className="shipment-card">
                <div className="shipment-header">
                    <h2>Register New Shipment</h2>
                    <p>Enter customer, origin, and destination details below</p>
                </div>

                {error && <div className="error-message">⚠️ {error}</div>}
                {success && <div className="success-message">✅ {success}</div>}

                <form onSubmit={handleSubmit} className="shipment-form">
                    {/* Customer Information */}
                    <div className="form-section">
                        <h3>Customer Information</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="phone">Phone *</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 234 567 8900"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Origin Address (From) */}
                    <div className="form-section">
                        <h3>Origin Address (From)</h3>
                        <div className="form-group full-width">
                            <label htmlFor="from_address">Street Address *</label>
                            <input
                                type="text"
                                id="from_address"
                                value={formData.from_address}
                                onChange={handleChange}
                                placeholder="123 Shipping Lane"
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="from_city">City *</label>
                                <input
                                    type="text"
                                    id="from_city"
                                    value={formData.from_city}
                                    onChange={handleChange}
                                    placeholder="New York"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="from_state">State/Province *</label>
                                <input
                                    type="text"
                                    id="from_state"
                                    value={formData.from_state}
                                    onChange={handleChange}
                                    placeholder="NY"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="from_postal_code">Postal Code *</label>
                                <input
                                    type="text"
                                    id="from_postal_code"
                                    value={formData.from_postal_code}
                                    onChange={handleChange}
                                    placeholder="10001"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="from_country">Country *</label>
                                <select
                                    id="from_country"
                                    value={formData.from_country}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select country</option>
                                    <option value="US">United States</option>
                                    <option value="CA">Canada</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="ET">Ethiopia</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Destination Address (To) */}
                    <div className="form-section">
                        <h3>Destination Address (To)</h3>
                        <div className="form-group full-width">
                            <label htmlFor="to_address">Street Address *</label>
                            <input
                                type="text"
                                id="to_address"
                                value={formData.to_address}
                                onChange={handleChange}
                                placeholder="456 Receiving Ave"
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="to_city">City *</label>
                                <input
                                    type="text"
                                    id="to_city"
                                    value={formData.to_city}
                                    onChange={handleChange}
                                    placeholder="Los Angeles"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="to_state">State/Province *</label>
                                <input
                                    type="text"
                                    id="to_state"
                                    value={formData.to_state}
                                    onChange={handleChange}
                                    placeholder="CA"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="to_postal_code">Postal Code *</label>
                                <input
                                    type="text"
                                    id="to_postal_code"
                                    value={formData.to_postal_code}
                                    onChange={handleChange}
                                    placeholder="90001"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="to_country">Country *</label>
                                <select
                                    id="to_country"
                                    value={formData.to_country}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select country</option>
                                    <option value="US">United States</option>
                                    <option value="CA">Canada</option>
                                    <option value="ET">Ethiopia</option>
                                    <option value="UK">United Kingdom</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Package Details */}
                    <div className="form-section">
                        <h3>Package Details</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="product">Product Description *</label>
                                <input
                                    type="text"
                                    id="product"
                                    value={formData.product}
                                    onChange={handleChange}
                                    placeholder="Electronics, Documents, etc."
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="quantity">Quantity *</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="weight">Weight (kg) *</label>
                                <input
                                    type="number"
                                    id="weight"
                                    step="0.1"
                                    min="0.1"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="dimensions">Dimensions (cm)</label>
                                <input
                                    type="text"
                                    id="dimensions"
                                    value={formData.dimensions}
                                    onChange={handleChange}
                                    placeholder="30 x 20 x 15"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="service_type">Service Type *</label>
                                <select
                                    id="service_type"
                                    value={formData.service_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select service</option>
                                    <option value="air">Air Freight</option>
                                    <option value="sea">Sea Freight</option>
                                    <option value="road">Road Freight</option>
                                    <option value="express">Express Delivery</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="package_type">Package Type *</label>
                                <select
                                    id="package_type"
                                    value={formData.package_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select type</option>
                                    <option value="box">Box</option>
                                    <option value="envelope">Envelope</option>
                                    <option value="pallet">Pallet</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Additional Options */}
                    <div className="form-section">
                        <h3>Additional Options</h3>
                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    id="insurance"
                                    checked={formData.insurance}
                                    onChange={handleChange}
                                />
                                Insurance
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    id="signature_required"
                                    checked={formData.signature_required}
                                    onChange={handleChange}
                                />
                                Signature Required
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    id="saturday_delivery"
                                    checked={formData.saturday_delivery}
                                    onChange={handleChange}
                                />
                                Saturday Delivery
                            </label>
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="special_instructions">Special Instructions</label>
                            <textarea
                                id="special_instructions"
                                rows={3}
                                value={formData.special_instructions}
                                onChange={handleChange}
                                placeholder="Any special handling instructions..."
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => navigate('/admin')}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register Shipment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminShipmentForm;