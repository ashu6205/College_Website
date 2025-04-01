import React from 'react';
import './ItemDetailModals.css';

// In ItemDetailModals.js

export const ClaimModal = ({ isOpen, onClose, onSubmit, claimDescription, setClaimDescription }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Claim Item</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="message">Description of Ownership:</label>
                        <textarea
                            id="message"
                            name="message"
                            value={claimDescription}
                            onChange={(e) => setClaimDescription(e.target.value)}
                            placeholder="Please provide details to prove your ownership..."
                            required
                            className="claim-textarea"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="proofImage">Proof of Ownership (Optional):</label>
                        <input
                            type="file"
                            id="proofImage"
                            name="proofImage"
                            accept="image/*"
                            className="file-input"
                        />
                        <small className="file-hint">
                            Supported formats: JPG, PNG (Max size: 5MB)
                        </small>
                    </div>
                    <div className="modal-buttons">
                        <button 
                            type="button" 
                            className="btn-cancel" 
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={!claimDescription.trim()}
                        >
                            Submit Claim
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const StatusModal = ({ isOpen, onClose, onSubmit, currentStatus, setNewStatus }) => {
    if (!isOpen) return null;

    const statusOptions = ['open', 'claimed', 'resolved', 'closed'];

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Update Status</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Select New Status:</label>
                        <select
                            value={currentStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            required
                        >
                            {statusOptions.map(status => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="modal-buttons">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit">Update Status</button>
                    </div>
                </form>
            </div>
        </div>
    );
};