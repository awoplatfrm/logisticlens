// import Navbar from "../../components/navbar/navbar";
import Header from "../../components/header/header";
import Service from "../../components/Body/service/service";
import WhyChooseUs from '../../components/Body/why-choose-us/whyChooseUs';
import AboutUs from "../../components/Body/about-us/aboutUs";
import TrustAndSupportive from "../../components/Body/trustAndSupportive/trustAndSupportive";
import Footer from '../../components/footer/footer';
// import photo from '../../assets/logo/undraw_destination_fkst.png'
// import our_service_photo from '../../assets/logo/undraw_deliveries_2m9t.png'
// import review_photo from '../../assets/logo/undraw_reviews_ukai.svg'
// import reading_photo from '../../assets/logo/undraw_reading_c1xl.png'
import "./home.css"


function Home() {


    return (

        <>
            <div className="homeContainer">
                <Header />
                <Service />
                <WhyChooseUs />
                <AboutUs />
                <TrustAndSupportive />
                <Footer />
            </div>
        </>
    );
}

export default Home;