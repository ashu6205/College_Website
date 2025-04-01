// src/components/Academic/CreateGroupModal.js
import React, { useState, useEffect } from 'react';
import './CreateGroupModal.css';

const CreateGroupModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        batchYear: new Date().getFullYear().toString(),
        department: 'CSE',
        semester: 1,
        courseCode: '',
        courseTitle: '',
        faculty: [],
        classRepresentatives: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [facultyList, setFacultyList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [searchTerm, setSearchTerm] = useState({ faculty: '', cr: '' });
    const [selectedFaculty, setSelectedFaculty] = useState([]);
    const [selectedCRs, setSelectedCRs] = useState([]);

    const departments = [
        { value: 'CSE', label: 'Computer Science & Engineering' },
        { value: 'ECE', label: 'Electronics & Communication Engineering' },
        { value: 'HSS', label: 'Humanities & Social Sciences' },
        { value: 'MATH', label: 'Mathematics' },
        { value: 'DS', label: 'Data Science' }
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Fetching users with token:', token); // Debug log
    
            const response = await fetch('http://localhost:5000/api/auth/users', {
                headers: {
                    'Authorization': `Bearer ${token}` // Make sure to add 'Bearer' if required
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
    
            const data = await response.json();
            console.log('Fetched users data:', data); // Debug log
    
            if (data.success) {
                // Filter users based on role
                const facultyMembers = data.users.filter(user => user.role === 'faculty');
                const students = data.users.filter(user => user.role === 'student');
                
                console.log('Faculty members:', facultyMembers); // Debug log
                console.log('Students:', students); // Debug log
    
                setFacultyList(facultyMembers);
                setStudentList(students);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users');
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (selectedFaculty.length === 0) {
            setError('Please select at least one faculty member');
            setLoading(false);
            return;
        }

        try {
            const submitData = {
                ...formData,
                faculty: selectedFaculty.map(f => f._id),
                classRepresentatives: selectedCRs.map(cr => cr._id)
            };

            console.log('Submitting data:', submitData);

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/academic/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(submitData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create group');
            }

            console.log('Group created successfully:', data);
            onSuccess(data);
            onClose();
        } catch (err) {
            console.error('Error creating group:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'semester' ? parseInt(value) : value
        }));
    };

    const handleUserSelection = (type, user) => {
        console.log(`Selecting ${type}:`, user);
        if (type === 'faculty') {
            setSelectedFaculty(prev => {
                const isSelected = prev.some(f => f._id === user._id);
                if (isSelected) {
                    return prev.filter(f => f._id !== user._id);
                }
                return [...prev, user];
            });
        } else {
            setSelectedCRs(prev => {
                const isSelected = prev.some(cr => cr._id === user._id);
                if (isSelected) {
                    return prev.filter(cr => cr._id !== user._id);
                }
                return [...prev, user];
            });
        }
    };

    const removeUser = (type, userId) => {
        if (type === 'faculty') {
            setSelectedFaculty(prev => prev.filter(f => f._id !== userId));
        } else {
            setSelectedCRs(prev => prev.filter(cr => cr._id !== userId));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Academic Group</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="courseCode">Course Code*</label>
                        <input
                            type="text"
                            id="courseCode"
                            name="courseCode"
                            value={formData.courseCode}
                            onChange={handleChange}
                            placeholder="e.g., CS101"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="courseTitle">Course Title*</label>
                        <input
                            type="text"
                            id="courseTitle"
                            name="courseTitle"
                            value={formData.courseTitle}
                            onChange={handleChange}
                            placeholder="e.g., Introduction to Programming"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="department">Department*</label>
                        <select
                            id="department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        >
                            {departments.map(dept => (
                                <option key={dept.value} value={dept.value}>
                                    {dept.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="semester">Semester*</label>
                        <select
                            id="semester"
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            required
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                <option key={num} value={num}>Semester {num}</option>
                            ))}
                        </select>
                    </div>

 
                    <div className="form-group">
                        <label>Faculty Members*</label>
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search faculty by email..."
                                value={searchTerm.faculty}
                                onChange={(e) => setSearchTerm({ ...searchTerm, faculty: e.target.value })}
                            />
                        </div>
                        
                        {/* Display selected faculty */}
                        <div className="selected-users">
                            {selectedFaculty.map(faculty => (
                                <div key={faculty._id} className="selected-user-tag">
                                    <span>{faculty.email}</span>
                                    <button 
                                        type="button" 
                                        className="remove-button"
                                        onClick={() => removeUser('faculty', faculty._id)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Display faculty list */}
                        <div className="user-list">
                            {facultyList.length === 0 ? (
                                <div className="no-results">No faculty members found</div>
                            ) : (
                                facultyList
                                    .filter(faculty => 
                                        !selectedFaculty.some(f => f._id === faculty._id) &&
                                        faculty.email.toLowerCase().includes(searchTerm.faculty.toLowerCase())
                                    )
                                    .map(faculty => (
                                        <div 
                                            key={faculty._id} 
                                            className="user-item"
                                            onClick={() => handleUserSelection('faculty', faculty)}
                                        >
                                            <div className="user-info">
                                                <span className="user-email">{faculty.email}</span>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>

<div className="form-group">
    <label>Class Representatives</label>
    <div className="search-box">
        <input
            type="text"
            placeholder="Search students by email..."
            value={searchTerm.cr}
            onChange={(e) => setSearchTerm({ ...searchTerm, cr: e.target.value })}
        />
    </div>

    {/* Display selected CRs */}
    <div className="selected-users">
        {selectedCRs.map(cr => (
            <div key={cr._id} className="selected-user-tag">
                <span>{cr.email}</span>
                <button 
                    type="button" 
                    className="remove-button"
                    onClick={() => removeUser('cr', cr._id)}
                >
                    ×
                </button>
            </div>
        ))}
    </div>

    {/* Display student list */}
    <div className="user-list">
        {studentList.length === 0 ? (
            <div className="no-results">No students found</div>
        ) : (
            studentList
                .filter(student => 
                    !selectedCRs.some(cr => cr._id === student._id) &&
                    student.email.toLowerCase().includes(searchTerm.cr.toLowerCase())
                )
                .map(student => (
                    <div 
                        key={student._id} 
                        className="user-item"
                        onClick={() => handleUserSelection('cr', student)}
                    >
                        <div className="user-info">
                            <span className="user-email">{student.email}</span>
                        </div>
                    </div>
                ))
        )}
    </div>
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
                            {loading ? 'Creating...' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;