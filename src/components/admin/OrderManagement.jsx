import React, { useState } from "react";
import { apiClient } from "../../services/api";

function OrderManagement({ orders, users, products, setOrders, showToast }) {
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [updating, setUpdating] = useState(false);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const handleUpdateStatus = async (id, newStatus) => {
    if (newStatus === orders.find(o => o.id === id)?.status) return;
    
    setUpdating(true);
    try {
      await apiClient.patch(`/api/Order/${id}/status?status=${newStatus}`);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      showToast(`Order status updated to ${newStatus}`, "paid");
    } catch (err) {
      console.error(err);
      showToast("Failed to update status", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <section className="page-section">
      <div className="section-head">
        <h1 className="section-title">Orders</h1>
      </div>
      <div className="admin-orders-grid">
        <div className="card list-pane admin-orders-list">
          <div className="pane-header">
            <div className="muted small">All Orders</div>
            <div className="orders-count badge">{orders.length}</div>
          </div>
          <div className="list-scroll" role="list">
            {orders.slice().sort((a,b) => b.id - a.id).map((o) => {
              const status = o.status || o.Status || "Pending";
              const total = o.total || o.Total || 0;
              const date = o.createdAt || o.CreatedAt || o.orderDate || o.OrderDate || Date.now();

              return (
                <button
                  key={o.id}
                  className={`order-row-item ${selectedOrderId === o.id ? "active" : ""}`}
                  onClick={() => setSelectedOrderId(o.id)}
                >
                  <div className="order-row-main">
                    <div className="order-row-id">ORD-{o.id}</div>
                    <div className="order-row-date">{new Date(date).toLocaleDateString()}</div>
                  </div>
                  <div className="order-row-meta">
                    <div className="order-row-total">₹{total}</div>
                    <div className={`status-dot ${status.toLowerCase()}`}></div>
                  </div>
                </button>
              );
            })}
            {orders.length === 0 && <div className="center-info muted">No orders found</div>}
          </div>
        </div>
        <div className="card detail-pane-modern" aria-live="polite">
          {!selectedOrder ? (
            <div className="empty-selection">
              <div className="empty-icon">📂</div>
              <h3>Select an Order</h3>
              <p>Click on an order from the list to view its full details and manage its status.</p>
            </div>
          ) : (
            (() => {
              const order = selectedOrder;
              const cust = users.find((u) => u.id === order.userId) || {};
              const items = order.items || order.Items || [];
              const status = order.status || order.Status || "Pending";

              return (
                <div className="detail-container animate-fade-in">
                  <div className="detail-header-admin">
                    <div className="header-info">
                      <div className="badge-id">Order ID: #{order.id}</div>
                      <h2>{order.recipientName || order.RecipientName || cust.name || "Customer Order"}</h2>
                      <div className="muted">{new Date(order.createdAt || order.CreatedAt || Date.now()).toLocaleString()}</div>
                    </div>
                    
                    <div className="status-control-admin">
                      <label>Update Status</label>
                      <div className="status-selector-wrap">
                        <select
                          className={`status-select ${status.toLowerCase()}`}
                          value={status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          disabled={updating}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        {updating && <div className="spinner-xs"></div>}
                      </div>
                    </div>
                  </div>

                  <div className="detail-grid-modern">
                    <div className="info-card">
                      <div className="info-section">
                        <h4>Contact Info</h4>
                        <div className="info-row">
                          <span className="label">Phone:</span>
                          <span className="value">{order.phone || order.Phone || "N/A"}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">User Email:</span>
                          <span className="value">{cust.email || "N/A"}</span>
                        </div>
                      </div>
                      
                      <div className="info-section">
                        <h4>Shipping Address</h4>
                        <div className="address-box">
                          <strong>{order.recipientName || order.RecipientName}</strong>
                          <div>{order.address || order.Address}</div>
                          <div className="muted">
                             {[order.city || order.City, order.state || order.State, order.pincode || order.Pincode, order.country || order.Country]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="items-card">
                       <h4>Order Items ({items.length})</h4>
                       <div className="admin-items-list">
                          {items.map((it, idx) => {
                            const prod = it.product || it.Product || products.find((p) => p.id === it.productId) || {};
                            const qty = it.quantity || it.Quantity || 1;
                            const price = it.price || it.Price || prod.price || 0;
                            return (
                              <div key={idx} className="admin-item-row">
                                <img src={prod.primaryImageUrl || (prod.images && prod.images[0]) || "/images/placeholder.jpg"} alt={prod.name || "Product"} className="item-thumb-admin" />
                                <div className="item-info-admin">
                                  <div className="item-name-admin">{prod.name || `Product #${it.productId}`}</div>
                                  <div className="item-meta-admin">{qty} × ₹{price}</div>
                                </div>
                                <div className="item-total-admin">₹{price * qty}</div>
                              </div>
                            );
                          })}
                       </div>
                       
                       <div className="admin-order-summary">
                          <div className="summary-row grand-total-admin">
                            <span>Total Revenue</span>
                            <span>₹{order.total || order.Total}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </section>
  );
}

export default OrderManagement;
