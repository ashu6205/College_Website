// ShareResourceModal.js
import React, { useState } from 'react';
import './ShareResourceModal.css';

const ShareResourceModal = ({ show, onClose, groupId, onResourceShared }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: 'notes',
        description: '',
        subject: {
            name: '',
            code: ''
        }
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setLoading(true);

    //     try {
    //         const formDataToSend = new FormData();
    //         formDataToSend.append('title', formData.title);
    //         formDataToSend.append('type', formData.type);
    //         formDataToSend.append('description', formData.description);
            
    //         // Send subject as a JSON string
    //         formDataToSend.append('subject', JSON.stringify({
    //             name: formData.subject.name,
    //             code: formData.subject.code
    //         }));
            
    //         // Use academicGroupId instead of groupId
    //         formDataToSend.append('academicGroupId', groupId);

    //         // Append each file to form data
    //         for (let file of files) {
    //             formDataToSend.append('files', file);
    //         }

    //         const response = await fetch(`https://college-website-backend.onrender.com/api/academic/resources`, {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': `Bearer ${localStorage.getItem('token')}`,
    //             },
    //             body: formDataToSend
    //         });

    //         const data = await response.json();
            
    //         if (!response.ok) {
    //             throw new Error(data.message || 'Failed to upload resource');
    //         }

    //         onResourceShared(data);
    //         onClose();
            
    //         // Clear form
    //         setFormData({
    //             title: '',
    //             type: 'notes',
    //             description: '',
    //             subject: {
    //                 name: '',
    //                 code: ''
    //             }
    //         });
    //         setFiles([]);
            
    //     } catch (error) {
    //         console.error('Error sharing resource:', error);
    //         alert(error.message || 'Failed to share resource');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // ShareResourceModal.js
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const token = localStorage.getItem('token');
        console.log('Sending request with token:', token);

        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('type', formData.type);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('subject', JSON.stringify({
            name: formData.subject.name,
            code: formData.subject.code
        }));
        formDataToSend.append('academicGroupId', groupId);

        for (let file of files) {
            formDataToSend.append('files', file);
        }

        const response = await fetch(`https://college-website-backend.onrender.com/api/academic/resources`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formDataToSend
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Upload failed:', data);
            throw new Error(data.message || 'Failed to upload resource');
        }

        onResourceShared(data);
        onClose();
    } catch (error) {
        console.error('Error sharing resource:', error);
        alert(error.message || 'Failed to share resource');
    } finally {
        setLoading(false);
    }
};
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Share Resource</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title*</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Type*</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            required
                        >
                            <option value="notes">Notes</option>
                            <option value="slides">Slides</option>
                            <option value="assignment">Assignment</option>
                            <option value="announcement">Announcement</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label>Subject Name</label>
                        <input
                            type="text"
                            value={formData.subject.name}
                            onChange={(e) => setFormData({
                                ...formData,
                                subject: {...formData.subject, name: e.target.value}
                            })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Subject Code</label>
                        <input
                            type="text"
                            value={formData.subject.code}
                            onChange={(e) => setFormData({
                                ...formData,
                                subject: {...formData.subject, code: e.target.value}
                            })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Files* (Max 5 files)</label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setFiles(Array.from(e.target.files))}
                            className="file-input"
                            required
                        />
                        <small className="file-hint">Selected files: {files.length}</small>
                    </div>

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={loading}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="submit-btn"
                        >
                            {loading ? 'Uploading...' : 'Share Resource'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShareResourceModal;