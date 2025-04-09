// src/components/LostAndFound/LostAndFound.js
import React, { useState, useEffect } from 'react';
import './LostAndFound.css';
import { useNavigate } from 'react-router-dom'; 

const LostAndFound = ({ isAdmin }) => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'lost',
        category: '', // Added category field
        location: '',
        date: '',
        contactInfo: {  // Changed contact to contactInfo object
            email: '',
            phone: ''
        },
        images: []
    });

    useEffect(() => {
        fetchItems();
    }, []);


    const handleItemClick = (itemId) => {
        navigate(`/lost-found/${itemId}`);
    };

     // Add function to handle button clicks without triggering item click
     const handleButtonClick = (e, action) => {
        e.stopPropagation(); // Prevent the click from bubbling up to the card
        action();
    };


    const fetchItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://college-website-backend.onrender.com/api/lostfound', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (response.ok) {
                setItems(data.items || []);
                setError(null);
            } else {
                setError(data.message || 'Failed to fetch items');
                setItems([]);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            setError('Failed to load items');
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`https://college-website-backend.onrender.com/api/lostfound/${itemId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    setItems(items.filter(item => item._id !== itemId));
                } else {
                    throw new Error('Failed to delete item');
                }
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Failed to delete item');
            }
        }
    };

// In your LostAndFound.js component
// In your LostAndFound.js component
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        
        const requestBody = {
            type: formData.type.trim(),
            title: formData.title,
            description: formData.description,
            category: formData.category,
            location: formData.location,
            date: formData.date,
            contactInfo: {
                email: formData.contactInfo.email,
                phone: formData.contactInfo.phone,
                preferredContact: "email"
            }
        };

        // If there are images
        if (formData.images && formData.images.length > 0) {
            const formDataToSend = new FormData();
            
            Object.keys(requestBody).forEach(key => {
                if (key === 'contactInfo') {
                    formDataToSend.append(key, JSON.stringify(requestBody[key]));
                } else {
                    formDataToSend.append(key, requestBody[key]);
                }
            });

            Array.from(formData.images).forEach(image => {
                formDataToSend.append('images', image);
            });

            const response = await fetch('https://college-website-backend.onrender.com/api/lostfound', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            await handleResponse(response);
        } else {
            const response = await fetch('https://college-website-backend.onrender.com/api/lostfound', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            await handleResponse(response);
        }

    } catch (error) {
        console.error('Error creating item:', error);
        alert(error.message || 'Failed to create item');
    }
};

// Helper function to handle response
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create item');
    }

    const data = await response.json();
    setItems(prevItems => [...prevItems, data.item]);
    setShowAddModal(false);
    
    // Reset form
    setFormData({
        title: '',
        description: '',
        type: 'lost',
        category: '',
        location: '',
        date: '',
        contactInfo: {
            email: '',
            phone: ''
        },
        images: []
    });

    alert('Item reported successfully!');
};

    const handleChange = (e) => {
        const { name, type, files, value } = e.target;
        
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                images: files
            }));
            return;
        }
    
        // Handle nested objects (contactInfo)
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const filteredItems = activeFilter === 'all' 
        ? items 
        : items.filter(item => item.type === activeFilter);

    if (loading) {
        return (
            <div className="lost-found-container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="lost-found-container">
                <div className="error-message">
                    {error}
                    <button onClick={fetchItems}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="lost-found-container">
            <div className="lost-found-header">
                <h1>Lost and Found</h1>
                <button 
                    className="add-item-button"
                    onClick={() => setShowAddModal(true)}
                >
                    <i className="fas fa-plus"></i>
                    Report Item
                </button>
            </div>

            <div className="filters">
                <button 
                    className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                >
                    All Items
                </button>
                <button 
                    className={`filter-button ${activeFilter === 'lost' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('lost')}
                >
                    Lost Items
                </button>
                <button 
                    className={`filter-button ${activeFilter === 'found' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('found')}
                >
                    Found Items
                </button>
            </div>

            {filteredItems.length === 0 ? (
                <div className="no-items">
                    <i className="fas fa-search"></i>
                    <p>No items found</p>
                </div>
            ) : (
                <div className="items-grid">
                {filteredItems.map(item => (
                    <div 
                        key={item._id} 
                        className={`item-card ${item.type}`}
                        onClick={() => handleItemClick(item._id)} // Add click handler
                    >
                        <div className="item-status">
                            {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
                        </div>
                        {item.images && item.images.length > 0 && (
                            <div className="item-image">
                                <img 
                                    src={`https://college-website-backend.onrender.com${item.images[0]}`}
                                    alt={item.title}
                                    onError={(e) => {
                                        e.target.src = '/placeholder.jpg';
                                    }}
                                />
                            </div>
                        )}
                        <div className="item-content">
                            <h3>{item.title}</h3>
                            <p className="item-description">{item.description}</p>
                            <div className="item-details">
                                <span>
                                    <i className="fas fa-map-marker-alt"></i>
                                    {item.location}
                                </span>
                                <span>
                                    <i className="fas fa-calendar"></i>
                                    {new Date(item.date).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="item-actions">
                                <button 
                                    className="contact-button"
                                    onClick={(e) => handleButtonClick(e, () => {
                                        // Handle contact action
                                        console.log('Contact clicked for item:', item._id);
                                    })}
                                >
                                    <i className="fas fa-envelope"></i>
                                    Contact
                                </button>
                                {isAdmin && (
                                    <button 
                                        className="delete-button"
                                        onClick={(e) => handleButtonClick(e, () => handleDelete(item._id))}
                                    >
                                        <i className="fas fa-trash"></i>
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            )}

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Report Item</h2>
                         
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="type">Type</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="lost">Lost Item</option>
                                    <option value="found">Found Item</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="documents">Documents</option>
                                    <option value="accessories">Accessories</option>
                                    <option value="others">Others</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Item name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the item..."
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Where was it lost/found?"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="date">Date</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="contactInfo.email"
                                    value={formData.contactInfo.email}
                                    onChange={handleChange}
                                    placeholder="Your email address"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="contactInfo.phone"
                                    value={formData.contactInfo.phone}
                                    onChange={handleChange}
                                    placeholder="Your phone number"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="images">Images</label>
                                <input
                                    type="file"
                                    id="images"
                                    name="images"
                                    onChange={handleChange}
                                    accept="image/*"
                                    multiple
                                />
                            </div>

                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="cancel-button"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="submit-button">
                                    Submit Report
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LostAndFound;