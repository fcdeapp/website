"use client";

import React from 'react';

type LoginDecisionOverlayProps = {
  visible: boolean;
  onLogin: () => void;
  onBrowse: () => void;
};

const LoginDecisionOverlay: React.FC<LoginDecisionOverlayProps> = ({ visible, onLogin, onBrowse }) => {
  if (!visible) return null;

  const overlayContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const gradientBackgroundStyle: React.CSSProperties = {
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(45deg, rgba(0, 0, 0, 0.7), rgba(50, 50, 50, 0.7))',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  // 웹에서는 BlurView 대신 CSS backdrop-filter로 블러 효과를 줄 수 있습니다.
  const blurContainerStyle: React.CSSProperties = {
    width: '90%',
    maxWidth: '500px',
    borderRadius: '30px',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: '30px',
    padding: '30px 25px',
    textAlign: 'center' as const,
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 800,
    color: '#120C3A',
    marginBottom: '15px',
  };

  const messageStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#333',
    marginBottom: '30px',
    lineHeight: '24px',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
  };

  const actionButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    padding: '12px 20px',
    border: '2px solid #120C3A',
    borderRadius: '30px',
    cursor: 'pointer',
  };

  const guestButtonStyle: React.CSSProperties = {
    ...actionButtonStyle,
    borderColor: '#355C7D',
  };

  const actionButtonTextStyle: React.CSSProperties = {
    color: '#120C3A',
    fontSize: '16px',
    fontWeight: 700,
    margin: 0,
  };

  return (
    <div style={overlayContainerStyle}>
      <div style={gradientBackgroundStyle}>
        <div style={blurContainerStyle}>
          <div style={cardStyle}>
            <h2 style={titleStyle}>Welcome to Abrody</h2>
            <p style={messageStyle}>
              To see announcements and recommendations, please log in.
            </p>
            <div style={buttonContainerStyle}>
              <button style={actionButtonStyle} onClick={onLogin}>
                <span style={actionButtonTextStyle}>Log In</span>
              </button>
              <button style={guestButtonStyle} onClick={onBrowse}>
                <span style={actionButtonTextStyle}>Continue as Guest</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginDecisionOverlay;
