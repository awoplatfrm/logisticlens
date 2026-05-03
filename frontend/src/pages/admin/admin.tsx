// frontend/src/pages/AdminDashboard.tsx
import { useState, useEffect, useRef } from 'react';
import { shipments } from '../../services/shipments';
import { authenticate } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';
import './admin.css'

interface Shipment {
      _id: string;
      tracking_number: string;
      name: string;
      email: string;
      phone: string;
      product: string;
      quantity: number;
      weight: number;
      dimensions?: string;
      service_type: string;
      package_type?: string;
      current_status: string;
      from_address?: string;
      from_city: string;
      from_state?: string;
      from_postal_code?: string;
      from_country?: string;
      to_address?: string;
      to_city: string;
      to_state?: string;
      to_postal_code?: string;
      to_country?: string;
      created_at: string;
      order_status: Array<{
            status: string;
            date: string;
            time: string;
            message: string;
            location?: string;
      }>;
      alert?: {
            type: 'info' | 'warning' | 'success' | 'delay';
            message: string;
      };
}

const AdminDashboard = () => {
      const { isLoggedIn } = authenticate
      const navigate = useNavigate();
      const [shipment, setShipment] = useState<Shipment[]>([]);
      const [loading, setLoading] = useState(true);
      const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
      const [updateMode, setUpdateMode] = useState<'status' | 'full' | 'history' | 'email' | 'waybill'>('status');
      const [showModal, setShowModal] = useState(false);
      const [successMessage, setSuccessMessage] = useState('');
      const [errorMessage, setErrorMessage] = useState('');
      const [actionLoading, setActionLoading] = useState(false);
      const [fetchError, setFetchError] = useState('');

      // Pagination & Search State
      const [searchTerm, setSearchTerm] = useState('');
      const [currentPage, setCurrentPage] = useState(1);
      const itemsPerPage = 10;

      // Status update form state
      const [statusUpdate, setStatusUpdate] = useState({
            status: '',
            message: '',
            location: '',
            alertType: 'info' as 'info' | 'warning' | 'success' | 'delay',
            alertMessage: ''
      });

      // Full shipment update form state
      const [shipmentUpdate, setShipmentUpdate] = useState<any>({});

      // History update form state
      const [historyUpdate, setHistoryUpdate] = useState<any[]>([]);
      const [editingHistoryIndex, setEditingHistoryIndex] = useState<number | null>(null);
      const [editingHistoryItem, setEditingHistoryItem] = useState<any>({});

      // Email form state
      const [emailForm, setEmailForm] = useState({
            type: 'registration',
            subject: '',
            message: ''
      });

      // Printing setup
      const printRef = useRef<HTMLDivElement>(null);
      const handlePrint = useReactToPrint({
            contentRef: printRef,
      });

      useEffect(() => {
            if (!isLoggedIn()) {
                  navigate('/admin/login');
                  return;
            }
            fetchShipments();
      }, [isLoggedIn, navigate]);

      const fetchShipments = async () => {
            try {
                  setLoading(true);
                  setFetchError('');
                  const response = await shipments.get_all_shipment();

                  setShipment(response.data);
            } catch (error: any) {
                  if (!navigator.onLine) {
                        setFetchError('No internet connection. Please check your network and try again.');
                  } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                        setFetchError('Request timed out. The server took too long to respond.');
                  } else {
                        setFetchError(error?.response?.data?.message || 'Failed to fetch shipments.');
                  }
            } finally {
                  setLoading(false);
            }
      };

      const handleLogout = () => {
            localStorage.removeItem('token');
            navigate('/admin/login');
      };

      const handleDelete = async (trackingNumber: string) => {
            try {
                  setLoading(true);
                  const isDeleted = await shipments.deleteShipment(trackingNumber);
                  if (isDeleted.status === 200) {
                        setSuccessMessage("User shipment deleted successfully")
                        setTimeout(() => {
                              fetchShipments();
                              setTimeout(() => setSuccessMessage(""), 2000)

                        }, 2000)
                  }


            } catch (error) {
                  setErrorMessage("Failed to delete Shipment");
            } finally {
                  setLoading(false)
            }

      }

      const handleOpenUpdateModal = (shipment: Shipment) => {
            setSelectedShipment(shipment);
            setShipmentUpdate(shipment);
            setStatusUpdate({
                  status: shipment.current_status,
                  message: '',
                  location: '',
                  alertType: shipment.alert?.type || 'info',
                  alertMessage: shipment.alert?.message || ''
            });
            setHistoryUpdate([...(shipment.order_status || [])]);
            setEditingHistoryIndex(null);
            setEmailForm({ type: 'registration', subject: '', message: '' });
            setShowModal(true);
      };

      const handleStatusUpdate = async () => {
            if (!selectedShipment) return;
            setActionLoading(true);

            try {
                  const statusData = {
                        status: statusUpdate.status,
                        message: statusUpdate.message || getDefaultMessage(statusUpdate.status),
                        location: statusUpdate.location,
                        alert: statusUpdate.alertMessage ? {
                              type: statusUpdate.alertType,
                              message: statusUpdate.alertMessage
                        } : null
                  };

                  const response = await shipments.updateShipmentsStatus(selectedShipment.tracking_number, statusData);

                  if (response.data.code === 200) {
                        setSuccessMessage('Status updated successfully!');
                        setTimeout(() => setSuccessMessage(''), 3000);
                        fetchShipments();
                        setShowModal(false);
                  }
            } catch (error) {
                  setErrorMessage('Failed to update status');
                  setTimeout(() => setErrorMessage(''), 3000);
            } finally {
                  setActionLoading(false);
            }
      };

      const handleFullUpdate = async () => {
            if (!selectedShipment) return;
            setActionLoading(true);

            try {
                  const response = await shipments.updateShipments(selectedShipment.tracking_number, shipmentUpdate);

                  if (response.data.code === 200) {
                        setSuccessMessage('Shipment updated successfully!');
                        setTimeout(() => setSuccessMessage(''), 3000);
                        fetchShipments();
                        setShowModal(false);
                  }
            } catch (error) {
                  setErrorMessage('Failed to update shipment');
                  setTimeout(() => setErrorMessage(''), 3000);
            } finally {
                  setActionLoading(false);
            }
      };

      const handleDeleteHistoryItem = (index: number) => {
            const newHistory = [...historyUpdate];
            newHistory.splice(index, 1);
            setHistoryUpdate(newHistory);
      };

      const handleSaveHistory = async () => {
            if (!selectedShipment) return;
            setActionLoading(true);
            try {
                  // Automatically keep current_status in sync with the latest history item
                  const latestStatus = historyUpdate.length > 0
                        ? historyUpdate[historyUpdate.length - 1].status
                        : selectedShipment.current_status;

                  const response = await shipments.updateShipments(selectedShipment.tracking_number, {
                        order_status: historyUpdate,
                        current_status: latestStatus
                  });

                  if (response.data.code === 200) {
                        setSuccessMessage('History updated successfully!');
                        setTimeout(() => setSuccessMessage(''), 3000);
                        fetchShipments();
                        setShowModal(false);
                  }
            } catch (error) {
                  setErrorMessage('Failed to update history');
                  setTimeout(() => setErrorMessage(''), 3000);
            } finally {
                  setActionLoading(false);
            }
      };

      const handleSendEmail = async () => {
            if (!selectedShipment) return;
            setActionLoading(true);
            try {
                  const response = await shipments.sendEmail(selectedShipment.tracking_number, emailForm);
                  if (response.data.code === 200) {
                        setSuccessMessage('Email sent successfully!');
                        setTimeout(() => setSuccessMessage(''), 3000);
                        setShowModal(false);
                  }

            } catch (error: any) {
                  setErrorMessage(error?.response?.data?.message || 'Failed to send email');
                  setTimeout(() => setErrorMessage(''), 3000);
            } finally {
                  setActionLoading(false);
            }
      };

      const getDefaultMessage = (status: string) => {
            const messages: Record<string, string> = {
                  'pending': 'Shipment registered and pending pickup',
                  'picked_up': 'Package picked up from sender',
                  'in_transit': 'Package in transit to destination',
                  'out_for_delivery': 'Package out for delivery',
                  'delivered': 'Package delivered successfully',
                  'exception': 'Exception in delivery process'
            };
            return messages[status] || 'Status updated';
      };

      const getStatusBadgeClass = (status: string) => {
            switch (status) {
                  case 'delivered': return 'status-delivered';
                  case 'in_transit': return 'status-transit';
                  case 'out_for_delivery': return 'status-out';
                  case 'pending': return 'status-pending';
                  case 'exception': return 'status-exception';
                  default: return 'status-default';
            }
      };

      // Filter and Paginate Data
      const filteredShipments = shipment.filter(s =>
            s.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
      const paginatedShipments = filteredShipments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


      return (
            <div className="dashboard-container">
                  <div className="dashboard-header">
                        <h1><i className="bi bi-speedometer2 text-primary" style={{ marginRight: '10px' }}></i>Admin Dashboard</h1>
                        <div className="header-actions">
                              <button
                                    className="btn-refresh"
                                    onClick={() => navigate('/')}
                              >
                                    🏠 Home
                              </button>
                              <button
                                    className="btn-refresh"
                                    onClick={fetchShipments}
                              >
                                    🔄 Refresh
                              </button>
                              <button
                                    className="btn-new"
                                    onClick={() => navigate('../admin/register-shipment')}
                              >
                                    + New Shipment
                              </button>
                              <button
                                    className="btn-cancel"
                                    onClick={handleLogout}
                                    style={{ background: '#ffe3e3', color: '#dc3545', border: 'none' }}
                              >
                                    🚪 Logout
                              </button>
                        </div>
                  </div>


                  {successMessage && (
                        <div className="message success">
                              ✅ {successMessage}
                        </div>
                  )}
                  {errorMessage && (
                        <div className="message error">
                              ❌ {errorMessage}
                        </div>
                  )}

                  {/* Search Bar */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                        <input
                              type="text"
                              placeholder="Search tracking #, name, or email..."
                              value={searchTerm}
                              onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset to page 1 on search
                              }}
                              style={{ padding: '10px 15px', width: '100%', maxWidth: '400px', borderRadius: '8px', border: '1px solid #eef2f6', fontSize: '14px', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                        />
                  </div>


                  <div className="shipments-table-container">
                        {loading ? (
                              <div style={{ textAlign: 'center', padding: '50px' }}>
                                    <div className="spinner-border" style={{ color: '#667eea', width: '3rem', height: '3rem' }} role="status">
                                          <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p style={{ marginTop: '15px', color: '#555', fontWeight: '500' }}>Fetching shipments...</p>
                              </div>
                        ) : fetchError ? (
                              <div style={{ textAlign: 'center', padding: '50px', color: '#dc3545' }}>
                                    <h4>⚠️ {fetchError}</h4>
                                    <button onClick={fetchShipments} style={{ marginTop: '15px', padding: '8px 20px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                          🔄 Retry Connection
                                    </button>
                              </div>
                        ) : shipment.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                                    <h4>No shipments found.</h4>
                                    <p>Click "+ New Shipment" to register a package.</p>
                              </div>
                        ) : (
                              <table className="shipments-table">
                                    <thead>
                                          <tr>
                                                <th>Tracking #</th>
                                                <th>Customer</th>
                                                <th>From → To</th>
                                                <th>Product</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                          </tr>
                                    </thead>
                                    <tbody>
                                          {paginatedShipments.map((shipment) => (
                                                <tr key={shipment._id}>
                                                      <td className="tracking-cell">
                                                            <span className="tracking-number">
                                                                  {shipment.tracking_number}
                                                            </span>
                                                      </td>
                                                      <td>
                                                            <div className="customer-info">
                                                                  <strong>{shipment.name}</strong>
                                                                  <small>{shipment.email}</small>
                                                            </div>
                                                      </td>
                                                      <td>
                                                            <span className="route">
                                                                  {shipment.from_city} → {shipment.to_city}
                                                            </span>
                                                      </td>
                                                      <td><span className='product'>{shipment.product}</span></td>
                                                      <td>
                                                            <span className={`status-badge ${getStatusBadgeClass(shipment.current_status)}`}>
                                                                  {shipment.current_status?.replace('_', ' ')}
                                                            </span>
                                                      </td>
                                                      <td>{new Date(shipment.created_at).toLocaleDateString()}</td>
                                                      <td className='btn-action' style={{ gap: '8px' }}>
                                                            <button
                                                                  className="btn-update"
                                                                  onClick={() => handleOpenUpdateModal(shipment)}
                                                            >
                                                                  Update
                                                            </button>
                                                            <button className='btn-update' onClick={() => navigate(`/track/${shipment.tracking_number}`)}>
                                                                  Track
                                                            </button>
                                                            <button className='btn-update' style={{ background: '#e0e7ff', color: '#667eea' }} onClick={() => { handleOpenUpdateModal(shipment); setUpdateMode('email'); }}>
                                                                  📧 Email
                                                            </button>
                                                            <button className='btn-update' style={{ background: '#e2e3e5', color: '#383d41' }} onClick={() => { handleOpenUpdateModal(shipment); setUpdateMode('waybill'); }}>
                                                                  🖨️ Print
                                                            </button>
                                                            <button className='btn-update' style={{ background: '#ffe3e3', color: '#dc3545' }} onClick={() => handleDelete(shipment.tracking_number)}>
                                                                  Delete
                                                            </button>
                                                      </td>
                                                </tr>
                                          ))}
                                    </tbody>
                              </table>
                        )}

                        {/* Pagination Controls */}
                        {!loading && !fetchError && totalPages > 1 && (
                              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px', padding: '10px 0' }}>
                                    <button
                                          className="btn-cancel"
                                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                          disabled={currentPage === 1}
                                          style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                    >
                                          Previous
                                    </button>
                                    <span style={{ fontSize: '14px', color: '#555', fontWeight: 500 }}>
                                          Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                          className="btn-update-status"
                                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                          disabled={currentPage === totalPages}
                                          style={{ padding: '10px 20px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', margin: 0 }}
                                    >
                                          Next
                                    </button>
                              </div>
                        )}
                  </div>

                  {/* Update Modal */}
                  {showModal && selectedShipment && (
                        <div id="modal-overlay">
                              <div id="modal-content">
                                    <div id="modal-header">
                                          <h2>Update Shipment</h2>
                                          <button
                                                className="modal-close"
                                                onClick={() => setShowModal(false)}
                                          >
                                                ×
                                          </button>
                                    </div>

                                    {/* Update Mode Selector */}
                                    <div className="mode-selector">
                                          <button
                                                className={`mode-btn ${updateMode === 'status' ? 'active' : ''}`}
                                                onClick={() => setUpdateMode('status')}
                                          >
                                                Update Status Only
                                          </button>
                                          <button
                                                className={`mode-btn ${updateMode === 'full' ? 'active' : ''}`}
                                                onClick={() => setUpdateMode('full')}
                                          >
                                                Update Full Shipment
                                          </button>
                                          <button
                                                className={`mode-btn ${updateMode === 'history' ? 'active' : ''}`}
                                                onClick={() => setUpdateMode('history')}
                                          >
                                                Edit Status History
                                          </button>
                                          <button
                                                className={`mode-btn ${updateMode === 'email' ? 'active' : ''}`}
                                                onClick={() => setUpdateMode('email')}
                                          >
                                                Send Email
                                          </button>
                                          <button
                                                className={`mode-btn ${updateMode === 'waybill' ? 'active' : ''}`}
                                                onClick={() => setUpdateMode('waybill')}
                                          >
                                                Print Waybill
                                          </button>
                                    </div>

                                    {updateMode === 'status' ? (
                                          /* Status Update Form */
                                          <div className="status-update-form">
                                                <h3>Tracking #: {selectedShipment.tracking_number}</h3>

                                                <div className="form-group">
                                                      <label>Status *</label>
                                                      <select
                                                            value={statusUpdate.status}
                                                            onChange={(e) => setStatusUpdate({
                                                                  ...statusUpdate,
                                                                  status: e.target.value
                                                            })}
                                                            required
                                                      >
                                                            <option value="">Select status</option>
                                                            <option value="pending">Pending</option>
                                                            <option value="picked_up">Picked Up</option>
                                                            <option value="in_transit">In Transit</option>
                                                            <option value="out_for_delivery">Out for Delivery</option>
                                                            <option value="delivered">Delivered</option>
                                                            <option value="exception">Exception/Delay</option>
                                                      </select>
                                                </div>

                                                <div className="form-group">
                                                      <label>Location (optional)</label>
                                                      <input
                                                            type="text"
                                                            value={statusUpdate.location}
                                                            onChange={(e) => setStatusUpdate({
                                                                  ...statusUpdate,
                                                                  location: e.target.value
                                                            })}
                                                            placeholder="e.g., Chicago, IL"
                                                      />
                                                </div>

                                                <div className="form-group">
                                                      <label>Status Message</label>
                                                      <textarea
                                                            value={statusUpdate.message}
                                                            onChange={(e) => setStatusUpdate({
                                                                  ...statusUpdate,
                                                                  message: e.target.value
                                                            })}
                                                            placeholder="Enter status message or leave blank for default"
                                                            rows={2}
                                                      />
                                                </div>

                                                {/* Alert/Warning Section */}
                                                <div className="alert-section">
                                                      <h4>Additional Alert (Optional)</h4>

                                                      <div className="form-group">
                                                            <label>Alert Type</label>
                                                            <select
                                                                  value={statusUpdate.alertType}
                                                                  onChange={(e) => setStatusUpdate({
                                                                        ...statusUpdate,
                                                                        alertType: e.target.value as any
                                                                  })}
                                                            >
                                                                  <option value="info">ℹ️ Information</option>
                                                                  <option value="success">✅ Success</option>
                                                                  <option value="warning">⚠️ Warning</option>
                                                                  <option value="delay">⏰ Delay/Customs</option>
                                                            </select>
                                                      </div>

                                                      <div className="form-group">
                                                            <label>Alert Message</label>
                                                            <textarea
                                                                  value={statusUpdate.alertMessage}
                                                                  onChange={(e) => setStatusUpdate({
                                                                        ...statusUpdate,
                                                                        alertMessage: e.target.value
                                                                  })}
                                                                  placeholder="e.g., Package held at customs for inspection, Delayed due to weather conditions, Insurance claim filed, etc."
                                                                  rows={2}
                                                            />
                                                      </div>

                                                      {/* Alert Preview */}
                                                      {statusUpdate.alertMessage && (
                                                            <div className={`alert-preview alert-${statusUpdate.alertType}`}>
                                                                  <strong>
                                                                        {statusUpdate.alertType === 'info' && 'ℹ️'}
                                                                        {statusUpdate.alertType === 'success' && '✅'}
                                                                        {statusUpdate.alertType === 'warning' && '⚠️'}
                                                                        {statusUpdate.alertType === 'delay' && '⏰'}
                                                                  </strong>
                                                                  {statusUpdate.alertMessage}
                                                            </div>
                                                      )}
                                                </div>

                                                <div className="modal-actions">
                                                      <button
                                                            className="btn-cancel"
                                                            onClick={() => setShowModal(false)}
                                                      >
                                                            Cancel
                                                      </button>
                                                      <button
                                                            className="btn-update-status"
                                                            onClick={handleStatusUpdate}
                                                            disabled={!statusUpdate.status || actionLoading}
                                                      >
                                                            {actionLoading ? 'Updating...' : 'Update Status'}
                                                      </button>
                                                </div>
                                          </div>
                                    ) : updateMode === 'full' ? (
                                          /* Full Shipment Update Form */
                                          <div className="full-update-form">
                                                <h3>Edit Shipment Details</h3>

                                                {/* Customer Information */}
                                                <div className="form-section">
                                                      <h4>Customer Information</h4>
                                                      <div className="form-row">
                                                            <div className="form-group">
                                                                  <label className='label'>Name</label>
                                                                  <input
                                                                        type="text"
                                                                        value={shipmentUpdate.name || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              name: e.target.value
                                                                        })}
                                                                  />
                                                            </div>
                                                            <div className="form-group">
                                                                  <label className='label'>Email</label>
                                                                  <input
                                                                        type="email"
                                                                        value={shipmentUpdate.email || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              email: e.target.value
                                                                        })}
                                                                  />
                                                            </div>
                                                      </div>
                                                      <div className="form-row">
                                                            <div className="form-group">
                                                                  <label className='label'>Phone</label>
                                                                  <input
                                                                        type="text"
                                                                        value={shipmentUpdate.phone || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              phone: e.target.value
                                                                        })}
                                                                  />
                                                            </div>
                                                      </div>
                                                </div>

                                                {/* Origin Address */}
                                                <div className="form-section">
                                                      <h4>Origin Address (From)</h4>
                                                      <div className="form-group">
                                                            <label className='label'>Street Address</label>
                                                            <input
                                                                  type="text"
                                                                  value={shipmentUpdate.from_address || ''}
                                                                  onChange={(e) => setShipmentUpdate({
                                                                        ...shipmentUpdate,
                                                                        from_address: e.target.value
                                                                  })}
                                                            />
                                                      </div>
                                                      <div className="form-row">
                                                            <div className="form-group">
                                                                  <label className='label'>City</label>
                                                                  <input
                                                                        type="text"
                                                                        value={shipmentUpdate.from_city || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              from_city: e.target.value
                                                                        })}
                                                                  />
                                                            </div>
                                                            <div className="form-group">
                                                                  <label className='label'>State</label>
                                                                  <input
                                                                        type="text"
                                                                        value={shipmentUpdate.from_state || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              from_state: e.target.value
                                                                        })}
                                                                  />
                                                            </div>
                                                      </div>
                                                      <div className="form-row">
                                                            <div className="form-group">
                                                                  <label className='label'>Postal Code</label>
                                                                  <input
                                                                        type="text"
                                                                        value={shipmentUpdate.from_postal_code || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              from_postal_code: e.target.value
                                                                        })}
                                                                  />
                                                            </div>
                                                            <div className="form-group">
                                                                  <label className='label'>Country</label>
                                                                  <select
                                                                        value={shipmentUpdate.from_country || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              from_country: e.target.value
                                                                        })}
                                                                  >
                                                                        <option value="">Select country</option>
                                                                        <option value="US">United States</option>
                                                                        <option value="CA">Canada</option>
                                                                        <option value="UK">United Kingdom</option>
                                                                  </select>
                                                            </div>
                                                      </div>
                                                </div>

                                                {/* Destination Address */}
                                                <div className="form-section">
                                                      <h4>Destination Address (To)</h4>
                                                      <div className="form-group">
                                                            <label className='label'>Street Address</label>
                                                            <input
                                                                  type="text"
                                                                  value={shipmentUpdate.to_address || ''}
                                                                  onChange={(e) => setShipmentUpdate({
                                                                        ...shipmentUpdate,
                                                                        to_address: e.target.value
                                                                  })}
                                                            />
                                                      </div>
                                                      <div className="form-row">
                                                            <div className="form-group">
                                                                  <label className='label'>City</label>
                                                                  <input
                                                                        type="text"
                                                                        value={shipmentUpdate.to_city || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              to_city: e.target.value
                                                                        })}
                                                                  />
                                                            </div>
                                                            <div className="form-group">
                                                                  <label className='label'>State</label>
                                                                  <input
                                                                        type="text"
                                                                        value={shipmentUpdate.to_state || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              to_state: e.target.value
                                                                        })}
                                                                  />
                                                            </div>
                                                      </div>
                                                      <div className="form-row">
                                                            <div className="form-group">
                                                                  <label className='label'>Postal Code</label>
                                                                  <input
                                                                        type="text"
                                                                        value={shipmentUpdate.to_postal_code || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              to_postal_code: e.target.value
                                                                        })}
                                                                  />
                                                            </div>
                                                            <div className="form-group">
                                                                  <label className='label'>Country</label>
                                                                  <select
                                                                        value={shipmentUpdate.to_country || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              to_country: e.target.value
                                                                        })}
                                                                  >
                                                                        <option value="">Select country</option>
                                                                        <option value="US">United States</option>
                                                                        <option value="CA">Canada</option>
                                                                        <option value="UK">United Kingdom</option>
                                                                  </select>
                                                            </div>
                                                      </div>
                                                </div>

                                                {/* Package Details */}
                                                <div className="form-section">
                                                      <h4>Package Details</h4>
                                                      <div className="form-row">
                                                            <div className="form-group">
                                                                  <label className='label'>Product</label>
                                                                  <input
                                                                        type="text"
                                                                        value={shipmentUpdate.product || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              product: e.target.value
                                                                        })}
                                                                  />
                                                            </div>
                                                            <div className="form-group">
                                                                  <label className='label'>Quantity</label>
                                                                  <input
                                                                        type="number"
                                                                        value={shipmentUpdate.quantity || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              quantity: parseInt(e.target.value)
                                                                        })}
                                                                  />
                                                            </div>
                                                      </div>
                                                      <div className="form-row">
                                                            <div className="form-group">
                                                                  <label className='label'>Weight (kg)</label>
                                                                  <input
                                                                        type="number"
                                                                        step="0.1"
                                                                        value={shipmentUpdate.weight || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              weight: parseFloat(e.target.value)
                                                                        })}
                                                                  />
                                                            </div>
                                                            <div className="form-group">
                                                                  <label className='label'>Dimensions</label>
                                                                  <input
                                                                        type="text"
                                                                        value={shipmentUpdate.dimensions || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              dimensions: e.target.value
                                                                        })}
                                                                        placeholder="L x W x H (cm)"
                                                                  />
                                                            </div>
                                                      </div>
                                                      <div className="form-row">
                                                            <div className="form-group">
                                                                  <label className='label'>Service Type</label>
                                                                  <select
                                                                        value={shipmentUpdate.service_type || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              service_type: e.target.value
                                                                        })}
                                                                  >
                                                                        <option value="air">Air Freight</option>
                                                                        <option value="sea">Sea Freight</option>
                                                                        <option value="road">Road Freight</option>
                                                                        <option value="express">Express</option>
                                                                  </select>
                                                            </div>
                                                            <div className="form-group">
                                                                  <label className='label'>Package Type</label>
                                                                  <select
                                                                        value={shipmentUpdate.package_type || ''}
                                                                        onChange={(e) => setShipmentUpdate({
                                                                              ...shipmentUpdate,
                                                                              package_type: e.target.value
                                                                        })}
                                                                  >
                                                                        <option value="box">Box</option>
                                                                        <option value="envelope">Envelope</option>
                                                                        <option value="pallet">Pallet</option>
                                                                  </select>
                                                            </div>
                                                      </div>
                                                </div>

                                                <div className="modal-actions">
                                                      <button
                                                            className="btn-cancel"
                                                            onClick={() => setShowModal(false)}
                                                      >
                                                            Cancel
                                                      </button>
                                                      <button
                                                            className="btn-update-full"
                                                            onClick={handleFullUpdate}
                                                            disabled={actionLoading}
                                                      >
                                                            {actionLoading ? 'Updating...' : 'Update Shipment'}
                                                      </button>
                                                </div>
                                          </div>
                                    ) : updateMode === 'history' ? (
                                          /* History Update Form */
                                          <div className="history-update-form">
                                                <h3>Edit Tracking History</h3>
                                                <div className="history-list">
                                                      {historyUpdate.map((item, index) => (
                                                            <div key={index} className="history-item-card">
                                                                  {editingHistoryIndex === index ? (
                                                                        <div className="history-edit-mode">
                                                                              <div className="form-group">
                                                                                    <label className="label">Status</label>
                                                                                    <select value={editingHistoryItem.status || ''} onChange={(e) => setEditingHistoryItem({ ...editingHistoryItem, status: e.target.value })}>
                                                                                          <option value="pending">Pending</option>
                                                                                          <option value="picked_up">Picked Up</option>
                                                                                          <option value="in_transit">In Transit</option>
                                                                                          <option value="out_for_delivery">Out for Delivery</option>
                                                                                          <option value="delivered">Delivered</option>
                                                                                          <option value="exception">Exception/Delay</option>
                                                                                    </select>
                                                                              </div>
                                                                              <div className="form-group">
                                                                                    <label className="label">Message</label>
                                                                                    <input type="text" value={editingHistoryItem.message || ''} onChange={(e) => setEditingHistoryItem({ ...editingHistoryItem, message: e.target.value })} />
                                                                              </div>
                                                                              <div className="form-group">
                                                                                    <label className="label">Location</label>
                                                                                    <input type="text" value={editingHistoryItem.location || ''} onChange={(e) => setEditingHistoryItem({ ...editingHistoryItem, location: e.target.value })} />
                                                                              </div>
                                                                              <div className="form-row">
                                                                                    <div className="form-group">
                                                                                          <label className="label">Date</label>
                                                                                          <input type="text" value={editingHistoryItem.date || ''} onChange={(e) => setEditingHistoryItem({ ...editingHistoryItem, date: e.target.value })} placeholder="e.g. Jan 1, 2024" />
                                                                                    </div>
                                                                                    <div className="form-group">
                                                                                          <label className="label">Time</label>
                                                                                          <input type="text" value={editingHistoryItem.time || ''} onChange={(e) => setEditingHistoryItem({ ...editingHistoryItem, time: e.target.value })} placeholder="e.g. 10:00 AM" />
                                                                                    </div>
                                                                              </div>
                                                                              <div className="history-actions" style={{ marginTop: '10px' }}>
                                                                                    <button className="btn-update-status" onClick={() => {
                                                                                          const newHistory = [...historyUpdate];
                                                                                          newHistory[index] = editingHistoryItem;
                                                                                          setHistoryUpdate(newHistory);
                                                                                          setEditingHistoryIndex(null);
                                                                                    }}>Save Item</button>
                                                                                    <button className="btn-cancel" onClick={() => setEditingHistoryIndex(null)}>Cancel</button>
                                                                              </div>
                                                                        </div>
                                                                  ) : (
                                                                        <div className="history-view-mode">
                                                                              <div className="history-info">
                                                                                    <strong>{item.status?.replace('_', ' ') || 'Pending'}</strong>
                                                                                    <span className="history-meta"> — {item.date} {item.time}</span>
                                                                                    <p>{item.message}</p>
                                                                                    {item.location && <p className="history-location"><small>📍 {item.location}</small></p>}
                                                                              </div>
                                                                              <div className="history-actions">
                                                                                    <button
                                                                                          className="btn-edit"
                                                                                          onClick={() => {
                                                                                                setEditingHistoryIndex(index);
                                                                                                setEditingHistoryItem({ ...item });
                                                                                          }}
                                                                                    >
                                                                                          Edit
                                                                                    </button>
                                                                                    <button
                                                                                          className="btn-delete"
                                                                                          onClick={() => handleDeleteHistoryItem(index)}
                                                                                    >
                                                                                          Delete
                                                                                    </button>
                                                                              </div>
                                                                        </div>
                                                                  )}
                                                            </div>
                                                      ))}
                                                      {historyUpdate.length === 0 && <p style={{ color: '#666', textAlign: 'center' }}>No history entries available.</p>}
                                                </div>

                                                <div className="modal-actions">
                                                      <button
                                                            className="btn-cancel"
                                                            onClick={() => setShowModal(false)}
                                                      >
                                                            Cancel
                                                      </button>
                                                      <button
                                                            className="btn-update-full"
                                                            onClick={handleSaveHistory}
                                                            disabled={actionLoading}
                                                      >
                                                            {actionLoading ? 'Saving...' : 'Save History Changes'}
                                                      </button>
                                                </div>
                                          </div>
                                    ) : updateMode === 'email' ? (
                                          /* Email Form */
                                          <div className="status-update-form">
                                                <h3>Send Email to {selectedShipment.name}</h3>
                                                <div className="form-group">
                                                      <label>Email Type</label>
                                                      <select
                                                            value={emailForm.type}
                                                            onChange={(e) => setEmailForm({ ...emailForm, type: e.target.value })}
                                                      >
                                                            <option value="registration">Registration / Welcome Info</option>
                                                            <option value="status">Status Update</option>
                                                            <option value="custom">Custom Message</option>
                                                      </select>
                                                </div>
                                                {emailForm.type === 'custom' && (
                                                      <div className="form-group">
                                                            <label>Subject</label>
                                                            <input type="text" value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} placeholder="Enter email subject" />
                                                      </div>
                                                )}
                                                <div className="form-group">
                                                      <label>Message / Additional Notes</label>
                                                      <textarea
                                                            value={emailForm.message}
                                                            onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                                                            placeholder="Enter any additional notes or your custom message here..."
                                                            rows={6}
                                                      />
                                                </div>
                                                <div className="modal-actions">
                                                      <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                                      <button className="btn-update-status" onClick={handleSendEmail} disabled={actionLoading || (emailForm.type === 'custom' && (!emailForm.subject || !emailForm.message))}>{actionLoading ? 'Sending...' : 'Send Email 🚀'}</button>
                                                </div>
                                          </div>
                                    ) : updateMode === 'waybill' ? (
                                          /* Waybill Print Preview */
                                          <div className="status-update-form" style={{ padding: '20px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                      <h3 style={{ margin: 0 }}>Shipping Label Preview</h3>
                                                      <button className="btn-update-status" onClick={() => handlePrint()} style={{ background: '#28a745' }}>🖨️ Print Label</button>
                                                </div>

                                                <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px', background: '#f8f9fa' }}>
                                                      {/* This is the div that will actually be printed */}
                                                      <div ref={printRef} style={{ padding: '30px', background: '#fff', color: '#000', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
                                                            {/* Header */}
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '15px', marginBottom: '20px' }}>
                                                                  <div>
                                                                        <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', color: '#333' }}>LogisticLenz</h1>
                                                                        <p style={{ margin: 0, fontSize: '14px', color: '#666', fontWeight: 'bold' }}>EXPRESS COURIER SERVICE</p>
                                                                  </div>
                                                                  <div style={{ textAlign: 'right' }}>
                                                                        <Barcode value={selectedShipment.tracking_number} height={50} width={1.8} displayValue={true} fontSize={14} margin={0} />
                                                                  </div>
                                                            </div>

                                                            {/* Addresses */}
                                                            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                                                  <div style={{ flex: 1, border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
                                                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>SENDER (ORIGIN)</h4>
                                                                        <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}><strong>{selectedShipment.from_city}</strong></p>
                                                                        <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{selectedShipment.from_address}</p>
                                                                        <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{selectedShipment.from_city}, {selectedShipment.from_state} {selectedShipment.from_postal_code}</p>
                                                                        <p style={{ margin: 0, fontSize: '14px' }}><strong>{selectedShipment.from_country}</strong></p>
                                                                  </div>
                                                                  <div style={{ flex: 1, border: '2px solid #000', padding: '15px', borderRadius: '4px', background: '#fafafa' }}>
                                                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>RECEIVER (DESTINATION)</h4>
                                                                        <p style={{ margin: '0 0 5px 0', fontSize: '16px' }}><strong>{selectedShipment.name}</strong></p>
                                                                        <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{selectedShipment.to_address}</p>
                                                                        <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{selectedShipment.to_city}, {selectedShipment.to_state} {selectedShipment.to_postal_code}</p>
                                                                        <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}><strong>{selectedShipment.to_country}</strong></p>
                                                                        <p style={{ margin: '10px 0 0 0', fontSize: '12px' }}>Phone: {selectedShipment.phone}</p>
                                                                        <p style={{ margin: '0', fontSize: '12px' }}>Email: {selectedShipment.email}</p>
                                                                  </div>
                                                            </div>

                                                            {/* Package Details */}
                                                            <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
                                                                  <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>PACKAGE DETAILS</h4>
                                                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                                        <div>
                                                                              <p style={{ margin: '0 0 5px 0' }}><strong>Description:</strong> {selectedShipment.product}</p>
                                                                              <p style={{ margin: '0 0 5px 0' }}><strong>Quantity:</strong> {selectedShipment.quantity}</p>
                                                                              <p style={{ margin: 0 }}><strong>Weight:</strong> {selectedShipment.weight} kg</p>
                                                                        </div>
                                                                        <div style={{ textAlign: 'right' }}>
                                                                              <p style={{ margin: '0 0 5px 0' }}><strong>Service:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedShipment.service_type}</span></p>
                                                                              <p style={{ margin: '0 0 5px 0' }}><strong>Date:</strong> {new Date(selectedShipment.created_at).toLocaleDateString()}</p>
                                                                        </div>
                                                                  </div>
                                                            </div>

                                                            {/* Footer */}
                                                            <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #000' }}>
                                                                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>This waybill is generated electronically and serves as proof of shipment.</p>
                                                                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Track at: {window.location.origin}/track/{selectedShipment.tracking_number}</p>
                                                            </div>
                                                      </div>
                                                </div>
                                          </div>
                                    ) : null}
                              </div>
                        </div>
                  )}
            </div>
      );
};

export default AdminDashboard;