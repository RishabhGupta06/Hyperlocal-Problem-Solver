'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, setCurrentUserId, createUser } from '../lib/store';

export default function LoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isSignUp, setIsSignUp] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const handleLogin = (userId) => {
    setCurrentUserId(userId);
    router.push('/');
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    
    const newUser = createUser(newUserName.trim());
    setCurrentUserId(newUser.id);
    router.push('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg-secondary)',
    }}>
      <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '40px 32px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏛️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            Welcome to <span className="text-gradient">Community Hero</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {isSignUp ? 'Create a profile to get started' : 'Select a profile to continue'}
          </p>
        </div>

        {isSignUp ? (
          <form onSubmit={handleSignUp} className="animate-fade-in">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                autoFocus
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '8px' }}
              disabled={!newUserName.trim()}
            >
              Join the Community
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button 
                type="button" 
                className="btn-ghost"
                onClick={() => setIsSignUp(false)}
                style={{ fontSize: '13px' }}
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '360px', overflowY: 'auto', paddingRight: '8px', marginBottom: '24px' }}>
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleLogin(user.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-blue)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '24px' }}>{user.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      Level: <span style={{ color: 'var(--accent-blue)' }}>{user.level}</span> • {user.xp} XP
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>New to the neighborhood?</p>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setIsSignUp(true)}
                style={{ width: '100%', padding: '12px', fontSize: '14px' }}
              >
                Create new profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
