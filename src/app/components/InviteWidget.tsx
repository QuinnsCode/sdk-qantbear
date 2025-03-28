// File: src/app/components/InviteWidget.tsx
"use client";
import { useState } from "react";
import { inviteStyles } from '../pages/game/styles'; // Update this path to where your styles.ts file is located

// Export the component directly
export const InviteWidget = () => {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState('');
  const [hoveredButton, setHoveredButton] = useState<'invite' | 'send' | 'cancel' | null>(null);

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
      {showInvite && (
        <>
          <div style={inviteStyles.modalOverlay} onClick={toggleInvite}></div>
          <div style={inviteStyles.inviteModal}>
            <h2 style={inviteStyles.inviteTitle}>Invite a Friend to Play</h2>
            <div style={inviteStyles.inviteForm}>
              <input
                type="email"
                style={inviteStyles.inviteInput}
                placeholder="Enter friend's email"
                value={inviteEmail}
                onChange={handleEmailChange}
              />
              <div style={inviteStyles.inviteActions}>
                <button 
                  style={{
                    ...inviteStyles.cancelButton,
                    ...(hoveredButton === 'cancel' ? inviteStyles.cancelButtonHover : {})
                  }} 
                  onClick={toggleInvite}
                  onMouseEnter={() => setHoveredButton('cancel')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  Cancel
                </button>
                <button 
                  style={{
                    ...inviteStyles.sendButton,
                    ...(hoveredButton === 'send' ? inviteStyles.sendButtonHover : {})
                  }} 
                  onClick={sendInvite}
                  onMouseEnter={() => setHoveredButton('send')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  Send Invite
                </button>
              </div>
              {inviteStatus && (
                <div style={{
                  ...inviteStyles.statusMessage,
                  ...(inviteStatus.includes('successfully') ? inviteStyles.success : inviteStyles.error)
                }}>
                  {inviteStatus}
                </div>
              )}
              <div style={inviteStyles.note}>
                (This will open your default email application)
              </div>
            </div>
          </div>
        </>
      )}
      
      <div style={inviteStyles.inviteContainer}>
        <button 
          style={{
            ...inviteStyles.inviteButton,
            ...(hoveredButton === 'invite' ? inviteStyles.inviteButtonHover : {})
          }} 
          onClick={toggleInvite}
          onMouseEnter={() => setHoveredButton('invite')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          Invite a Friend
        </button>
      </div>
    </>
  );
}