import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [userId, setUserId] = useState(null);
  
  const [profileData, setProfileData] = useState({ fullName: '', email: '', dob: '' });
  const [securityData, setSecurityData] = useState({ petName: '', lastFourPhone: '', currentPassword: '', newPassword: '' });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserId(user.id);
      setProfileData({
        fullName: user.name || '',
        email: user.email || '',
        dob: user.dob ? user.dob.split('T')[0] : ''
      });
    }
  }, []);


  // UPDATE PROFILE
  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/settings/update-profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Profile synchronised successfully.");
        const user = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({ ...user, name: profileData.fullName, email: profileData.email, dob: profileData.dob }));
      } else {
        alert(data.error);
      }
    } catch (err) { alert("Server connection failed."); }
  };


  // PASSWORD CHANGE
  const handlePasswordChange = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/settings/change-password/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(securityData),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Security credentials rotated successfully.");
        setSecurityData({ petName: '', lastFourPhone: '', currentPassword: '', newPassword: '' });
      } else {
        alert(data.error);
      }
    } catch (err) { alert("Security server offline."); }
  };


  // DELETE ACCOUNT
  const handleDeleteAccount = async () => {
    if (window.confirm("CRITICAL: This will purge all identity and portfolio data. Proceed?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/settings/delete-account/${userId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          alert("Account purged. Redirecting to terminal...");
          handleLogout();
        }
      } catch (err) { alert("Deletion protocol failed."); }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="page-wrapper">
      <div className="glass-pill settings-pill">
        <aside className="settings-sidebar">
          <div className="sidebar-top">
            <h2 className="sidebar-title">Command Settings</h2>
            <nav className="sidebar-nav">
              <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Account Profile</button>
              <button className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>Security Gateway</button>
              <button className={`nav-item ${activeTab === 'danger' ? 'active' : ''}`} onClick={() => setActiveTab('danger')}>Danger Zone</button>
            </nav>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>Sign Out</button>
        </aside>

        <main className="settings-content">
          {activeTab === 'profile' && (
            <section className="settings-section">
              <h3>Profile Information</h3>
              <p className="section-desc">Update your identity and contact metadata.</p>
              <div className="settings-grid">
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" value={profileData.fullName} onChange={(e) => setProfileData({...profileData, fullName: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Date of Birth</label>
                  <input type="date" value={profileData.dob} onChange={(e) => setProfileData({...profileData, dob: e.target.value})} />
                </div>
              </div>
              <button className="save-btn" onClick={handleUpdateProfile}>Save Changes</button>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="settings-section">
              <h3>Security Gateway</h3>
              <p className="section-desc">Verify identity parameters to rotate credentials.</p>
              <div className="security-verification-box">
                <div className="input-group">
                  <label>Security Question: Pet's name?</label>
                  <input type="text" value={securityData.petName} onChange={(e) => setSecurityData({...securityData, petName: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Last 4 Digits of Phone</label>
                  <input type="text" maxLength="4" value={securityData.lastFourPhone} onChange={(e) => setSecurityData({...securityData, lastFourPhone: e.target.value})} />
                </div>
              </div>
              <hr className="settings-divider" />
              <div className="settings-grid">
                <div className="input-group">
                  <label>Current Password</label>
                  <input type="password" value={securityData.currentPassword} onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>New Secure Password</label>
                  <input type="password" value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} />
                </div>
              </div>
              <button className="save-btn auth-action" onClick={handlePasswordChange}>Verify & Update Password</button>
            </section>
          )}

          {activeTab === 'danger' && (
            <section className="settings-section">
              <h3 style={{color: '#ef4444'}}>Danger Zone</h3>
              <div className="danger-box">
                <h4>Delete Account</h4>
                <p>Once you delete your account, there is no going back.</p>
                <button className="delete-btn" onClick={handleDeleteAccount}>Permanently Delete Account</button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
