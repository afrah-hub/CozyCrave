import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
function Orders() {
  const { user, orders, addNotification, cancelOrder } = useContext(AppContext);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });

  
  const toggleOrderExpansion = (orderIndex) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderIndex)) {
        newSet.delete(orderIndex);
      } else {
        newSet.add(orderIndex);
      }
      return newSet;
    });
  };

  const handleCancelRequest = (orderId) => {
    setCancelModal({ isOpen: true, orderId });
  };

  const confirmCancellation = async () => {
    if (!cancelModal.orderId) return;
    try {
      await cancelOrder(cancelModal.orderId);
      setCancelModal({ isOpen: false, orderId: null });
    } catch (err) {
      // Notification handled in context
    }
  };

  const sortedOrders = () => {
    return [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
  };
  if (!user) {
  return (
    <main className="container orders-page">
      <h1>My Orders</h1>
        <p>User not logged in</p>
      </main>
    );
  }
  const processedOrders = sortedOrders();
  return (
    <main className="orders-page container">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p className="orders-subtitle">Track and manage your order history</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon"></div>
          <h3>No orders yet</h3>
          <p>When you place your first order, it will appear here.</p>
          <Link to="/products" className="btn">
            Start Shopping
          </Link>
        </div>
      ) : processedOrders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">🔍</div>
          <h3>No orders found</h3>
          <p>Try adjusting your search or date filters.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {processedOrders.map((order, index) => {
            // Find its actual index in the original orders list for display if needed
            // But usually index in processed is fine for display
            return (
              <div key={order.id} className="modern-order-card">
                <div className="order-card-header">
                  <div className="order-main-info">
                    <div className="order-title-row">
                      <h3 className="order-number">Order #{String(order.id).padStart(4, '0')}</h3>
                      <span className={`modern-status status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-meta-row">
                      <div className="order-date-info">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span>{new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="order-total-info">
                        <span className="total-label">Total:</span>
                        <span className="total-amount">₹{order.total}</span>
                      </div>
                    </div>
                    <div className="order-items-preview">
                      <span className="items-count">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      <span className="items-names">
                        {order.items.slice(0, 2).map(item => item.name).join(', ')}
                        {order.items.length > 2 && ` +${order.items.length - 2} more`}
                      </span>
                    </div>
                  </div>
                  <div className="order-actions">
                    <button
                      className="expand-toggle"
                      onClick={() => toggleOrderExpansion(index)} >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={expandedOrders.has(index) ? 'rotated' : ''} >
                        <polyline points="6,9 12,15 18,9"/>
                      </svg>
                    </button>
                  </div>
                </div>
                {expandedOrders.has(index) && (
                  <div className="order-details-modern">
                    
                    <div className="order-items-section">
                      <h4>Order Items</h4>
                      <div className="items-list">
                        {order.items.map((item, i) => (
                          <div key={i} className="modern-order-item">
                            <div className="item-main">
                              <span className="item-name">{item.name}</span>
                              <div className="item-details">
                                <span className="item-price">₹{item.price}</span>
                                <span className="item-separator">×</span>
                                <span className="item-qty">{item.qty}</span>
                              </div>
                            </div>
                            <div className="item-subtotal">
                              ₹{(item.price * item.qty).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="order-actions-section">
                      <button 
                        className="btn outline" 
                        onClick={() => handleCancelRequest(order.id)}
                        disabled={order.status === 'Cancelled' || order.status === 'Delivered'}
                        title={order.status === 'Cancelled' ? "Already cancelled" : order.status === 'Delivered' ? "Cannot cancel delivered order" : "Cancel this order"}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="15" y1="9" x2="9" y2="15"/>
                          <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        {order.status === 'Cancelled' ? "Cancelled" : "Cancel Order"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {cancelModal.isOpen && (
        <div className="modal-overlay" onClick={() => setCancelModal({ isOpen: false, orderId: null })}>
          <div className="modern-modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Cancel Order?</h3>
            <p className="modal-text">
              Are you sure you want to cancel Order #{String(cancelModal.orderId).padStart(4, '0')}? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel" 
                onClick={() => setCancelModal({ isOpen: false, orderId: null })}
              >
                No, Keep it
              </button>
              <button 
                className="modal-btn confirm" 
                onClick={confirmCancellation}
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
export default Orders;