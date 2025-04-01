import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClaimModal, StatusModal } from './ItemDetailModals';
import './ItemDetail.css';

const ItemDetail = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [relatedItems, setRelatedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // States for modals and claims
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [claimDescription, setClaimDescription] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [claims, setClaims] = useState([]);
    const [claimsLoading, setClaimsLoading] = useState(false);
    const [claimsError, setClaimsError] = useState(null);
    const [isClaimsExpanded, setIsClaimsExpanded] = useState(false);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                await Promise.all([
                    fetchItemDetails(),
                    fetchRelatedItems(),
                    fetchClaims()
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [itemId]);

    const fetchItemDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/lostfound/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch item details');
            
            const data = await response.json();
            console.log('Item details:', data);
            setItem(data);
            setNewStatus(data.status);
        } catch (error) {
            console.error('Error fetching item details:', error);
            throw new Error('Failed to fetch item details');
        }
    };

    const fetchRelatedItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/lostfound/${itemId}/related`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch related items');
            
            const data = await response.json();
            console.log('Related items response:', data);
            
            if (data.success && data.matches) {
                setRelatedItems(data.matches);
            }
        } catch (error) {
            console.error('Error fetching related items:', error);
            setRelatedItems([]);
        }
    };

    const fetchClaims = async () => {
        try {
            setClaimsLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/lostfound/${itemId}/claims`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (!response.ok) throw new Error('Failed to fetch claims');
    
            const data = await response.json();
            console.log('Claims data:', data);
            
            // Check if data.claims exists and is an array
            if (data && Array.isArray(data.claims)) {
                setClaims(data.claims);
            } else {
                setClaims([]);
            }
        } catch (error) {
            console.error('Error fetching claims:', error);
            setClaimsError(error.message);
            setClaims([]);
        } finally {
            setClaimsLoading(false);
        }
    };

    // In ItemDetail.js

    const handleClaimSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            // Add the message
            formData.append('message', claimDescription);

            // Get the file input and add it if it exists
            const fileInput = e.target.querySelector('input[type="file"]');
            if (fileInput && fileInput.files[0]) {
                formData.append('proofImage', fileInput.files[0]);
            }

            // Debug log
            console.log('Submitting claim with:', {
                itemId,
                message: claimDescription,
                file: fileInput?.files[0]
            });

            const response = await fetch(`http://localhost:5000/api/lostfound/${itemId}/claim`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do not set Content-Type header for FormData
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit claim');
            }

            const data = await response.json();
            console.log('Claim submission response:', data);

            // Show success message and reset form
            alert('Claim submitted successfully!');
            setIsClaimModalOpen(false);
            setClaimDescription('');
            fetchClaims(); // Refresh claims list
        } catch (error) {
            console.error('Error submitting claim:', error);
            alert(error.message || 'Failed to submit claim');
        }
    };

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/lostfound/${itemId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');

            alert('Status updated successfully');
            setIsStatusModalOpen(false);
            fetchItemDetails();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleClaimStatusUpdate = async (claimId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/lostfound/${itemId}/claims/${claimId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update claim status');
            }
    
            const data = await response.json();
            console.log('Claim status update response:', data);
    
            // Refresh the claims and item details
            await Promise.all([fetchClaims(), fetchItemDetails()]);
            alert(`Claim ${newStatus} successfully`);
    
        } catch (error) {
            console.error('Error updating claim status:', error);
            alert(error.message || 'Failed to update claim status');
        }
    };

    const confirmClaimStatusUpdate = (claimId, newStatus) => {
        const action = newStatus === 'approved' ? 'approve' : 'reject';
        const message = newStatus === 'approved' 
            ? 'Are you sure you want to approve this claim? This will automatically reject all other claims.'
            : 'Are you sure you want to reject this claim?';
    
        if (window.confirm(message)) {
            handleClaimStatusUpdate(claimId, newStatus);
        }
    };

    const handleDeleteItem = async () => {
        if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/lostfound/${itemId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete item');
                }
    
                alert('Item deleted successfully');
                navigate('/lost-found'); // Navigate back to the list
    
            } catch (error) {
                console.error('Error deleting item:', error);
                alert(error.message || 'Failed to delete item');
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Loading item details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={() => navigate('/lost-found')}>Back to List</button>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="error-container">
                <p>Item not found</p>
                <button onClick={() => navigate('/lost-found')}>Back to List</button>
            </div>
        );
    }

    return (
        <div className="item-detail-page">
            <button className="back-button" onClick={() => navigate('/lost-found')}>
                <i className="fas fa-arrow-left"></i> Back to List
            </button>

            <div className="item-detail-container">
                <div className="item-main-content">
                    <div className="item-images">
                        {item.images && item.images.length > 0 ? (
                            <img 
                                src={`http://localhost:5000${item.images[0]}`}
                                alt={item.title}
                                className="main-image"
                                onError={(e) => {
                                    e.target.src = '/placeholder.jpg';
                                }}
                            />
                        ) : (
                            <div className="no-image">No image available</div>
                        )}
                    </div>

                    <div className="item-info">
                        <div className="status-type-section">
                            <div className={`status-badge ${item.type}`}>
                                {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
                            </div>
                            <div className={`status-badge status-${item.status}`}>
                                Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </div>
                            <button 
                                className="update-status-btn"
                                onClick={() => setIsStatusModalOpen(true)}
                            >
                                Update Status
                            </button>
                            <button 
                                className="delete-btn"
                                onClick={handleDeleteItem}
                            >
                                <i className="fas fa-trash"></i> Delete Item
                            </button>
                        </div>

                        <h1>{item.title}</h1>
                        <p className="description">{item.description}</p>

                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="label">Category:</span>
                                <span className="value">{item.category}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Location:</span>
                                <span className="value">{item.location}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Date:</span>
                                <span className="value">
                                    {new Date(item.date).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Status:</span>
                                <span className="value">{item.status}</span>
                            </div>
                        </div>

                        <div className="contact-info">
                            <h3>Contact Information</h3>
                            <p><i className="fas fa-envelope"></i> {item.contactInfo.email}</p>
                            <p><i className="fas fa-phone"></i> {item.contactInfo.phone}</p>
                        </div>

                        {item.type === 'found' && item.status === 'open' && (
                            <button 
                                className="claim-btn"
                                onClick={() => setIsClaimModalOpen(true)}
                            >
                                Claim This Item
                            </button>
                        )}
                    </div>
                </div>

                {/* Claims Section */}
                {item.type === 'found' && (
                    <div className="claims-container">
                        <div className="claims-header-toggle" onClick={() => setIsClaimsExpanded(!isClaimsExpanded)}>
                            <div className="header-left">
                                <h2>Claims Information</h2>
                                <span className="claims-badge">{claims.length}</span>
                            </div>
                            <button className={`toggle-button ${isClaimsExpanded ? 'expanded' : ''}`}>
                                <i className={`fas fa-chevron-${isClaimsExpanded ? 'up' : 'down'}`}></i>
                            </button>
                        </div>

                        <div className={`claims-collapsible ${isClaimsExpanded ? 'expanded' : ''}`}>
                            <div className="claims-summary">
                                <div className="claims-count">
                                    <i className="fas fa-file-alt"></i>
                                    <span>Total Claims: {claims.length}</span>
                                </div>
                                {item.reporter && (
                                    <div className="item-reporter">
                                        <i className="fas fa-user"></i>
                                        <span>Reported by: {item.reporter.fullName}</span>
                                    </div>
                                )}
                            </div>
                            
                            {claimsLoading ? (
                                <div className="claims-loading">
                                    <div className="loader"></div>
                                    <p>Loading claims...</p>
                                </div>
                            ) : claimsError ? (
                                <div className="claims-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <p>Error loading claims: {claimsError}</p>
                                </div>
                            ) : claims && claims.length > 0 ? (
                                <div className="claims-section">
                                    <div className="claims-list">
                                        {claims.map((claim) => (
                                            <div key={claim.id} className="claim-card">
                                                <div className="claim-header">
                                                    <div className="claim-status-section">
                                                        <span className={`claim-status status-${claim.status.toLowerCase()}`}>
                                                            <i className={`fas ${
                                                                claim.status === 'approved' ? 'fa-check-circle' :
                                                                claim.status === 'pending' ? 'fa-clock' :
                                                                'fa-times-circle'
                                                            }`}></i>
                                                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div className="claim-date-section">
                                                        <span className="claim-date">
                                                            <i className="far fa-calendar-alt"></i>
                                                            Submitted on: {new Date(claim.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="claim-content">
                                                    <div className="claim-user-info">
                                                        <div className="user-details">
                                                            <i className="fas fa-user-circle"></i>
                                                            <div className="user-text">
                                                                <h4>{claim.user?.fullName || 'Anonymous User'}</h4>
                                                                <span className="user-id">ID: {claim.user?._id}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="claim-message">
                                                        <h4>Claim Description:</h4>
                                                        <p>{claim.message}</p>
                                                    </div>

                                                    {claim.proofImage && (
                                                        <div className="claim-proof">
                                                            <h4>Proof of Ownership:</h4>
                                                            <div className="proof-image-container">
                                                                <img 
                                                                    src={`http://localhost:5000${claim.proofImage}`}
                                                                    alt="Proof of ownership"
                                                                    onClick={() => window.open(`http://localhost:5000${claim.proofImage}`, '_blank')}
                                                                    onError={(e) => {
                                                                        e.target.src = '/placeholder.jpg';
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="claim-footer">
                                                    <div className="claim-actions">
                                                        {claim.status === 'pending' && (
                                                            <>
                                                                <button 
                                                                    className="btn-approve"
                                                                    onClick={() => handleClaimStatusUpdate(claim.id, 'approved')}
                                                                >
                                                                    <i className="fas fa-check"></i> Approve
                                                                </button>
                                                                <button 
                                                                    className="btn-reject"
                                                                    onClick={() => handleClaimStatusUpdate(claim._id, 'rejected')}
                                                                >
                                                                    <i className="fas fa-times"></i> Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {claim.status !== 'pending' && (
                                                            <span className={`claim-status-label status-${claim.status}`}>
                                                                {claim.status === 'approved' ? (
                                                                    <><i className="fas fa-check-circle"></i> Approved</>
                                                                ) : (
                                                                    <><i className="fas fa-times-circle"></i> Rejected</>
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="no-claims">
                                    <i className="fas fa-inbox"></i>
                                    <p>No claims have been submitted yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Related Items Section */}
                {relatedItems && relatedItems.length > 0 && (
                    <div className="related-items-section">
                        <h2>Related Items</h2>
                        <div className="related-items-grid">
                            {relatedItems.map((relatedItem, index) => (
                                <div 
                                    key={relatedItem._id || index}
                                    className="related-item-card"
                                    onClick={() => {
                                        navigate(`/lost-found/${relatedItem.id}`);
                                        window.scrollTo(0, 0);
                                    }}
                                >
                                    {relatedItem.images && relatedItem.images.length > 0 && (
                                        <div className="related-item-image">
                                            <img 
                                                src={`http://localhost:5000${relatedItem.images[0].path}`}
                                                alt={relatedItem.title}
                                                onError={(e) => {
                                                    e.target.src = '/placeholder.jpg';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="related-item-info">
                                        <div className={`related-item-type ${relatedItem.type}`}>
                                            {relatedItem.type}
                                        </div>
                                        <h3>{relatedItem.title}</h3>
                                        <p>{relatedItem.description}</p>
                                        <div className="related-item-details">
                                            <span>
                                                <i className="fas fa-tag"></i> 
                                                {relatedItem.category}
                                            </span>
                                            <span>
                                                <i className="fas fa-map-marker-alt"></i> 
                                                {relatedItem.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modals */}
                <ClaimModal
                    isOpen={isClaimModalOpen}
                    onClose={() => setIsClaimModalOpen(false)}
                    onSubmit={handleClaimSubmit}
                    claimDescription={claimDescription}
                    setClaimDescription={setClaimDescription}
                />

                <StatusModal
                    isOpen={isStatusModalOpen}
                    onClose={() => setIsStatusModalOpen(false)}
                    onSubmit={handleStatusUpdate}
                    currentStatus={newStatus}
                    setNewStatus={setNewStatus}
                />
            </div>
        </div>
    );
};

export default ItemDetail;