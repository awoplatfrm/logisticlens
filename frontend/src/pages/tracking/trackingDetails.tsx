import { TrackingDetailsProps } from '../../types/shipment.types';
import React from 'react';
import './tracking.css'
import './trackingDetails.css'

interface ExtendedTrackingProps extends Omit<TrackingDetailsProps, 'shipment'> {
    shipment: TrackingDetailsProps['shipment'] & {
        alert?: {
            type: 'info' | 'warning' | 'success' | 'delay';
            message: string;
        };
    };
}

const TrackingResult: React.FC<ExtendedTrackingProps> = ({ shipment }) => {

    // Format service type for display
    const formatServiceType = (type?: string) => {
        if (!type) return 'Standard';
        const types: Record<string, string> = {
            air: 'Air Freight',
            sea: 'Sea Freight',
            road: 'Road Freight',
            express: 'Express Delivery'
        };
        return types[type] || type;
    };

    // Get status badge class
    const getStatusClass = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return 'status-delivered';
            case 'in_transit': return 'status-transit';
            case 'out_for_delivery': return 'status-out';
            case 'pending': return 'status-pending';
            default: return 'status-default';
        }
    };

    return (
        <>
            {/* Status Badge */}
            <div className={`status-badge ${getStatusClass(shipment.current_status)}`}>
                {shipment.current_status?.replace('_', ' ') || 'Pending'}
            </div>

            {/* Customer Alert Banner */}
            {shipment.alert && (
                <div className={`customer-alert alert-${shipment.alert.type}`} style={{ padding: '15px 20px', margin: '20px 0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', background: shipment.alert.type === 'delay' ? '#f8d7da' : shipment.alert.type === 'warning' ? '#fff3cd' : shipment.alert.type === 'success' ? '#d4edda' : '#cce5ff', color: shipment.alert.type === 'delay' ? '#721c24' : shipment.alert.type === 'warning' ? '#856404' : shipment.alert.type === 'success' ? '#155724' : '#004085', borderLeft: `6px solid ${shipment.alert.type === 'delay' ? '#721c24' : shipment.alert.type === 'warning' ? '#856404' : shipment.alert.type === 'success' ? '#155724' : '#004085'}` }}>
                    <div className="alert-icon" style={{ fontSize: '24px' }}>
                        {shipment.alert.type === 'info' && 'ℹ️'}
                        {shipment.alert.type === 'success' && '✅'}
                        {shipment.alert.type === 'warning' && '⚠️'}
                        {shipment.alert.type === 'delay' && '🚨'}
                    </div>
                    <div className="alert-content">
                        <strong>
                            {shipment.alert.type === 'info' && 'Notice: '}
                            {shipment.alert.type === 'success' && 'Update: '}
                            {shipment.alert.type === 'warning' && 'Action Required: '}
                            {shipment.alert.type === 'delay' && 'Urgent Warning: '}
                        </strong>
                        {shipment.alert.message}
                    </div>
                </div>
            )}

            {/* Tracking Number */}
            <div className="tracking-number-display">
                <span className="label">Tracking #:</span>
                <span className="number">{shipment.tracking_number}</span>
                <button
                    className="copy-btn"
                    onClick={() => navigator.clipboard.writeText(shipment.tracking_number)}
                    title="Copy tracking number"
                >
                    📋
                </button>
            </div>

            {/* Customer Info */}
            <div className="customer-info">
                <h3>Recipient Information</h3>
                <p><strong>{shipment.name}</strong></p>
                <p>{shipment.email}</p>
                <p>{shipment.phone}</p>
            </div>

            {/* Addresses */}
            <div className="addresses-grid">
                <div className="address-box">
                    <h4>From</h4>
                    <p>{shipment.from_address}</p>
                    <p>{shipment.from_city}, {shipment.from_state} {shipment.from_postal_code}</p>
                    <p>{shipment.from_country}</p>
                </div>

                <div className="address-box">
                    <h4>To</h4>
                    <p>{shipment.to_address}</p>
                    <p>{shipment.to_city}, {shipment.to_state} {shipment.to_postal_code}</p>
                    <p>{shipment.to_country}</p>
                </div>
            </div>

            {/* Package Details */}
            <div className="package-details">
                <h3>Package Details</h3>
                <div className="details-grid">
                    <div className="detail-item">
                        <span className="detail-label">Product:</span>
                        <span className="detail-value">{shipment.product}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Quantity:</span>
                        <span className="detail-value">{shipment.quantity}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Weight:</span>
                        <span className="detail-value">{shipment.weight} kg</span>
                    </div>
                    {shipment.dimensions && (
                        <div className="detail-item">
                            <span className="detail-label">Dimensions:</span>
                            <span className="detail-value">{shipment.dimensions}</span>
                        </div>
                    )}
                    <div className="detail-item">
                        <span className="detail-label">Service:</span>
                        <span className="detail-value">{formatServiceType(shipment.service_type)}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Package Type:</span>
                        <span className="detail-value">{shipment.package_type}</span>
                    </div>
                </div>
            </div>

            {/* Additional Options */}
            {(shipment.insurance || shipment.signature_required || shipment.special_instructions) && (
                <div className="additional-info">
                    <h3>Additional Information</h3>
                    {shipment.insurance && <p>✅ Insurance included</p>}
                    {shipment.signature_required && <p>✅ Signature required</p>}
                    {shipment.special_instructions && (
                        <p><strong>Special Instructions:</strong> {shipment.special_instructions}</p>
                    )}
                </div>
            )}

            {/* Progress Tracker - Show if status exists */}
            {shipment.order_status && shipment.order_status.length > 0 ? (
                <div className="progress-tracker">
                    <h3>Tracking Progress</h3>
                    {shipment.order_status.map((status, index) => (
                        <div key={index} className="progress-step">
                            <div className="step-dot"></div>
                            <div className="step-content">
                                <span className="step-title" style={{ textTransform: 'capitalize', fontWeight: 'bold', display: 'block', color: '#333' }}>
                                    {status.status?.replace('_', ' ')}
                                </span>
                                {status.message && (
                                    <p className="step-message" style={{ margin: '4px 0', color: '#555', fontSize: '14px' }}>{status.message}</p>
                                )}
                                <span className="step-date">{status.date} at {status.time}</span>
                                {status.location && (
                                    <span className="step-location" style={{ display: 'block', color: '#667eea', fontSize: '13px', marginTop: '4px' }}>📍 {status.location}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-tracking-info">
                    <p>Shipment registered. Tracking updates will appear here once the package is picked up.</p>
                </div>
            )}
        </>
    );
};

export default TrackingResult;