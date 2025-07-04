export default function AdminHome({ user, onLogout }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Admin Dashboard</h1>
        <button onClick={onLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
      <p>Welcome, {user.displayName}</p>
      {/* Add your admin dashboard content here */}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  logoutButton: {
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  }
};