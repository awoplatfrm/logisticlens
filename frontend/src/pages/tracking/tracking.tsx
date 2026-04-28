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

    useEffect(() => {
        const fetchShipment = async () => {
            console.log("fetching shipment ...")
            try {
                setLoading(true);
                const response = await shipments.track_shipment(trackingNumber as string);
                setShipment(response.data.data);
            } catch (err: any) {
                setError(err?.response?.data?.message || err.message || 'Failed to fetch shipment details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (trackingNumber) {
            fetchShipment();
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
        <div className="tracking-page">
            <div className="tracking-container">
                {authenticate.isLoggedIn() && (
                    <button
                        onClick={() => navigate('/admin')}
                        style={{ padding: '8px 15px', background: '#f1f3f5', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '15px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#555', fontWeight: 500 }}
                    >
                        &larr; Back to Dashboard
                    </button>
                )}
                <h1>Track Your Shipment</h1>
                <p className="subtitle">Enter your tracking number below</p>

                <form className="tracking-form" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Enter tracking number"
                        className="tracking-input"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <button type="submit" className="tracking-button">
                        Track Package
                    </button>
                </form>

                {loading && <div style={{ textAlign: 'center', marginTop: '30px' }}>Loading...</div>}
                {error && <div style={{ textAlign: 'center', marginTop: '30px', color: 'red' }}><h4>Error: {error}</h4></div>}

                <div className="tracking-result">
                    {!loading && !error && shipment && <TrackingResult shipment={shipment} />}
                    {!loading && !error && !shipment && trackingNumber && (
                        <div style={{ textAlign: 'center', marginTop: '30px', color: '#666' }}>No shipment found with that tracking number.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tracking;