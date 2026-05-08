import logo from '../../assets/logo/Dark_lue_and_White_Flat_Illustrative_Logistics_Services_Logo_20260501_171320_0000-removebg-preview.png';
import './navbar.css';
import { Link, NavLink } from 'react-router-dom'
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
                    <li className='nav-item'><NavLink to={"/"} end>Home</NavLink></li>
                    <li className='nav-item'><NavLink to={'/services'}>Service</NavLink></li>
                    <li className='nav-item'><NavLink to={"/about"}>About</NavLink></li>
                    <li className='nav-item'><NavLink to={"/contact"}>Contact</NavLink></li>
                </ul>
            </div>



        </>
    );
}

export default Navbar;