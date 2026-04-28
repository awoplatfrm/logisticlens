import './tracking.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { shipments } from '../../services/shipments';
import { TrackingDetailsProps } from '../../types/shipment.types';
import TrackingResult from './trackingDetails';
import { authenticate } from '../../services/auth';

const Tracking = () => {

    const { trackingNumber } = useParams();
    const navigate = useNavigate();
    const [shipment, setShipment] = useState<TrackingDetailsProps["shipment"] & { alert?: any }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchInput, setSearchInput] = useState(trackingNumber || '');

    const fetchShipment = async (trackNum: string) => {
        try {
            setLoading(true);
            setError(''); // Clear previous errors
            const response = await shipments.track_shipment(trackNum);
            setShipment(response.data.data);
        } catch (err: any) {
            if (!navigator.onLine) {
                setError('No internet connection. Please check your network and try again.');
            } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                setError('Request timed out. The server took too long to respond.');
            } else {
                setError(err?.response?.data?.message || err.message || 'Failed to fetch shipment details. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        if (trackingNumber) {
            fetchShipment(trackingNumber);
        } else {
            setLoading(false);
        }
    }, [trackingNumber]);


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/track/${searchInput.trim()}`);
        }
    };


    return (
        <div className="tracking-page" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '50px' }}>
            <div className="container pt-5">
                {authenticate.isLoggedIn() && (
                    <button
                        onClick={() => navigate('/admin')}
                        className="btn btn-light shadow-sm mb-4 fw-bold text-secondary rounded-pill px-4"
                    >
                        <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
                    </button>
                )}

                <div className="row justify-content-center mb-5">
                    <div className="col-md-8 col-lg-6 text-center">
                        <h1 className="display-5 fw-bolder text-dark mb-3">Track Your Shipment</h1>
                        <p className="lead text-muted mb-4">Enter your tracking number to get real-time updates</p>

                        <form className="d-flex bg-white shadow-sm rounded-pill p-1" onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="e.g. LENZ-1234567"
                                className="form-control border-0 rounded-pill px-4 shadow-none fs-6"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary rounded-pill px-4 py-2 fw-medium" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', fontSize: '15px' }}>
                                Track
                            </button>
                        </form>
                    </div>
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', marginTop: '50px' }}>
                        <div className="spinner-border" style={{ color: '#667eea', width: '3rem', height: '3rem' }} role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p style={{ marginTop: '15px', color: '#555', fontWeight: '500' }}>Fetching tracking details...</p>
                    </div>
                )}

                {error && (
                    <div style={{ textAlign: 'center', marginTop: '30px', color: '#dc3545' }}>
                        <h4>⚠️ {error}</h4>
                        <button
                            onClick={() => trackingNumber && fetchShipment(trackingNumber)}
                            style={{ marginTop: '15px', padding: '8px 20px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            🔄 Retry Connection
                        </button>
                    </div>
                )}

                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        {!loading && !error && shipment && <TrackingResult shipment={shipment} />}
                        {!loading && !error && !shipment && trackingNumber && (
                            <div style={{ textAlign: 'center', marginTop: '30px', color: '#666' }}>No shipment found with that tracking number.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tracking;