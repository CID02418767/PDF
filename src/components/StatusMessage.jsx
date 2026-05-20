export default function StatusMessage({ type = "info", children }) {
  if (!children) {
    return null;
  }

  return (
    <p className={`status-message ${type}`} role={type === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}
