import React from "react";

function UserManagement({ users, toggleUserBlock }) {
  return (
    <section className="page-section">
      <div className="section-head">
        <h1 className="section-title">User Management</h1>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table" role="table" aria-label="Users table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name || u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.role || "user"}</td>
                  <td>
                    <span className={`badge-status ${u.isBlocked ? "blocked" : "active"}`}>{u.isBlocked ? "Blocked" : "Active"}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className={`btn small ${u.isBlocked ? "btn-success" : "btn-danger"}`}
                        onClick={() => toggleUserBlock(u.id, u.isBlocked)}
                        aria-pressed={u.isBlocked}>
                        {u.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="center muted">No users yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default UserManagement;
