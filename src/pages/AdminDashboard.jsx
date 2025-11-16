import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import "./AdminDashboard.css";
import brandLogo from "/images/placeholder1.png";
import LoadingSpinner from "../components/LoadingSpinner";
import DashboardOverview from "../components/admin/DashboardOverview";
import UserManagement from "../components/admin/UserManagement";
import ProductManagement from "../components/admin/ProductManagement";
import OrderManagement from "../components/admin/OrderManagement";
import Toast from "../components/admin/Toast";

const API_BASE = "http://localhost:3001";
const HEADER_HEIGHT = 64;

export default function AdminDashboard() {
  const { user, logout } = useContext(AppContext || {});
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const [uRes, pRes] = await Promise.all([
          axios.get(`${API_BASE}/users`),
          axios.get(`${API_BASE}/products`),
        ]);
        if (cancelled) return;
        setUsers(uRes.data || []);
        setProducts(pRes.data || []);
        const allOrders = (uRes.data || []).flatMap((u) => u.orders || []);
        setOrders(allOrders);
      } catch (err) {
        console.error("Admin fetch error:", err);
        setToast({ type: "error", message: "Failed to load admin data" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);



  const showToast = (message, type = "success") => {
    setToast({ type, message });
  };

  const closeToast = () => setToast(null);

  const toggleUserBlock = async (userId, currentlyBlocked) => {
    try {
      await axios.patch(`${API_BASE}/users/${userId}`, { isBlock: !currentlyBlocked });
      setUsers((u) => u.map((x) => (x.id === userId ? { ...x, isBlock: !currentlyBlocked } : x)));
      showToast(currentlyBlocked ? "User unblocked" : "User blocked");
    } catch (err) {
      console.error(err);
      showToast("Failed to update user", "error");
    }
  };



  if (loading) {
    return (
      <div className="admin-root loading-root" style={{ minHeight: "100vh" }}>
        <div className="loading-center">
          <LoadingSpinner />
          <div className="muted">Loading admin console…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root">
      <header className="top-header" style={{ height: HEADER_HEIGHT }}>
        <div className="header-inner">
          <div className="brand" aria-hidden>
            <div  /><img src={brandLogo} alt="Cozy Crave Logo" className="brand-logo" />
            <div className="brand-text">
              <div className="title"> Admin</div>
              <div className="subtitle muted">Control center</div>
            </div>
          </div>

          <div className="header-actions">
            <div className="greeting" aria-hidden>
              <div className="greet-line">Hi, <span className="greet-name">{user?.name || user?.username || "Admin"}</span></div>
            </div>

            <button
              className="btn-logout"
              onClick={() => {
                if (typeof logout === "function") logout();
                else window.location.reload();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="layout" style={{ paddingTop: HEADER_HEIGHT }}>
        <aside className="side-nav" aria-label="Main navigation">
          <nav className="nav-list">
            <button
              className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
              aria-current={activeTab === "dashboard" ? "page" : undefined}
            >
              <span className="nav-ic" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </span>
              <span className="nav-label">Dashboard</span>
            </button>

            <button
              className={`nav-item ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <span className="nav-ic" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="nav-label">Users</span>
              
            </button>

            <button
              className={`nav-item ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              <span className="nav-ic" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                </svg>
              </span>
              <span className="nav-label">Products</span>
             
            </button>

            <button
              className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <span className="nav-ic" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72" />
                </svg>
              </span>
              <span className="nav-label">Orders</span>
              
            </button>
          </nav>
        </aside>

        <main className="main-content">
          {activeTab === "dashboard" && (
            <DashboardOverview users={users} products={products} orders={orders} setActiveTab={setActiveTab} />
          )}

          {activeTab === "users" && (
            <UserManagement users={users} toggleUserBlock={toggleUserBlock} />
          )}

          {activeTab === "products" && (
            <ProductManagement products={products} showToast={showToast} setProducts={setProducts} />
          )}

          {activeTab === "orders" && (
            <OrderManagement orders={orders} users={users} products={products} />
          )}
        </main>
      </div>


      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}