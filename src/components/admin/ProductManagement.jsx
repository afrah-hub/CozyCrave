import React, { useState, useRef } from "react";
import axios from "axios";
import { apiClient } from "../../services/api";

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});

  const openAdd = () => {
    setEditingProduct(null);
    setForm(defaultForm);
    setSelectedFile(null);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = async (p) => {
    try {
      // Fetch full product details since the admin list API lacks some fields (like Description)
      const res = await apiClient.get(`/api/Product/${p.id}`);
      const fullP = res.data?.data ?? res.data;

      setEditingProduct(fullP);
      setForm({
        name: fullP.name || fullP.Name || "",
        description: fullP.description || fullP.Description || "",
        price: fullP.price ?? fullP.Price ?? "",
        count: fullP.count ?? fullP.Count ?? "",
        category: fullP.category || fullP.Category || "",
        images: (fullP.images && fullP.images.length) ? fullP.images : (fullP.Images && fullP.Images.length) ? fullP.Images : [""],
        isActive: fullP.isActive ?? fullP.IsActive ?? true,
      });
      setSelectedFile(null);
      setErrors({});
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching product details", err);
      showToast("Failed to load product details", "error");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setSelectedFile(null);
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
      if (editingProduct) {
        // Update uses [FromBody] JSON
        const payload = {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          count: Number(form.count),
          category: form.category
        };
        await apiClient.put(`/api/Product/${editingProduct.id}`, payload);

        // Refresh products to get latest state
        const res = await apiClient.get(`/api/Product/admin`);
        setProducts(res.data?.data || []);
        showToast("Product updated", "success");
      } else {
        // Create uses [FromForm] multipart/form-data
        const formData = new FormData();
        formData.append("Name", form.name);
        formData.append("Description", form.description);
        formData.append("Price", form.price);
        formData.append("Count", form.count);
        formData.append("Category", form.category);
        if (selectedFile) {
          formData.append("Files", selectedFile);
        }

        const res = await apiClient.post(`/api/Product`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setProducts((prev) => [...prev, res.data?.data ?? res.data]);
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

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      await apiClient.delete(`/api/Product/${id}`);
      setProducts((p) => p.filter((x) => x.id !== id));
      showToast("Product permanently deleted", "success");
    } catch (err) {
      console.error(err);
      showToast("Delete failed", "error");
    }
  };

  const filteredProducts = products;

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
            <button className="btn btn-brand" onClick={openAdd}>Add Product</button>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="product-cell">
                      <img
                        src={p.primaryImageUrl || p.PrimaryImageUrl || (p.images && p.images[0]) || (p.Images && p.Images[0]) || "/images/placeholder.jpg"}
                        alt={p.name || p.Name}
                        className="thumb"
                        onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                      />
                      <div>
                        <div className="strong">{p.name || p.Name}</div>
                        <div className="muted small">{(p.description || p.Description)?.slice(0, 80)}</div>
                      </div>
                    </td>
                    <td>{p.category || p.Category}</td>
                    <td>₹{p.price || p.Price}</td>
                    <td>{p.count || p.Count}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn small" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn small danger" onClick={() => deleteProduct(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="5" className="center muted">No products found</td>
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
                    <option>Chocolate</option>
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
                      setSelectedFile(f);
                    }}
                    className="input" />
                  {(selectedFile || (editingProduct && (editingProduct.primaryImageUrl || editingProduct.PrimaryImageUrl))) && (
                    <img
                      src={selectedFile ? URL.createObjectURL(selectedFile) : (editingProduct.primaryImageUrl || editingProduct.PrimaryImageUrl)}
                      alt="preview"
                      className="thumb-preview"
                      onError={(ev) => (ev.currentTarget.src = "/images/placeholder.jpg")}
                    />
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
