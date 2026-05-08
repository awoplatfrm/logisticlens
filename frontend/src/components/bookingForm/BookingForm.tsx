import React, { useState } from 'react';
import { Country, State } from 'country-state-city';

interface BookingFormProps {
    onSubmit: (bookingData: any) => void;
    onCancel: () => void;
    loading: boolean;
    quoteData: any;
}

const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, onCancel, loading, quoteData }) => {
    const [formStep, setFormStep] = useState(1);
    const [formData, setFormData] = useState({
        sender_first_name: '',
        sender_last_name: '',
        sender_email: '',
        sender_phone: '',
        sender_alt_phone: '',
        sender_line1: '',
        sender_line2: '',
        sender_postal_code: '',
        receiver_first_name: '',
        receiver_last_name: '',
        receiver_email: '',
        receiver_phone: '',
        receiver_alt_phone: '',
        receiver_line1: '',
        receiver_line2: '',
        receiver_postal_code: '',
        parcel_description: '',
        parcel_value: ''
    });

    const fromCountry = Country.getCountryByCode(quoteData.fromCountryCode);
    const fromState = State.getStateByCodeAndCountry(quoteData.fromStateCode, quoteData.fromCountryCode);
    const toCountry = Country.getCountryByCode(quoteData.toCountryCode);
    const toState = State.getStateByCodeAndCountry(quoteData.toStateCode, quoteData.toCountryCode);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formattedData = {
            ...formData,
            sender_phone: formData.sender_phone.startsWith('+') ? formData.sender_phone : `+${fromCountry?.phonecode || '234'}${formData.sender_phone.replace(/^0/, '')}`,
            receiver_phone: formData.receiver_phone.startsWith('+') ? formData.receiver_phone : `+${toCountry?.phonecode || '1'}${formData.receiver_phone.replace(/^0/, '')}`
        };

        onSubmit(formattedData);
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        // Add validation for step 1 fields if needed
        setFormStep(2);
    };

    return (
        <>
            <h4 style={{ textAlign: 'center', marginBottom: '30px', color: '#555' }}>
                Step {formStep} of 2: {formStep === 1 ? 'Address Details' : 'Parcel Details'}
            </h4>

            {formStep === 1 && (
                <form onSubmit={handleNext}>
                    <div className="quote-form-section-group">
                        <div className="quote-form-section">
                            <h5 className="fw-bold mb-3 text-secondary">Sender Details (From: {quoteData.fromCity}, {fromState?.name})</h5>
                            <div className="mb-3"><label className="quote-label">First Name</label><input type="text" name="sender_first_name" className="quote-input" value={formData.sender_first_name} onChange={handleChange} required /></div>
                            <div className="mb-3"><label className="quote-label">Last Name</label><input type="text" name="sender_last_name" className="quote-input" value={formData.sender_last_name} onChange={handleChange} required /></div>
                            <div className="mb-3"><label className="quote-label">Email</label><input type="email" name="sender_email" className="quote-input" value={formData.sender_email} onChange={handleChange} required /></div>
                            <div className="mb-3"><label className="quote-label">Phone</label><input type="text" name="sender_phone" className="quote-input" value={formData.sender_phone} onChange={handleChange} required placeholder={`e.g. +${fromCountry?.phonecode}...`} /></div>
                            <div className="mb-3"><label className="quote-label">Alternative Phone (Optional)</label><input type="text" name="sender_alt_phone" className="quote-input" value={formData.sender_alt_phone} onChange={handleChange} /></div>
                            <div className="mb-3"><label className="quote-label">Address Line 1</label><input type="text" name="sender_line1" className="quote-input" value={formData.sender_line1} onChange={handleChange} required /></div>
                            <div className="mb-3"><label className="quote-label">Address Line 2 (Optional)</label><input type="text" name="sender_line2" className="quote-input" value={formData.sender_line2} onChange={handleChange} /></div>
                            <div className="mb-3"><label className="quote-label">Postal / Zip Code</label><input type="text" name="sender_postal_code" className="quote-input" value={formData.sender_postal_code} onChange={handleChange} required /></div>
                        </div>

                        <div className="quote-form-section">
                            <h5 className="fw-bold mb-3 text-secondary">Receiver Details (To: {quoteData.toCity}, {toState?.name})</h5>
                            <div className="mb-3"><label className="quote-label">First Name</label><input type="text" name="receiver_first_name" className="quote-input" value={formData.receiver_first_name} onChange={handleChange} required /></div>
                            <div className="mb-3"><label className="quote-label">Last Name</label><input type="text" name="receiver_last_name" className="quote-input" value={formData.receiver_last_name} onChange={handleChange} required /></div>
                            <div className="mb-3"><label className="quote-label">Email</label><input type="email" name="receiver_email" className="quote-input" value={formData.receiver_email} onChange={handleChange} required /></div>
                            <div className="mb-3"><label className="quote-label">Phone</label><input type="text" name="receiver_phone" className="quote-input" value={formData.receiver_phone} onChange={handleChange} required placeholder={`e.g. +${toCountry?.phonecode}...`} /></div>
                            <div className="mb-3"><label className="quote-label">Alternative Phone (Optional)</label><input type="text" name="receiver_alt_phone" className="quote-input" value={formData.receiver_alt_phone} onChange={handleChange} /></div>
                            <div className="mb-3"><label className="quote-label">Address Line 1</label><input type="text" name="receiver_line1" className="quote-input" value={formData.receiver_line1} onChange={handleChange} required /></div>
                            <div className="mb-3"><label className="quote-label">Address Line 2 (Optional)</label><input type="text" name="receiver_line2" className="quote-input" value={formData.receiver_line2} onChange={handleChange} /></div>
                            <div className="mb-3"><label className="quote-label">Postal / Zip Code</label><input type="text" name="receiver_postal_code" className="quote-input" value={formData.receiver_postal_code} onChange={handleChange} required /></div>
                        </div>
                    </div>
                    <div className="text-center mt-5">
                        <button type="button" className="quote-recalculate-button me-3 mt-0" onClick={onCancel} disabled={loading}>Back to Rates</button>
                        <button type="submit" className="quote-submit-button">
                            Next: Parcel Details &rarr;
                        </button>
                    </div>
                </form>
            )}

            {formStep === 2 && (
                <form onSubmit={handleSubmit}>
                    <div className="quote-form-section mt-4" style={{ width: '100%' }}>
                        <h5 className="fw-bold mb-3 text-secondary">Parcel Details (For Customs & Insurance)</h5>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="quote-label">Item Description</label>
                                <textarea
                                    name="parcel_description"
                                    className="quote-input"
                                    value={formData.parcel_description}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Used Clothes, Electronics, Documents"
                                    rows={3}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="quote-label">Declared Value (For Customs, {quoteData.currency})</label>
                                <input
                                    type="number"
                                    name="parcel_value"
                                    className="quote-input"
                                    value={formData.parcel_value}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    placeholder={`e.g., 5000`}
                                />
                                <small className="text-muted d-block mt-1">Required for international customs. This is <b>not</b> a charge.</small>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-5">
                        <button type="button" className="quote-recalculate-button me-3 mt-0" onClick={() => setFormStep(1)} disabled={loading}>&larr; Back to Addresses</button>
                        <button type="submit" className="quote-submit-button" disabled={loading}>
                            {loading ? 'Processing...' : 'Confirm & Book Shipment'}
                        </button>
                    </div>
                </form>
            )}
        </>
    );
};

export default BookingForm;
