import Navbar from "../navbar/navbar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";
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


                        <Link to={'/'} className="get-quote-btn" >Get Quote</Link>

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