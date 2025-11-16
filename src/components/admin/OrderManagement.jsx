import React, { useState } from "react";

function OrderManagement({ orders, users, products }) {
  const [selectedOrderIdx, setSelectedOrderIdx] = useState(null);

  return (
    <section className="page-section">
      <div className="section-head">
        <h1 className="section-title">Orders</h1>
      </div>
      <div className="orders-grid">
        <div className="card list-pane">
          <div className="muted small" style={{ marginBottom: 8 }}>Recent orders</div>
          <div className="list-scroll" role="list">
            {orders.slice().reverse().map((o, idx) => {
              const i = orders.length - 1 - idx;
              const status = o.status || "pending";
              return (
                <button
                  key={i}
                  className={`order-row ${selectedOrderIdx === i ? "selected" : ""}`}
                  onClick={() => setSelectedOrderIdx(i)}
                  role="listitem"
                  aria-pressed={selectedOrderIdx === i}
                >
                  <div>
                    <div className="strong">Order #{i + 1}</div>
                    <div className="muted small">{new Date(o.date || o.created_at || Date.now()).toLocaleString()}</div>
                  </div>
                  <div className="meta">
                    <div className="muted small">₹{o.total}</div>
                    <div className={`badge-status ${status === "success" ? "active" : status === "failed" ? "blocked" : "pending"}`}>
                      {status}
                    </div>
                  </div>
                </button>
              );
            })}
            {orders.length === 0 && <div className="center muted">No orders yet</div>}
          </div>
        </div>
        <div className="card detail-pane" aria-live="polite">
          {!Number.isInteger(selectedOrderIdx) ? (
            <div className="center muted">Select an order to view details</div>
          ) : (
            (() => {
              const order = orders[selectedOrderIdx];
              const cust = users.find((u) => (u.orders || []).some((x) => x === order)) || {};
              const address = order.address || cust.address || cust.shippingAddress || {};
              const items = order.items || [];
              return (
                <div>
                  <div className="detail-head">
                    <div>
                      <h3>Order #{selectedOrderIdx + 1}</h3>
                      <div className="muted small">{new Date(order.date || order.created_at || Date.now()).toLocaleString()}</div>
                    </div>
                    <div className="status-block">
                      <span className={`badge-status ${order.status === "success" ? "active" : order.status === "failed" ? "blocked" : "pending"}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid detail-grid">
                    <div>
                      <h4 className="small">Customer</h4>
                      <div className="muted">{cust.name || cust.email || "Unknown"}</div>

                      <h4 className="small" style={{ marginTop: 12 }}>Shipping</h4>
                      <div className="order-address">
                        {address.line1 && <div>{address.line1}</div>}
                        {address.line2 && <div>{address.line2}</div>}
                        {(address.city || address.state || address.postalCode) && (
                          <div className="muted small">{[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="small">Totals</h4>
                      <div className="muted">Items: {items.length}</div>
                      <div className="strong" style={{ marginTop: 8 }}>₹{order.total}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <h4 className="small">Items</h4>
                    <div className="items-list">
                      {items.map((it, idx) => {
                        const prod = products.find((p) => p.id === it.id) || {};
                        const qty = it.quantity ?? it.qty ?? 1;
                        return (
                          <div key={idx} className="item-row">
                            <img src={prod.images?.[0] || "/images/placeholder.jpg"} alt={prod.name || "Product"} className="thumb-sm" />
                            <div style={{ flex: 1 }}>
                              <div className="strong">{prod.name || `Product #${it.id}`}</div>
                              <div className="muted small">Qty: {qty}</div>
                            </div>
                            <div className="strong">₹{(prod.price || 0) * qty}</div>
                          </div>
                        );
                      })}
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
