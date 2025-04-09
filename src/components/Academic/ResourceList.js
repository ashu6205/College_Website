// src/components/Academic/ResourceList.js
import React from 'react';
import './ResourceList.css';

const ResourceList = ({ resources, isAdmin }) => {
    const getResourceTypeStyle = (type) => {
        const styles = {
            notes: { background: '#dbeafe', color: '#1d4ed8' },
            slides: { background: '#d1fae5', color: '#047857' },
            assignment: { background: '#fef3c7', color: '#b45309' },
            announcement: { background: '#fee2e2', color: '#b91c1c' }
        };
        return styles[type] || { background: '#f3f4f6', color: '#374151' };
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="resource-list">
            {resources.map(resource => (
                <div key={resource._id} className={`resource-card ${resource.type}`}>
                    <div className="resource-header">
                        <div className="resource-title-section">
                            <h3>{resource.title}</h3>
                            <span 
                                className="resource-type-badge"
                                style={getResourceTypeStyle(resource.type)}
                            >
                                {resource.type}
                            </span>
                        </div>
                        {isAdmin && (
                            <div className="resource-actions">
                                <button className="edit-btn">
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button className="delete-btn">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="resource-subject">
                        <span className="subject-code">{resource.subject.code}</span>
                        <span className="subject-name">{resource.subject.name}</span>
                    </div>

                    <p className="resource-description">{resource.description}</p>

                    <div className="resource-files">
                        {resource.files && resource.files.map((file, index) => (
                            <a 
                                key={index}
                                href={`https://college-website-backend.onrender.com${file.path}`}
                                className="file-link"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <i className="fas fa-file-download"></i>
                                <span className="file-name">{file.originalName}</span>
                            </a>
                        ))}
                    </div>

                    <div className="resource-meta">
                        <span className="upload-date">
                            Uploaded: {formatDate(resource.uploadedAt)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ResourceList;