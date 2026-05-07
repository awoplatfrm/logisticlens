import React from 'react';
import { Country, State, City } from 'country-state-city';

interface QuoteFormProps {
    quoteData: any;
    setQuoteData: any;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ quoteData, setQuoteData, onSubmit, loading }) => {
    const fromStates = quoteData.fromCountryCode ? State.getStatesOfCountry(quoteData.fromCountryCode) : [];
    const fromCities = quoteData.fromStateCode ? City.getCitiesOfState(quoteData.fromCountryCode, quoteData.fromStateCode) : [];
    const toStates = quoteData.toCountryCode ? State.getStatesOfCountry(quoteData.toCountryCode) : [];
    const toCities = quoteData.toStateCode ? City.getCitiesOfState(quoteData.toCountryCode, quoteData.toStateCode) : [];

    return (
        <form onSubmit={onSubmit}>
            <div className="quote-form-section-group">
                {/* Origin */}
                <div className="quote-form-section">
                    <h5 className="fw-bold mb-3 text-secondary"><i className="bi bi-geo-alt-fill me-2 text-danger"></i>Ship From</h5>
                    <div className="mb-3">
                        <label className="quote-label">Country</label>
                        <select className="quote-select" value={quoteData.fromCountryCode} onChange={(e) => { setQuoteData({ ...quoteData, fromCountryCode: e.target.value, fromStateCode: '', fromCity: '', fromPostalCode: '' }); }} required>
                            <option value="">Select Origin Country</option>
                            {Country.getAllCountries().map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="quote-label">State/Province</label>
                        <select className="quote-select" value={quoteData.fromStateCode} onChange={(e) => { setQuoteData({ ...quoteData, fromStateCode: e.target.value, fromCity: '', fromPostalCode: '' }); }} required disabled={!quoteData.fromCountryCode || fromStates.length === 0}>
                            <option value="">Select Origin State</option>
                            {fromStates.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="quote-label">City</label>
                        {fromCities.length > 0 ? (
                            <select className="quote-select" value={quoteData.fromCity} onChange={(e) => setQuoteData({ ...quoteData, fromCity: e.target.value })} required disabled={!quoteData.fromStateCode}>
                                <option value="">Select Origin City</option>
                                {fromCities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                        ) : (
                            <input type="text" className="quote-input" value={quoteData.fromCity} onChange={(e) => setQuoteData({ ...quoteData, fromCity: e.target.value })} placeholder="Enter City" required disabled={!quoteData.fromCountryCode} />
                        )}
                    </div>
                    <div className="mb-3">
                        <label className="quote-label">Postal Code / ZIP</label>
                        <input type="text" className="quote-input" value={quoteData.fromPostalCode} onChange={(e) => setQuoteData({ ...quoteData, fromPostalCode: e.target.value })} placeholder="e.g. 100275" disabled={!quoteData.fromStateCode} />
                    </div>
                </div>

                {/* Destination */}
                <div className="quote-form-section">
                    <h5 className="fw-bold mb-3 text-secondary"><i className="bi bi-geo-alt-fill me-2 text-primary"></i>Ship To</h5>
                    <div className="mb-3">
                        <label className="quote-label">Country</label>
                        <select className="quote-select" value={quoteData.toCountryCode} onChange={(e) => { setQuoteData({ ...quoteData, toCountryCode: e.target.value, toStateCode: '', toCity: '', toPostalCode: '' }); }} required>
                            <option value="">Select Destination Country</option>
                            {Country.getAllCountries().map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="quote-label">State/Province</label>
                        <select className="quote-select" value={quoteData.toStateCode} onChange={(e) => { setQuoteData({ ...quoteData, toStateCode: e.target.value, toCity: '', toPostalCode: '' }); }} required disabled={!quoteData.toCountryCode || toStates.length === 0}>
                            <option value="">Select Destination State</option>
                            {toStates.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="quote-label">City</label>
                        {toCities.length > 0 ? (
                            <select className="quote-select" value={quoteData.toCity} onChange={(e) => setQuoteData({ ...quoteData, toCity: e.target.value })} required disabled={!quoteData.toStateCode}>
                                <option value="">Select Destination City</option>
                                {toCities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                        ) : (
                            <input type="text" className="quote-input" value={quoteData.toCity} onChange={(e) => setQuoteData({ ...quoteData, toCity: e.target.value })} placeholder="Enter City" required disabled={!quoteData.toCountryCode} />
                        )}
                    </div>
                    <div className="mb-3">
                        <label className="quote-label">Postal Code / ZIP</label>
                        <input type="text" className="quote-input" value={quoteData.toPostalCode} onChange={(e) => setQuoteData({ ...quoteData, toPostalCode: e.target.value })} placeholder="e.g. 90210" disabled={!quoteData.toStateCode} />
                    </div>
                </div>
            </div>
            <hr className="my-4 text-muted" />
            {/* Package Details */}
            <div className="quote-form-section-group justify-content-center mb-4">
                <div className="quote-form-section text-center">
                    <h5 className="fw-bold mb-3 text-secondary"><i className="bi bi-box-seam me-2 text-success"></i>Package Weight</h5>
                    <div className="quote-input-group">
                        <input type="number" className="quote-input" min="0.1" step="0.1" value={quoteData.weight} onChange={(e) => setQuoteData({ ...quoteData, weight: Number(e.target.value) })} required />
                        <span className="quote-input-addon">KG</span>
                    </div>
                </div>
                <div className="quote-form-section text-center">
                    <h5 className="fw-bold mb-3 text-secondary"><i className="bi bi-currency-dollar me-2 text-warning"></i>Display Currency</h5>
                    <select className="quote-select" value={quoteData.currency} onChange={(e) => setQuoteData({ ...quoteData, currency: e.target.value })} required>
                        <option value="NGN">NGN - Nigerian Naira</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="EUR">EUR - Euro</option>
                    </select>
                </div>
                <div className="quote-form-section text-center">
                    <h5 className="fw-bold mb-3 text-secondary"><i className="bi bi-rulers me-2 text-info"></i>Package Dimensions (CM)</h5>
                    <div className="quote-form-section-group g-2">
                        <div className="quote-form-group"><div className="quote-input-group"><input type="number" className="quote-input" min="1" value={quoteData.length} onChange={(e) => setQuoteData({ ...quoteData, length: Number(e.target.value) })} required /><span className="quote-input-addon">L</span></div></div>
                        <div className="quote-form-group"><div className="quote-input-group"><input type="number" className="quote-input" min="1" value={quoteData.width} onChange={(e) => setQuoteData({ ...quoteData, width: Number(e.target.value) })} required /><span className="quote-input-addon">W</span></div></div>
                        <div className="quote-form-group"><div className="quote-input-group"><input type="number" className="quote-input" min="1" value={quoteData.height} onChange={(e) => setQuoteData({ ...quoteData, height: Number(e.target.value) })} required /><span className="quote-input-addon">H</span></div></div>
                    </div>
                </div>
            </div>
            <div className="text-center">
                <button type="submit" className="quote-submit-button" disabled={loading}>
                    {loading ? <><span className="spinner-border spinner-border-sm me-2"></span> Calculating...</> : 'Get Live Quotes'}
                </button>
            </div>
        </form>
    );
};
export default QuoteForm;
