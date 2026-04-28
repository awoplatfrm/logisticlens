import './aboutUs.css'
import image from "../../../assets/images/body/aboutUs/logistics_image.jpg"
function AboutUs() {



  return (
    <>
      <div className="aboutUsContainer">
        <div className="aboutUswrap">
          <div className="aboutUsImageContainer">
            <img src={image} alt="image" />
          </div>
          <div className="aboutUsTextContainer">
            <h2>About LogisticLenz</h2>
            <h4>Get To Know Logistics Lenz</h4>
            <p>Swift Cargo is a leading name in the logistics industry,
              known for its efficiency and reliability.
              We specialize in delivering tailored solutions for businesses of all sizes.
              With global coverage and advanced tracking,
              we ensure your shipments are always on time and secure.
            </p>
            <button>More About Us</button>
          </div>
        </div>
        <div className="aboutUsFiguresContainer">
          <div className="aboutUsFigure">
            <h1>3000+</h1>
            <p>Number Of Shipments Delivered</p>
          </div>
          <div className="aboutUsFigure">
            <h1>300 000+</h1>
            <p>Total Tons Delivered</p>
          </div>
          <div className="aboutUsFigure">
            <h1>4mnl +</h1>
            <p>Total Kilometers Covered</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutUs;