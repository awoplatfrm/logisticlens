import { useEffect } from 'react';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import Service from '../../components/Body/service/service';
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
                        <img src="https://placehold.co/600x400/f8faff/667eea?text=Air+Freight+Image" alt="Air Freight" />
                        <div className="service-detail-text">
                            <h2>Global Air Freight</h2>
                            <p>Fast, reliable, and secure air freight services to destinations worldwide. We ensure your urgent shipments arrive on time, every time, with priority boarding and real-time tracking.</p>
                        </div>
                    </div>

                    <div className="service-detail-card reverse">
                        <img src="https://placehold.co/600x400/f8faff/667eea?text=Ocean+Freight+Image" alt="Ocean Freight" />
                        <div className="service-detail-text">
                            <h2>Ocean & Sea Freight</h2>
                            <p>Cost-effective ocean freight solutions for large volume shipments. We handle both Full Container Load (FCL) and Less than Container Load (LCL) shipments with global port coverage.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Services;
