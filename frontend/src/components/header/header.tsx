import Navbar from "../navbar/navbar";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import './header.css'
function Header() {

    const [trackingNumber, setTrackingNumber] = useState('');
    const navigate = useNavigate();

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (trackingNumber.trim()) {
            navigate(`/track/${trackingNumber.trim()}`);
        }
    };
    return (
        <>
            <div className="headerContainer">
                <div className="navb">
                    <Navbar />
                </div>
                <div className="headerBodyTextContainer">
                    <div className="headerBodyText">
                        <h1 className="headerText">Welcome to LogisticLens.</h1>
                        <p className="headerParagraphText">Your Trusted Partner in Logistics Solutions</p>
                        {/* <Link to={'/get-quote'} style={{ display: 'inline-block', marginTop: '10px', padding: '15px 30px', backgroundColor: '#ef476f', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}>Get Quote</Link> */}
                        <button disabled style={{ display: 'inline-block', marginTop: '10px', padding: '15px 30px', backgroundColor: '#ef476f', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', opacity: 0.6, cursor: 'not-allowed', border: 'none' }}>Get Quote</button>
                    </div>
                    <div className="trackShipmentContainer">
                        <form className="trackShipmentForm" onSubmit={handleTrack}>
                            <input type="text" placeholder="Enter your tracking number" className="trackYourShipmentInput"
                                onChange={(e) => setTrackingNumber(e.target.value)}
                            />
                            <button className="trackYourShipmentButton" type="submit">Track</button>
                        </form>
                    </div>
                </div>

            </div>
        </>
    );
}

export default Header;