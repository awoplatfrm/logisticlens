
import { useEffect } from 'react';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import AboutUs from '../../components/Body/about-us/aboutUs';
import TrustAndSupportive from '../../components/Body/trustAndSupportive/trustAndSupportive';
import '../services/services.css';
import visionImage from "../../assets/images/body/aboutUs/our vission.webp"
import missionImage from "../../assets/images/body/aboutUs/our mision.jpeg"



const About = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <Navbar />
                <div className="page-title-container">
                    <h1>About LogisticLens</h1>
                    <p>Delivering excellence across borders since our foundation.</p>
                </div>
            </div>

            <div style={{ paddingTop: '80px' }}>
                <AboutUs />

                <div className="page-content" style={{ marginTop: '40px' }}>
                    <div className="service-detail-card">
                        <img src={missionImage} alt="Our Mission" />
                        <div className="service-detail-text">
                            <h2 style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '2.5rem' }}>Our Mission</h2>
                            <p style={{ fontSize: '1.1rem', color: '#526D82', lineHeight: '1.8' }}>To provide innovative, reliable, and scalable logistics solutions that empower businesses to reach their global potential without borders or limitations.</p>
                        </div>
                    </div>
                    <div className="service-detail-card reverse">
                        <img src={visionImage} alt="Our Vision" />
                        <div className="service-detail-text">
                            <h2 style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '2.5rem' }}>Our Vision</h2>
                            <p style={{ fontSize: '1.1rem', color: '#526D82', lineHeight: '1.8' }}>To be the world's most trusted logistics partner, setting the industry standard for speed, security, and customer-centric technology.</p>
                        </div>
                    </div>
                </div>

                <TrustAndSupportive />
            </div>
            <Footer />
        </div>
    );
};

export default About;
