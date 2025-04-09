// src/components/Academic/GroupDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AddStudentsModal from './AddStudentsModal';
import './GroupDetailPage.css';
import CreateGroupModal from './CreateGroupModal';
import ShareResourceModal from './ShareResourceModal';

const GroupDetailPage = () => {
    const { groupId } = useParams();
    const [resources, setResources] = useState([]);
    const [groupDetails, setGroupDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
 

     
    const [showShareResourceModal, setShowShareResourceModal] = useState(false);

    const resourceTypes = ['all', 'notes', 'slides', 'assignment', 'announcement'];
    // In GroupDetailPage.js
    const handleResourceShared = async (data) => {
        if (data.success) {
            await fetchGroupResources(); // Refresh the resources list
            setShowShareResourceModal(false);
            // Optional: Show success message
            alert('Resource shared successfully!');
        }
    };
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role === 'admin') {
            setIsAdmin(true);
        }
        fetchGroupDetails();
        fetchGroupResources();
    }, [groupId]);

    const fetchGroupDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://college-website-backend.onrender.com/api/academic/groups/${groupId}`, {
                headers: {
                    'Authorization': token,
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch group details');
            const data = await response.json();
            console.log('Group details:', data);
            if (data.success && data.group) {
                setGroupDetails(data.group);
                determineUserRole(data.group);
            }
        } catch (err) {
            console.error('Error fetching group details:', err);
            setError(err.message);
        }
    };

    const determineUserRole = (group) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user._id) return;

            console.log('Checking role for user:', user._id);
            console.log('Group faculty:', group.faculty);
            console.log('Group CRs:', group.classRepresentatives);

            if (group.faculty.includes(user._id)) {
                console.log('User is faculty');
                setUserRole('faculty');
            } else if (group.classRepresentatives.includes(user._id)) {
                console.log('User is CR');
                setUserRole('cr');
            } else if (group.students.includes(user._id)) {
                console.log('User is student');
                setUserRole('student');
            } else {
                console.log('User role not determined');
                setUserRole(null);
            }
        } catch (err) {
            console.error('Error determining user role:', err);
        }
    };

    const fetchGroupResources = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://college-website-backend.onrender.com/api/academic/groups/${groupId}/resources`, {
                headers: {
                    'Authorization': token,
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch resources');
            const data = await response.json();
            if (data.success && data.resources) {
                setResources(data.resources);
            }
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleAddStudentsSuccess = async (data) => {
        await fetchGroupDetails(); // Refresh group details
        setShowAddStudentsModal(false);
        alert(data.message);
    };

    const canAddStudents = isAdmin || userRole === 'faculty' || userRole === 'cr';

    const filteredResources = activeTab === 'all' 
        ? resources 
        : resources.filter(resource => resource.type === activeTab);

    const getResourceTypeCount = (type) => {
        return resources.filter(resource => resource.type === type).length;
    };

    if (loading) return <div className="loading">Loading group details...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="group-detail-page">
            {groupDetails && (
                <div className="group-info">
                    <div className="group-header">
                        <div className="group-title">
                            <h2>{groupDetails.department} - {groupDetails.batchYear}</h2>
                            <span className="semester-badge">Semester {groupDetails.semester}</span>
                        </div>
                        {canAddStudents && (
                            <button 
                                className="add-students-btn"
                                onClick={() => setShowAddStudentsModal(true)}
                            >
                                Add Students
                            </button>
                        )}
                        {(isAdmin || userRole === 'faculty' || userRole === 'cr') && (
                            <button 
                                className="share-resource-btn"
                                onClick={() => setShowShareResourceModal(true)}
                            >
                                Share Resource
                            </button>
                        )}
                    </div>

                    <div className="group-stats">
                        <div className="stat-item">
                            <span className="stat-value">{groupDetails.students?.length || 0}</span>
                            <span className="stat-label">Students</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{resources.length}</span>
                            <span className="stat-label">Resources</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{groupDetails.faculty?.length || 0}</span>
                            <span className="stat-label">Faculty</span>
                        </div>
                    </div>
 
                </div>
            )}

            <div className="resources-section">
                <div className="resources-header">
                    <h2>Resources</h2>
                    <div className="resource-type-tabs">
                        {resourceTypes.map(type => (
                            <button
                                key={type}
                                className={`type-tab ${activeTab === type ? 'active' : ''}`}
                                onClick={() => setActiveTab(type)}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                <span className="count">
                                    {type === 'all' ? resources.length : getResourceTypeCount(type)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="resources-grid">
                    {filteredResources.map(resource => (
                        <div key={resource._id} className={`resource-card ${resource.type}`}>
                            <div className="resource-header">
                                <span className={`resource-type-badge ${resource.type}`}>
                                    {resource.type}
                                </span>
                                <h3>{resource.title}</h3>
                            </div>
                            <p className="resource-description">{resource.description}</p>
                            {resource.subject && (
                                <div className="resource-meta">
                                    <span className="subject-code">{resource.subject.code}</span>
                                    <span className="subject-name">{resource.subject.name}</span>
                                </div>
                            )}
                            <div className="resource-files">
                                {resource.files && resource.files.map((file, index) => (
                                    <a 
                                        key={index}
                                        href={`https://college-website-backend.onrender.com${file.path}`}
                                        className="file-download"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i className="fas fa-download"></i>
                                        {file.originalName}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {showShareResourceModal && (
                <ShareResourceModal
                    show={showShareResourceModal}
                    onClose={() => setShowShareResourceModal(false)}
                    groupId={groupId}
                    onResourceShared={handleResourceShared}
                />
            )}
            {showAddStudentsModal && (
                <AddStudentsModal
                    groupId={groupId}
                    onClose={() => setShowAddStudentsModal(false)}
                    onSuccess={handleAddStudentsSuccess}
                />
            )}
        </div>
    );
};

export default GroupDetailPage;