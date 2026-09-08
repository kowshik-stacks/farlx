import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("FARLX Uncaught Runtime Error:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#071A2B",
          color: "#FFFFFF",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "24px"
        }}>
          <div style={{
            maxWidth: "520px",
            width: "100%",
            background: "#0D2235",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "24px",
            padding: "36px",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 20px",
              background: "rgba(16, 185, 129, 0.15)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px"
            }}>
              🌱
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "10px", color: "#FFFFFF" }}>
              FARLX Dashboard Notice
            </h1>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
              An interface cache refresh is required. Tap the button below to clear session cache and reload the live dashboard.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                width: "100%",
                padding: "14px 24px",
                background: "linear-gradient(135deg, #10B981, #06B6D4)",
                border: "none",
                borderRadius: "14px",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: "800",
                cursor: "pointer"
              }}
            >
              🔄 Refresh Live Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
