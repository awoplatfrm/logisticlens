import { useEffect } from 'react';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import '../services/services.css';
import './contact.css';

const Contact = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <Navbar />
                <div className="page-title-container">
                    <h1>Contact Us</h1>
                    <p>We're here to help 24/7. Get in touch with our support team.</p>
                </div>
            </div>

            <div className="page-content">
                <div className="contact-container">
                    <div className="contact-info">
                        <h2 style={{ fontFamily: "'Times New Roman', Times, serif" }}>Get In Touch</h2>
                        <p>Have questions about a shipment or our services? Drop us a message and we'll get back to you immediately.</p>

                        <div className="info-item">
                            <i className="bi bi-geo-alt-fill"></i>
                            <div>
                                <p>123 Logistics Avenue, Global City, 10001</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <i className="bi bi-envelope-fill"></i>
                            <div>
                                <h4>Email Us</h4>
                                <p>support@logisticlens.online</p>
                            </div>
                        </div>
                        <img src="https://placehold.co/800x400/F7FBFC/769FCD?text=Location+Map+Image" alt="Map" style={{ width: '100%', borderRadius: '8px', marginTop: '20px', height: '200px', objectFit: 'cover' }} />
                    </div>

                    <div className="contact-form-container">
                        <h2 style={{ fontFamily: "'Times New Roman', Times, serif" }}>Send a Message</h2>
                        <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully!"); }}>
                            <div className="form-group">
                                <input type="text" placeholder="Your Name" required />
                            </div>
                            <div className="form-group">
                                <input type="email" placeholder="Email Address" required />
                            </div>
                            <div className="form-group">
                                <textarea rows={5} placeholder="How can we help you today?" required></textarea>
                            </div>
                            <button type="submit" className="btn-submit-contact">Send Message</button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};
export default Contact;
