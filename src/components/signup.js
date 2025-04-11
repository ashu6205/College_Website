import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    department: '',
    batch: '',
  });

  const [isFaculty, setIsFaculty] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setError('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleUserType = () => {
    setIsFaculty(!isFaculty);
    // Reset department and batch when switching to faculty
    if (!isFaculty) {
      setFormData((prev) => ({ ...prev, department: '', batch: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare payload based on role
      const payload = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        department: isFaculty ? undefined : formData.department,
        batch: isFaculty ? undefined : formData.batch,
      };

      const response = await fetch('https://college-website-backend.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Signup response:', data);

      if (response.ok) {
        alert('Registration successful! Please log in.');
        navigate('/login');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Create Account</h2>
        <p className="subtitle">Sign up to get started</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <button type="button" className="toggle-role-button" onClick={handleToggleUserType}>
            {isFaculty ? 'Switch to Student Signup' : 'Sign Up as Faculty'}
          </button>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your IIITG email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
              <button type="button" onClick={togglePasswordVisibility}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          {!isFaculty && (
            <>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Enter your department"
                  required
                />
              </div>

              <div className="form-group">
                <label>Batch</label>
                <input
                  type="text"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  placeholder="Enter your batch (e.g., 2023)"
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className={`signup-button ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="login-link">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="link">
            Log in
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
