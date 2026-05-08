import { useEffect } from 'react';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import Service from '../../components/Body/service/service';
import airFreightImage from '../../assets/images/body/service/AIrFreight.jpg'
import oceanFreightImage from '../../assets/images/body/service/ocean freight.jpg'
import './services.css';

const Services = () => {
    // Automatically scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <Navbar />
                <div className="page-title-container">
                    <h1>Our Logistics Services</h1>
                    <p>Comprehensive freight and supply chain solutions tailored for your business needs.</p>
                </div>
            </div>

            <div style={{ paddingTop: '40px' }}>
                {/* Reuse your existing Service component */}
                <Service />

                <div className="page-content">
                    <div className="service-detail-card">
                        {/* Swap this image src with your actual image path later */}
                        <img src={airFreightImage} alt="Air Freight" />
                        <div className="service-detail-text">
                            <h2 style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '2.5rem', color: '#27374D' }}>Global Air Freight</h2>
                            <p style={{ fontSize: '1.1rem', color: '#526D82', lineHeight: '1.8' }}>Fast, reliable, and secure air freight services to destinations worldwide. We ensure your urgent shipments arrive on time, every time, with priority boarding and real-time tracking.</p>
                        </div>
                    </div>

                    <div className="service-detail-card reverse">
                        <img src={oceanFreightImage} alt="Ocean Freight" />
                        <div className="service-detail-text">
                            <h2 style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '2.5rem', color: '#27374D' }}>Ocean & Sea Freight</h2>
                            <p style={{ fontSize: '1.1rem', color: '#526D82', lineHeight: '1.8' }}>Cost-effective ocean freight solutions for large volume shipments. We handle both Full Container Load (FCL) and Less than Container Load (LCL) shipments with global port coverage.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Services;
