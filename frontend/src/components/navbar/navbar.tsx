import logo from '../../assets/logo/Dark_lue_and_White_Flat_Illustrative_Logistics_Services_Logo_20260501_171320_0000-removebg-preview.png';
import './navbar.css';
import { Link } from 'react-router-dom'
import { useState } from 'react'

function Navbar() {

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>

            <div className="navbarContainer">
                <div className='logoContainer'>
                    <Link to="/">
                        <img src={logo} alt="LogisticLens Logo" className="navbarLogo" />
                    </Link>
                    <div className='mobile-menu-icon' onClick={toggleMenu}>
                        <i className={`bi ${isMenuOpen ? 'bi-x' : 'bi-list'} menu-icon`}></i>
                    </div>
                </div>


                <ul className={`navbarList ${isMenuOpen ? 'active' : ''}`} id=''>
                    <li className='nav-item'><Link to={"/"}>Home</Link></li>
                    <li className='nav-item'><Link to={'/'}>Service</Link></li>
                    <li className='nav-item'><Link to={"/"}>About</Link></li>
                    <li className='nav-item'><Link to={"/"}>Contact</Link></li>
                </ul>
            </div>



        </>
    );
}

export default Navbar;