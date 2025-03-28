// File: styles.ts
export const styles = {
  pageContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
    backgroundColor: "#f8f8f8",
    minHeight: "100vh",
    maxHeight: "100vh",
    overflow: "hidden"
  },
  gameInfo: {
    display: "flex",
    justifyContent: "space-between",
    width: "90vmin",
    maxWidth: "600px",
    marginBottom: "10px",
    fontFamily: "'Georgia', serif",
    color: "#5d4037"
  },
  gameTitle: {
    fontFamily: "'Georgia', serif",
    color: "#5d4037",
    marginBottom: "10px",
    textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
    fontSize: "1.5rem"
  },
  boardContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxWidth: "100%",
    margin: "0"
  },
  woodFrame: {
    width: "90vmin",
    height: "90vmin",
    maxWidth: "600px",
    maxHeight: "600px",
    padding: "12px",
    backgroundImage: "linear-gradient(30deg, #8b5a2b 0%, #a67c52 25%, #b38b60 50%, #a67c52 75%, #8b5a2b 100%)",
    boxShadow: 
      "0 8px 16px rgba(0,0,0,0.3), inset 0 0 10px rgba(0,0,0,0.4), inset 0 0 40px rgba(255,255,255,0.1)",
    border: "2px solid #6d4c41",
    borderRadius: "8px",
    position: "relative" as const
  },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(3, 1fr)",
    gap: "6px",
    width: "100%",
    height: "100%",
    padding: "6px",
    backgroundColor: "#e8d0aa",
    borderRadius: "4px"
  },
  cell: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f0e1",
    border: "2px solid #d7b78f",
    fontSize: "4rem",
    fontWeight: "bold",
    color: "#5d4037",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)"
  },
  cellHover: {
    backgroundColor: "#f9f5e8",
    boxShadow: "inset 0 0 15px rgba(0,0,0,0.15)",
    transform: "scale(0.98)"
  },
  loading: {
    opacity: 0.7
  },
  letterSelector: {
    padding: "8px 12px",
    fontSize: "1rem",
    fontFamily: "'Georgia', serif",
    backgroundColor: "#f5f0e1",
    border: "2px solid #d7b78f",
    color: "#5d4037",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  playerLetter: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  }
};

// Separate invite styles
export const inviteStyles = {
  inviteContainer: {
    position: "absolute" as const,
    top: "10px",
    right: "10px",
    zIndex: 10
  },
  inviteButton: {
    padding: "8px 16px",
    fontSize: "1rem",
    fontFamily: "'Georgia', serif",
    backgroundColor: "#8b5a2b",
    color: "#f5f0e1",
    border: "2px solid #6d4c41",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
  },
  inviteButtonHover: {
    backgroundColor: "#a67c52",
    boxShadow: "0 3px 6px rgba(0,0,0,0.3)"
  },
  inviteModal: {
    position: "fixed" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#f5f0e1",
    border: "4px solid #8b5a2b",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
    zIndex: 100,
    width: "90%",
    maxWidth: "400px"
  },
  modalOverlay: {
    position: "fixed" as const,
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 90
  },
  inviteForm: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "15px"
  },
  inviteTitle: {
    fontFamily: "'Georgia', serif",
    color: "#5d4037",
    marginTop: "0",
    marginBottom: "15px",
    fontSize: "1.3rem"
  },
  inviteInput: {
    padding: "10px",
    fontSize: "1rem",
    border: "2px solid #d7b78f",
    borderRadius: "4px",
    fontFamily: "sans-serif"
  },
  inviteActions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px"
  },
  sendButton: {
    padding: "8px 16px",
    fontSize: "1rem",
    fontFamily: "'Georgia', serif",
    backgroundColor: "#8b5a2b",
    color: "#f5f0e1",
    border: "2px solid #6d4c41",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  sendButtonHover: {
    backgroundColor: "#a67c52"
  },
  cancelButton: {
    padding: "8px 16px",
    fontSize: "1rem",
    fontFamily: "'Georgia', serif",
    backgroundColor: "#f5f0e1",
    color: "#5d4037",
    border: "2px solid #d7b78f",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  cancelButtonHover: {
    backgroundColor: "#f9f5e8"
  },
  statusMessage: {
    marginTop: "10px",
    fontFamily: "'Georgia', serif",
    fontSize: "0.9rem",
    textAlign: "center" as const
  },
  success: {
    color: "#2e7d32"
  },
  error: {
    color: "#c62828"
  },
  note: {
    fontSize: "0.8rem",
    color: "#777",
    textAlign: "center" as const,
    marginTop: "5px",
    fontStyle: "italic"
  }
};

// Export gameStyles for easier imports
export const gameStyles = styles;