// src/components/Academic/AcademicDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateGroupModal from './CreateGroupModal';
import './AcademicDashboard.css';

const AcademicDashboard = ({ isAdmin }) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAllGroups, setShowAllGroups] = useState(false);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [filters, setFilters] = useState({
        semester: 'all',
        department: 'all'
    });
    const navigate = useNavigate();

    // First, define the base groups
    const baseGroups = showAllGroups ? groups : groups.filter(group => group.isMember);

    // Then get unique departments and semesters
    const departments = ['all', ...new Set(groups.map(group => group.department))];
    const semesters = ['all', ...new Set(groups.map(group => group.semester))].sort((a, b) => a - b);

    // Then apply filters
    const filteredGroups = baseGroups.filter(group => {
        const matchesSemester = filters.semester === 'all' || group.semester.toString() === filters.semester;
        const matchesDepartment = filters.department === 'all' || group.department === filters.department;
        return matchesSemester && matchesDepartment;
    });

    const fetchGroups = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/academic/groups', {
                headers: {
                    'Authorization': token,
                }
            });

            if (!response.ok) throw new Error('Failed to fetch groups');
            const data = await response.json();
            setGroups(data.groups);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching groups:', err);
            setError(err.message);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const handleCreateGroupSuccess = async (data) => {
        await fetchGroups();
        setShowCreateGroupModal(false);
        alert('Group created successfully!');
    };

    const handleGroupClick = async (group) => {
        if (!group.isMember) {
            alert('You are not a member of this group');
            return;
        }
        navigate(`/academics/group/${group._id}`);
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };


    const renderGroupCard = (group) => (
    <div 
        key={group._id} 
        className={`group-card ${!group.isMember ? 'non-member' : ''}`}
        onClick={() => handleGroupClick(group)}
    >
        <div className="card-header">
            <div className="course-info">
                <div className="course-code">{group.courseCode}</div>
                <div className="course-title">{group.courseTitle}</div>
            </div>
            <div className="batch-info">
                <span className="batch-year">Batch {group.batchYear}</span>
                <span className="semester-badge">Semester {group.semester}</span>
            </div>
        </div>
        
        <div className="department-section">
            <span className="department-badge">{group.department}</span>
        </div>

        <div className="faculty-section">
            <div className="section-label">Faculty:</div>
            {group.faculty && group.faculty.length > 0 ? (
                <div className="faculty-list">
                    {group.faculty.map((faculty, index) => (
                        <div key={index} className="faculty-item">
                            {typeof faculty === 'object' ? (
                                <div className="faculty-info">
                                    <span className="faculty-name">{faculty.fullName}</span>
                                    <span className="faculty-email">{faculty.email}</span>
                                </div>
                            ) : (
                                <div className="faculty-info">Faculty ID: {faculty}</div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-faculty">No faculty assigned</div>
            )}
        </div>

        {!group.isMember && (
            <div className="non-member-badge">
                Not a member
            </div>
        )}
    </div>
);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="academic-dashboard">
            <div className="dashboard-top">
            <h1>Academic Groups</h1>
            {isAdmin && (
                <button 
                    className="create-group-btn"
                    onClick={() => setShowCreateGroupModal(true)}
                >
                    Create New Group
                </button>
            )}
        </div>

        <div className="dashboard-controls">
            <div className="filter-section">
                <div className="filter-group">
                    <label>Department:</label>
                    <select
                        value={filters.department}
                        onChange={(e) => handleFilterChange('department', e.target.value)}
                        className="filter-select"
                    >
                        {departments.map(dept => (
                            <option key={dept} value={dept}>
                                {dept === 'all' ? 'All Departments' : dept}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Semester:</label>
                    <select
                        value={filters.semester}
                        onChange={(e) => handleFilterChange('semester', e.target.value)}
                        className="filter-select"
                    >
                        {semesters.map(sem => (
                            <option key={sem} value={sem}>
                                {sem === 'all' ? 'All Semesters' : `Semester ${sem}`}
                            </option>
                        ))}
                    </select>
                </div>
                <button 
                    className="toggle-groups-btn"
                    onClick={() => setShowAllGroups(!showAllGroups)}
                >
                    {showAllGroups ? 'Show My Groups' : 'Show All Groups'}
                </button>
            </div>
        </div>

            {filteredGroups.length > 0 ? (
                <div className="groups-grid">
                    {filteredGroups.map(renderGroupCard)}
                </div>
            ) : (
                <div className="no-results">
                    No groups found matching the selected filters
                </div>
            )}

            {showCreateGroupModal && (
                <CreateGroupModal
                    onClose={() => setShowCreateGroupModal(false)}
                    onSuccess={handleCreateGroupSuccess}
                />
            )}
        </div>
    );
};

export default AcademicDashboard;