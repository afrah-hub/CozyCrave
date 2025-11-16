import React, { useState, useRef } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3001";

function ProductManagement({ products, showToast, setProducts }) {
  const [showRecycle, setShowRecycle] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const modalRef = useRef(null);

  const defaultForm = {
    name: "",
    description: "",
    price: "",
    count: "",
    category: "",
    images: [""],
    isActive: true,
  };
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  const openAdd = () => {
    setEditingProduct(null);
    setForm(defaultForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price ?? "",
      count: p.count ?? "",
      category: p.category || "",
      images: p.images && p.images.length ? p.images : [""],
      isActive: p.isActive ?? true,
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setErrors({});
  };

  function validateForm() {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (form.price === "" || Number(form.price) <= 0) e.price = "Enter valid price";
    if (form.count === "" || Number(form.count) < 0) e.count = "Enter valid stock";
    if (!form.category) e.category = "Choose category";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        count: Number(form.count),
        updated_at: new Date().toISOString(),
      };
      if (editingProduct) {
        await axios.patch(`${API_BASE}/products/${editingProduct.id}`, payload);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p)));
        showToast("Product updated", "success");
      } else {
        payload.created_at = new Date().toISOString();
        const res = await axios.post(`${API_BASE}/products`, payload);
        setProducts((prev) => [...prev, res.data]);
        showToast("Product created", "success");
      }
      closeModal();
    } catch (err) {
      console.error("Save product", err);
      showToast("Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  };

  const softDeleteProduct = async (id) => {
    try {
      await axios.patch(`${API_BASE}/products/${id}`, { isActive: false });
      setProducts((p) => p.map((x) => (x.id === id ? { ...x, isActive: false } : x)));
      showToast("Moved to recycle bin");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete", "error");
    }
  };

  const restoreProduct = async (id) => {
    try {
      await axios.patch(`${API_BASE}/products/${id}`, { isActive: true });
      setProducts((p) => p.map((x) => (x.id === id ? { ...x, isActive: true } : x)));
      showToast("Restored product");
    } catch (err) {
      console.error(err);
      showToast("Restore failed", "error");
    }
  };

  const hardDeleteProduct = async (id) => {
    try {
      await axios.delete(`${API_BASE}/products/${id}`);
      setProducts((p) => p.filter((x) => x.id !== id));
      showToast("Permanently deleted", "success");
    } catch (err) {
      console.error(err);
      showToast("Delete failed", "error");
    }
  };

  const filteredProducts = products
    .filter((p) => (showRecycle ? !p.isActive : p.isActive));

  React.useEffect(() => {
    if (!showModal) return;
    const focusable = modalRef.current?.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    const first = focusable?.[0];
    first?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  return (
    <>
      <section className="page-section">
        <div className="section-head">

          <div>
            <h1 className="section-title">Product Catalog</h1>
          </div>

          <div className="controls">
            <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="btn outline" onClick={() => setShowRecycle((s) => !s)} aria-pressed={showRecycle}>
                  {showRecycle ? "Hide Recycle" : "Recycle Bin"}
                </button>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="btn btn-brand" onClick={openAdd}>Add Product</button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table className="table" role="table" aria-label="Products table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="product-cell">
                      <img
                        src={(p.images && p.images[0]) || "/images/placeholder.jpg"}
                        alt={p.name}
                        className="thumb"
                        onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                      />
                      <div>
                        <div className="strong">{p.name}</div>
                        <div className="muted small">{p.description?.slice(0, 80)}</div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>₹{p.price}</td>
                    <td>{p.count}</td>
                    <td>
                      <span className={`badge-status ${p.isActive ? "active" : "inactive"}`}>{p.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        {p.isActive ? (
                          <>
                            <button className="btn small" onClick={() => openEdit(p)}>Edit</button>
                            <button className="btn small danger" onClick={() => softDeleteProduct(p.id)}>Delete</button>
                          </>
                        ) : (
                          <>
                            <button className="btn small success" onClick={() => restoreProduct(p.id)}>Restore</button>
                            <button className="btn small danger" onClick={() => hardDeleteProduct(p.id)}>Delete Permanently</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="center muted">No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={editingProduct ? "Edit product" : "Add product"}>
          <div className="modal glass" ref={modalRef}>
            <form onSubmit={handleSave}>
              <div className="modal-head">
                <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>
                <button type="button" className="icon-close" onClick={closeModal} aria-label="Close">×</button>
              </div>

              <div className="form-grid">
                <label className="field">
                  <div className="label">Name</div>
                  <input className="input" name="name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </label>

                <label className="field">
                  <div className="label">Category</div>
                  <select className="input" value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}>
                    <option value="">Choose</option>
                    <option>Premium</option>
                    <option>Sweets</option>
                    <option>Nuts</option>
                  </select>
                  {errors.category && <div className="form-error">{errors.category}</div>}
                </label>

                <label className="field">
                  <div className="label">Price</div>
                  <input className="input" type="number" min="0" name="price" value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} />
                  {errors.price && <div className="form-error">{errors.price}</div>}
                </label>

                <label className="field">
                  <div className="label">Stock</div>
                  <input className="input" type="number" min="0" name="count" value={form.count} onChange={(e) => setForm((s) => ({ ...s, count: e.target.value }))} />
                  {errors.count && <div className="form-error">{errors.count}</div>}
                </label>

                <label className="field full">
                  <div className="label">Description</div>
                  <textarea className="input" rows="4" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
                  {errors.description && <div className="form-error">{errors.description}</div>}
                </label>

                <label className="field">
                  <div className="label">Image</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const path = `/images/${f.name}`;
                      setForm((s) => ({ ...s, images: [path] }));
                    }}
                    className="input"/>
                  {form.images && form.images[0] && (
                    <img src={form.images[0]} alt="preview" className="thumb-preview" onError={(ev) => (ev.currentTarget.src = "/images/placeholder.jpg")} />
                  )}
                  {errors.images && <div className="form-error">{errors.images}</div>}
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn primary" disabled={saving}>{saving ? "Saving…" : "Save product"}</button>
                <button type="button" className="btn outline" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductManagement;
