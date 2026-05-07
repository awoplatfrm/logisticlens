
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import { Country, State, City } from 'country-state-city';
import { shipments } from '../../services/shipments';
import './getQuote.css';
import QuoteForm from '../../components/quotesForm/QuoteForm';
import RateList from '../../components/rateList/RateList';
import BookingForm from '../../components/bookingForm/BookingForm';

const GetQuote = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rates, setRates] = useState<any[]>([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingDetails, setBookingDetails] = useState<{ tracking_number: string, waybill_url: string, carrier_name: string } | null>(null);

    const [step, setStep] = useState<'quote' | 'rates' | 'booking' | 'success'>('quote');
    const [selectedRate, setSelectedRate] = useState<any>(null);

    const [quoteData, setQuoteData] = useState({
        fromCountryCode: '',
        fromStateCode: '',
        fromCity: '',
        fromPostalCode: '',
        toCountryCode: '',
        toStateCode: '',
        toCity: '',
        toPostalCode: '',
        weight: 1,
        length: 20,
        width: 20,
        height: 20,
        currency: 'NGN'
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleGetQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setRates([]);

        try {
            const from_state = State.getStateByCodeAndCountry(quoteData.fromStateCode, quoteData.fromCountryCode)?.name;
            const to_state = State.getStateByCodeAndCountry(quoteData.toStateCode, quoteData.toCountryCode)?.name;

            const response = await shipments.get_rates({
                ...quoteData,
                from_state,
                to_state,
            });

            if (response.data.code === 200) {
                const fetchedRates = response.data.data || [];
                if (fetchedRates.length === 0) {
                    setError('No couriers available for this specific route and weight.');
                } else {
                    setRates(fetchedRates);
                    setStep('rates');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch live rates.');
        } finally {
            setLoading(false);
        }
    };

    const handleBookShipment = async (bookingData: any) => {
        setBookingLoading(true);
        setError('');
        setBookingDetails(null);

        try {
            const from_state = State.getStateByCodeAndCountry(quoteData.fromStateCode, quoteData.fromCountryCode)?.name;
            const to_state = State.getStateByCodeAndCountry(quoteData.toStateCode, quoteData.toCountryCode)?.name;

            const payload = {
                selectedRate,
                quoteData: {
                    ...quoteData,
                    from_state,
                    to_state
                },
                bookingData
            };
            const response = await shipments.book_shipment(payload);
            setBookingDetails(response.data.data);
            setRates([]); // Clear rates after booking
            setStep('success');
        } catch (err: any) {
            if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                setError('The booking is taking longer than expected. Please check your admin dashboard in a few moments.');
            } else {
                setError(err.response?.data?.message || 'Failed to book shipment.');
            }
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div className="quote-page-wrapper">
            <div className="quote-page-header">

                <Navbar />
                <div className="quote-title-container">
                    <h1>Shipping Calculator</h1>
                    <p>Get instant, real-time quotes from top global couriers.</p>
                </div>
            </div>

            <div className="quote-content-container" style={{ minHeight: 'calc(100vh - 250px)' }}>
                <div className="row justify-content-center"> {/* Keep row/justify-content-center for centering the main content block */}
                    <div className="col-lg-12"> {/* Use full width for the main content block */}
                        {step === 'success' && bookingDetails && (
                            <div className="alert border-0 border-start border-success border-4 mb-5 p-4 shadow-sm" style={{ backgroundColor: '#fff', borderRadius: '12px' }}>
                                <h3 className="alert-heading fw-bold mb-3 text-dark">🎉 Shipment Successfully Booked!</h3>
                                <p className="mb-3 text-secondary" style={{ fontSize: '1.1rem' }}>Your shipment with <strong>{bookingDetails.carrier_name}</strong> has been confirmed and registered in our system.</p>
                                <hr className="text-muted opacity-25 my-4" />
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                    <div className="mb-4 mb-md-0">
                                        <span className="text-muted small fw-bold text-uppercase">Official Tracking Number</span>
                                        <h2 className="mb-0 fw-bolder text-success mt-1" style={{ letterSpacing: '1px' }}>{bookingDetails.tracking_number}</h2>
                                    </div>
                                    {bookingDetails.waybill_url ? (
                                        <a href={bookingDetails.waybill_url} target="_blank" rel="noreferrer" className="btn btn-success fw-bold px-4 py-3 rounded-pill shadow-sm" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', border: 'none', fontSize: '1.1rem' }}>
                                            <i className="bi bi-printer-fill me-2"></i> Print Official Waybill
                                        </a>
                                    ) : (
                                        <div className="text-muted fst-italic">Waybill automatically sent to carrier.</div>
                                    )}
                                </div>
                                <div className="text-center mt-4">
                                    <button className="quote-recalculate-button" onClick={() => { setStep('quote'); setBookingDetails(null); }}>Book Another</button>
                                </div>
                            </div>
                        )}

                        <div className="quote-form-card">
                            {error && <div className="alert alert-danger border-0 border-start border-danger border-4 mb-4">⚠️ {error}</div>}


                            {step === 'quote' && <QuoteForm quoteData={quoteData} setQuoteData={setQuoteData} onSubmit={handleGetQuote} loading={loading} />}
                            {step === 'rates' && <RateList rates={rates} onBook={(rate) => { setSelectedRate(rate); setStep('booking'); }} onRecalculate={() => { setStep('quote'); setRates([]); }} />}
                            {step === 'booking' && <BookingForm onSubmit={handleBookShipment} onCancel={() => setStep('rates')} loading={bookingLoading} quoteData={quoteData} />}


                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default GetQuote;
