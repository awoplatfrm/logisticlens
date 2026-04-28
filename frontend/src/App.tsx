import './App.css'
import Home from './pages/home/home'
import Admin from './pages/admin/admin.tsx';
import AdminLogin from './pages/admin/admin-pages/login/adminLogin.tsx';
import AdminShipmentForm from './pages/admin/admin-pages/registerShipment/registerShipment.tsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Tracking from './pages/tracking/tracking.tsx';


function App() {





  return (
    <>

      <BrowserRouter>
        <Routes>
          <Route path='*' element={<Home />} />
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
