import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
function Orders() {
  const { user, addNotification, removeOrder } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  useEffect(() => {
    if (user && user.orders) {
      setOrders(user.orders);
    }
  }, [user]);
 
  const downloadInvoice = (order, orderIndex) => {
    const invoiceData = {
      orderNumber: `ORD-${orderIndex + 1}`,
      date: new Date(order.date).toLocaleDateString(),
      items: order.items,
      total: order.total,
    };
    const dataStr = JSON.stringify(invoiceData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `invoice-${invoiceData.orderNumber}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    addNotification("Invoice downloaded successfully", "success");
  };
  
  const printOrder = (order, orderIndex) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Order #${orderIndex + 1}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .order-info { margin-bottom: 20px; }
            .items { border-collapse: collapse; width: 100%; }
            .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items th { background-color: #f2f2f2; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Order #${orderIndex + 1}</h1>
            <p>Cozy Crave</p>
          </div>
          <div class="order-info">
            <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Total:</strong> ₹${order.total}</p>
          </div>
          <table class="items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>₹${item.price}</td>
                  <td>${item.qty}</td>
                  <td>₹${(item.price * item.qty).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            Total: ₹${order.total}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
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
  const sortedOrders = () => {
    return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
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
          {processedOrders.map((order, index) => (
            <div key={index} className="modern-order-card">
              <div className="order-card-header">
                <div className="order-main-info">
                  <div className="order-title-row">
                    <h3 className="order-number">Order #{String(index + 1).padStart(4, '0')}</h3>
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
                    <button className="btn outline" onClick={() => printOrder(order, index)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6,9 6,2 18,2 18,9"/>
                        <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                        <rect x="6" y="14" width="12" height="8"/>
                      </svg>
                      Print
                    </button>
                    <button className="btn outline" onClick={() => downloadInvoice(order, index)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download
                    </button>
                    <button className="btn outline" onClick={() => removeOrder(index)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                      Remove Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
export default Orders;