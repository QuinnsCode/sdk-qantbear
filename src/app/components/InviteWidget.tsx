// File: src/app/components/InviteWidget.tsx
"use client";
import { useState } from "react";

export const InviteWidget = () => {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState('');

  // Handle invite button click
  const toggleInvite = () => {
    setShowInvite(!showInvite);
    setInviteStatus('');
  };
  
  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteEmail(e.target.value);
  };
  
  // Handle sending invitation
  const sendInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setInviteStatus('Please enter a valid email address');
      return;
    }
    
    try {
      const currentUrl = window?.location?.href;

      if (!currentUrl) {
        setInviteStatus('Failed to open email client. Please try again.');
        return;
      }
      
      // Create email content
      const subject = "Invitation to join my game";
      const body = `You are invited to join my game at:\n${currentUrl}\n\n-Ryan's RW SDK Durable Objects Realtime testing`;
      
      // Create mailto link and open it
      const mailtoLink = `mailto:${inviteEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
      
      setInviteStatus('Email client opened successfully!');
      setTimeout(() => {
        setShowInvite(false);
        setInviteEmail('');
        setInviteStatus('');
      }, 2000);
    } catch (error) {
      console.error("Error opening email client:", error);
      setInviteStatus('Failed to open email client. Please try again.');
    }
  };

  return (
    <>

    <style jsx>{`
        .invite-container {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 10;
        }
        
        .invite-button {
          padding: 8px 16px;
          font-size: 1rem;
          font-family: 'Georgia', serif;
          background-color: #8b5a2b;
          color: #f5f0e1;
          border: 2px solid #6d4c41;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .invite-button:hover {
          background-color: #a67c52;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        }
        
        .invite-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #f5f0e1;
          border: 4px solid #8b5a2b;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.3);
          z-index: 100;
          width: 90%;
          max-width: 400px;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.5);
          z-index: 90;
        }
        
        .invite-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .invite-title {
          font-family: 'Georgia', serif;
          color: #5d4037;
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 1.3rem;
        }
        
        .invite-input {
          padding: 10px;
          font-size: 1rem;
          border: 2px solid #d7b78f;
          border-radius: 4px;
          font-family: sans-serif;
        }
        
        .invite-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }
        
        .send-button {
          padding: 8px 16px;
          font-size: 1rem;
          font-family: 'Georgia', serif;
          background-color: #8b5a2b;
          color: #f5f0e1;
          border: 2px solid #6d4c41;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .send-button:hover {
          background-color: #a67c52;
        }
        
        .cancel-button {
          padding: 8px 16px;
          font-size: 1rem;
          font-family: 'Georgia', serif;
          background-color: #f5f0e1;
          color: #5d4037;
          border: 2px solid #d7b78f;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .cancel-button:hover {
          background-color: #f9f5e8;
        }
        
        .status-message {
          margin-top: 10px;
          font-family: 'Georgia', serif;
          font-size: 0.9rem;
          text-align: center;
        }
        
        .success {
          color: #2e7d32;
        }
        
        .error {
          color: #c62828;
        }
        
        .note {
          font-size: 0.8rem;
          color: #777;
          text-align: center;
          margin-top: 5px;
          font-style: italic;
        }
      `}</style>

      {showInvite && (
        <>
          <div className="modal-overlay" onClick={toggleInvite}></div>
          <div className="invite-modal">
            <h2 className="invite-title">Invite a Friend to Play</h2>
            <div className="invite-form">
              <input
                type="email"
                className="invite-input"
                placeholder="Enter friend's email"
                value={inviteEmail}
                onChange={handleEmailChange}
              />
              <div className="invite-actions">
                <button className="cancel-button" onClick={toggleInvite}>
                  Cancel
                </button>
                <button className="send-button" onClick={sendInvite}>
                  Send Invite
                </button>
              </div>
              {inviteStatus && (
                <div className={`status-message ${inviteStatus.includes('successfully') ? 'success' : 'error'}`}>
                  {inviteStatus}
                </div>
              )}
              <div className="note">
                (This will open your default email application)
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="invite-container">
        <button className="invite-button" onClick={toggleInvite}>
          Invite a Friend
        </button>
      </div>

    </>
  );
};