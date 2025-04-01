// src/components/Academic/AddStudentsModal.js
import React, { useState } from 'react';
import './AddStudentsModal.css';

const AddStudentsModal = ({ groupId, onClose, onSuccess }) => {
    const [emails, setEmails] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Split emails by commas and clean them
            const emailList = emails
                .split(',')
                .map(email => email.trim())
                .filter(email => email); // Remove empty strings

            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/academic/groups/${groupId}/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ students: emailList })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add students');
            }

            onSuccess(data);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Students to Group</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="emails">Student Emails</label>
                        <div className="input-help">
                            Enter student email addresses, separated by commas
                        </div>
                        <textarea
                            id="emails"
                            value={emails}
                            onChange={(e) => setEmails(e.target.value)}
                            placeholder="e.g., student1@iiitg.ac.in, student2@iiitg.ac.in"
                            rows="4"
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="cancel-btn"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Adding Students...' : 'Add Students'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStudentsModal;