import './tracking.css';
import '../services/services.css'; // Import the shared header styling
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { shipments } from '../../services/shipments';
import { TrackingDetailsProps } from '../../types/shipment.types';
import TrackingResult from './trackingDetails';
import { authenticate } from '../../services/auth';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';

const Tracking = () => {

    const { trackingNumber } = useParams();
    const navigate = useNavigate();
    const [shipment, setShipment] = useState<TrackingDetailsProps["shipment"] & { alert?: any }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    return (
        <div style={{ backgroundColor: '#F7FBFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header">
                <Navbar />
                <div className="page-title-container">
                    <h1>Shipment Tracking</h1>
                    <p style={{ fontSize: '1.1rem' }}>Tracking Results for: <strong>{trackingNumber}</strong></p>
                </div>
            </div>

            <div className="tracking-page" style={{ padding: '50px 20px', flex: 1 }}>
                <div className="container">
                    {authenticate.isLoggedIn() && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="btn btn-light shadow-sm mb-4 fw-bold text-secondary rounded-pill px-4"
                        >
                            <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
                        </button>
                    )}

                    {loading && (
                        <div style={{ textAlign: 'center', marginTop: '50px' }}>
                            <div className="spinner-border" style={{ color: '#769FCD', width: '3rem', height: '3rem' }} role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p style={{ marginTop: '15px', color: '#526D82', fontWeight: '500' }}>Fetching tracking details...</p>
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
                                <div style={{ textAlign: 'center', marginTop: '30px', color: '#526D82', fontSize: '1.2rem' }}>No shipment found with tracking number <strong>{trackingNumber}</strong>.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Tracking;