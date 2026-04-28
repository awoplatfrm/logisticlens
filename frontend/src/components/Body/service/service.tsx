import './service.css'
import image1 from '../../../assets/images/body/service/XPdefaultcontrail.webp'
import image2 from '../../../assets/images/body/service/360_F_41064239_IaGdGyf1vxHFaNDS5K164OFOwiMe1hC9.jpg'
import image3 from '../../../assets/images/body/service/360_F_191844323_pU7Xlc9ljkRSO1aeOXEl4AA04HjAvblb.jpg'

function Service() {



    return (
        <>
            <div className="serviceContainer">
                <h1>Our Core Competencies lies in <br /> the Four Pillars</h1>
                <p>Specializing in international transport, Logistics and freight forwarding, <br />we connect continents with precision, ensuring seamless and efficient global delivery solution</p>
                <div className="serviceCardsContainer">
                    <div className="serviceCard">                  
                            <img src={image3} alt="image1"/>                      
                        <p>Road freight</p>
                    </div>
                    <div className="serviceCard">
                            <img src={image1} alt="image2"  />
                        <p>Air freight</p>
                    </div>
                    <div className="serviceCard">                
                            <img src={image2} alt="image3"  />
                        <p>Ocean freight</p>
                    </div>
                   
                </div>
        
            </div>
        </>
      );
}

export default Service;