import './App.css'
import Home from './pages/home/home'
import Admin from './pages/admin/admin.tsx';
import AdminLogin from './pages/admin/admin-pages/login/adminLogin.tsx';
import AdminShipmentForm from './pages/admin/admin-pages/registerShipment/registerShipment.tsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Tracking from './pages/tracking/tracking.tsx';
import Services from './pages/services/services.tsx';
import About from './pages/about/about.tsx';
import Contact from './pages/contact/contact.tsx';
import GetQuote from './pages/getQuote/getQuote.tsx';



function App() {





  return (
    <>

      <BrowserRouter>
        <Routes>
          <Route path='*' element={<Home />} />
          <Route path='services' element={<Services />} />
          <Route path='about' element={<About />} />
          <Route path='contact' element={<Contact />} />
          <Route path='get-quote' element={<GetQuote />} />
          <Route path='track/:trackingNumber' element={<Tracking />} />
          <Route path='admin' element={<Admin />} />
          <Route path='admin/login' element={<AdminLogin />} />
          <Route path='admin/register-shipment' element={<AdminShipmentForm />}></Route>
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App    
