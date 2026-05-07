
import React from 'react';
interface RateListProps {
    rates: any[];
    onBook: (rate: any) => void;
    onRecalculate: () => void;
}

const RateList: React.FC<RateListProps> = ({ rates, onBook, onRecalculate }) => {
    return (
        <div className="quote-rates-display mt-0">
            <h3>Available Couriers</h3>
            <div className="quote-rates-grid">
                {rates.map((rate: any, index: number) => (
                    <div key={index} className="quote-rate-card">
                        <div className="quote-rate-card-info">
                            <h5>{rate.carrier_name}</h5>
                            <span className="badge"><i className="bi bi-truck me-1"></i> {rate.delivery_time} Delivery</span>
                        </div>
                        <div className="quote-rate-card-price">+                            <span className="currency">{rate.currency}</span>
                            <h3>{rate.amount.toLocaleString('en-US', { style: 'currency', currency: rate.currency })}</h3>
                            <button className="quote-book-button" onClick={() => onBook(rate)}>
                                Book Shipment
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-5">
                <button className="quote-recalculate-button" onClick={onRecalculate}>
                    <i className="bi bi-arrow-left me-2"></i>Recalculate Quote
                </button>
            </div>
        </div>
    );
};

export default RateList;
