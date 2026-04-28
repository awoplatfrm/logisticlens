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

    const isDelivered = shipment.current_status?.toLowerCase() === 'delivered';

    return (
        <>
            {/* Header Card: Status & Tracking Number */}
            <div className="card shadow-sm border-0 mb-4 rounded-4 overflow-hidden">
                <div className="card-header text-white p-4 p-md-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-0" style={{ background: isDelivered ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <div className="mb-4 mb-md-0">
                        <h6 className="mb-1 text-white text-opacity-75 text-uppercase fw-bold tracking-widest" style={{ letterSpacing: '2px' }}>Tracking Number</h6>
                        <h2 className="mb-0 text-white fw-bolder d-flex align-items-center gap-3" style={{ fontSize: '2.5rem' }}>
                            {shipment.tracking_number}
                            <button className="btn btn-sm btn-light bg-opacity-25 border-0 text-white rounded-circle d-flex align-items-center justify-content-center p-2" onClick={() => navigator.clipboard.writeText(shipment.tracking_number)} title="Copy" style={{ width: '35px', height: '35px' }}>
                                <i className="bi bi-clipboard fs-5"></i>
                            </button>
                        </h2>
                    </div>
                    <div className="text-md-end text-start">
                        <h6 className="mb-1 text-white text-opacity-75 text-uppercase fw-bold" style={{ letterSpacing: '2px' }}>Current Status</h6>
                        <h3 className="mb-0 text-white fw-bold text-capitalize d-flex align-items-center justify-content-md-end gap-2">
                            {isDelivered && <i className="bi bi-check-circle-fill"></i>}
                            {shipment.current_status?.replace('_', ' ') || 'Pending'}
                        </h3>
                    </div>
                </div>

                {/* Customer Alert Banner */}
                {shipment.alert && (
                    <div className="alert d-flex align-items-center rounded-0 border-0 m-0 px-4 py-3" style={{
                        background: shipment.alert.type === 'delay' ? '#fee2e2' : shipment.alert.type === 'warning' ? '#fef3c7' : shipment.alert.type === 'success' ? '#d1fae5' : '#e0e7ff',
                        color: shipment.alert.type === 'delay' ? '#991b1b' : shipment.alert.type === 'warning' ? '#92400e' : shipment.alert.type === 'success' ? '#065f46' : '#3730a3',
                        borderLeft: `6px solid ${shipment.alert.type === 'delay' ? '#ef4444' : shipment.alert.type === 'warning' ? '#f59e0b' : shipment.alert.type === 'success' ? '#10b981' : '#667eea'} !important`
                    }}>
                        <div className="fs-3 me-3">
                            {shipment.alert.type === 'info' && <i className="bi bi-info-circle-fill"></i>}
                            {shipment.alert.type === 'success' && <i className="bi bi-check-circle-fill"></i>}
                            {shipment.alert.type === 'warning' && <i className="bi bi-exclamation-triangle-fill"></i>}
                            {shipment.alert.type === 'delay' && <i className="bi bi-exclamation-octagon-fill"></i>}
                        </div>
                        <div>
                            <strong className="d-block mb-1">
                                {shipment.alert.type === 'info' && 'Notice'}
                                {shipment.alert.type === 'success' && 'Update'}
                                {shipment.alert.type === 'warning' && 'Action Required'}
                                {shipment.alert.type === 'delay' && 'Urgent Warning'}
                            </strong>
                            <span style={{ fontSize: '15px' }}>{shipment.alert.message}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Route / Addresses Card */}
            <div className="card shadow-sm border-0 mb-4 rounded-4">
                <div className="card-body p-4 p-md-5">
                    <h5 className="card-title text-muted mb-4 fw-bold"><i className="bi bi-geo-alt-fill text-danger me-2"></i>Shipment Route</h5>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center position-relative mt-4">
                        <div className="text-center text-md-start mb-4 mb-md-0 w-100">
                            <span className="badge bg-light text-secondary mb-3 px-3 py-2 border">ORIGIN</span>
                            <h4 className="fw-bolder text-dark mb-1">{shipment.from_city}</h4>
                            <p className="text-muted mb-0">{shipment.from_address}</p>
                            <p className="text-muted mb-1">{shipment.from_state} {shipment.from_postal_code}</p>
                            <p className="text-dark fw-bold">{shipment.from_country}</p>
                        </div>

                        <div className="d-flex flex-column align-items-center w-100 px-4 position-relative d-none d-md-flex">
                            <i className={`bi ${isDelivered ? 'bi-house-door-fill text-success' : 'bi-truck text-primary'} fs-1 mb-2 bg-white px-3`} style={{ zIndex: 2 }}></i>
                            <div style={{ position: 'absolute', top: '25px', height: '3px', width: '100%', background: isDelivered ? '#10B981' : 'linear-gradient(90deg, #e9ecef 0%, #667eea 50%, #e9ecef 100%)', zIndex: 1 }}></div>
                        </div>

                        <div className="d-flex flex-column align-items-center w-100 py-3 position-relative d-md-none">
                            <i className="bi bi-arrow-down text-muted fs-3"></i>
                        </div>

                        <div className="text-center text-md-end w-100">
                            <span className="badge bg-light text-secondary mb-3 px-3 py-2 border">DESTINATION</span>
                            <h4 className="fw-bolder text-dark mb-1">{shipment.to_city}</h4>
                            <p className="text-muted mb-0">{shipment.to_address}</p>
                            <p className="text-muted mb-1">{shipment.to_state} {shipment.to_postal_code}</p>
                            <p className="text-dark fw-bold">{shipment.to_country}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="row g-4 mb-4">
                <div className="col-lg-7">
                    <div className="card shadow-sm border-0 h-100 rounded-4">
                        <div className="card-body p-4 p-md-5">
                            <h5 className="card-title text-muted mb-4 fw-bold"><i className="bi bi-box-seam-fill text-primary me-2"></i>Package Details</h5>
                            <ul className="list-group list-group-flush fs-6">
                                <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-bottom">
                                    <span className="text-muted">Product</span>
                                    <span className="fw-bold text-dark text-end">{shipment.product}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-bottom">
                                    <span className="text-muted">Quantity</span>
                                    <span className="fw-bold text-dark text-end">{shipment.quantity} {shipment.package_type && <span className="text-muted fw-normal ms-1">({shipment.package_type}s)</span>}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-bottom">
                                    <span className="text-muted">Weight</span>
                                    <span className="fw-bold text-dark text-end">{shipment.weight} kg</span>
                                </li>
                                {shipment.dimensions && (
                                    <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-bottom">
                                        <span className="text-muted">Dimensions</span>
                                        <span className="fw-bold text-dark text-end">{shipment.dimensions}</span>
                                    </li>
                                )}
                                <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-0">
                                    <span className="text-muted">Service Type</span>
                                    <span className="badge bg-primary text-white px-3 py-2 text-capitalize">{formatServiceType(shipment.service_type)}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="card shadow-sm border-0 h-100 rounded-4">
                        <div className="card-body p-4 p-md-5">
                            <h5 className="card-title text-muted mb-4 fw-bold"><i className="bi bi-person-vcard-fill text-success me-2"></i>Recipient Info</h5>
                            <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '60px', height: '60px' }}>
                                    <i className="bi bi-person-fill fs-2 text-secondary"></i>
                                </div>
                                <div>
                                    <h5 className="fw-bolder text-dark mb-0">{shipment.name}</h5>
                                    <span className="badge bg-light text-dark border mt-2">Customer</span>
                                </div>
                            </div>
                            <div className="mb-3 d-flex align-items-center">
                                <i className="bi bi-envelope-fill text-muted me-3 fs-5"></i>
                                <span className="text-dark fw-medium text-break">{shipment.email}</span>
                            </div>
                            <div className="mb-4 d-flex align-items-center">
                                <i className="bi bi-telephone-fill text-muted me-3 fs-5"></i>
                                <span className="text-dark fw-medium">{shipment.phone}</span>
                            </div>

                            {(shipment.insurance || shipment.signature_required || shipment.special_instructions) && (
                                <div className="mt-4 pt-3 border-top">
                                    <h6 className="text-muted mb-3 fw-bold small text-uppercase">Additional Options</h6>
                                    {shipment.insurance && <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 me-2 mb-2 px-3 py-2"><i className="bi bi-shield-check me-1"></i> Insured</span>}
                                    {shipment.signature_required && <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 me-2 mb-2 px-3 py-2"><i className="bi bi-pen me-1"></i> Signature Req.</span>}
                                    {shipment.special_instructions && <p className="text-dark bg-light p-3 rounded-3 small mt-2 mb-0 border"><i className="bi bi-chat-left-text me-2 text-muted"></i><strong>Note:</strong> {shipment.special_instructions}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="card shadow-sm border-0 rounded-4 mb-5">
                <div className="card-body p-4 p-md-5">
                    <h5 className="card-title text-muted mb-5 fw-bold"><i className="bi bi-clock-history text-info me-2"></i>Tracking History</h5>

                    {shipment.order_status && shipment.order_status.length > 0 ? (
                        <div className="px-2 px-md-4">
                            <div style={{ borderLeft: '3px solid #e9ecef', position: 'relative', paddingBottom: '10px' }}>
                                {/* Top to Bottom arrangement (Chronological order) */}
                                {shipment.order_status.map((status, index) => {
                                    const isLatest = index === shipment.order_status.length - 1;
                                    return (
                                        <div key={index} className="mb-4" style={{ position: 'relative', paddingLeft: '35px' }}>
                                            {/* Timeline Dot */}
                                            <div style={{
                                                position: 'absolute',
                                                left: '-11.5px',
                                                top: '5px',
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: isLatest ? '#667eea' : '#ced4da',
                                                border: '4px solid #fff',
                                                boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                                            }}></div>

                                            <div className={`p-3 p-md-4 rounded-4 ${isLatest ? 'border' : 'bg-light border border-light'}`} style={{ backgroundColor: isLatest ? '#f0f4ff' : '', borderColor: isLatest ? '#c7d2fe !important' : '' }}>
                                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-2">
                                                    <strong className="text-capitalize fs-5 mb-2 mb-md-0" style={{ color: isLatest ? '#3730a3' : '#495057' }}>
                                                        {status.status?.replace('_', ' ')}
                                                    </strong>
                                                    <span className="text-muted small fw-medium bg-white px-3 py-1 rounded-pill border"><i className="bi bi-calendar-event me-2"></i>{status.date} &bull; {status.time}</span>
                                                </div>
                                                {status.message && <p className="mb-2 mt-2" style={{ color: isLatest ? '#4f46e5' : '#6c757d', fontSize: '15px' }}>{status.message}</p>}
                                                {status.location && <p className="mb-0 fw-bold" style={{ color: isLatest ? '#4338ca' : '#adb5bd', fontSize: '14px' }}><i className="bi bi-geo-alt-fill me-1"></i>{status.location}</p>}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-5 text-muted bg-light rounded-4">
                            <i className="bi bi-box-seam fs-1 text-secondary opacity-50 mb-3 d-block"></i>
                            <h5 className="fw-bold text-dark">Shipment Registered</h5>
                            <p className="mb-0 px-4">Tracking updates will appear here on a timeline once the package is picked up by the courier.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TrackingResult;