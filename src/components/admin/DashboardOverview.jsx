import React from "react";
import { ResponsiveContainer,AreaChart,Area,BarChart,Bar,XAxis,YAxis,Tooltip,CartesianGrid,Legend,LineChart,Line,Brush} from "recharts";
import StatCard from "./StatCard";

function DashboardOverview({ users, products, orders, setActiveTab }) {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);

  const byMonth = {};
  orders.forEach((o) => {
    const d = new Date(o.date || o.created_at || Date.now());
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth[key] = byMonth[key] || { revenue: 0, orders: 0 };
    byMonth[key].revenue += Number(o.total || 0);
    byMonth[key].orders += 1;
  });
  const months = Object.keys(byMonth).sort();
  const revenueChart = months.map((m) => {
    const d = new Date(m + "-01");
    return { month: d.toLocaleString(undefined, { month: "short" }), revenue: Math.round(byMonth[m].revenue) };
  });
  let cumulativeOrders = 0;
  const ordersChart = months.map((m) => {
    cumulativeOrders += byMonth[m].orders;
    const d = new Date(m + "-01");
    return { month: d.toLocaleString(undefined, { month: "short" }), orders: cumulativeOrders };
  });

  return (
    <section className="page-section">
      <div className="section-head">
        <h1 className="section-title">Overview</h1>          
            </div>
      <div className="grid grid-stats">
        <StatCard title="Users" value={users.length} onClick={() => setActiveTab("users")} icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
        <StatCard title="Products" value={products.length} onClick={() => setActiveTab("products")} icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>} />
        <StatCard title="Orders" value={totalOrders} onClick={() => setActiveTab("orders")} icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>} />
        <StatCard title="Revenue (₹)" value={`₹${totalRevenue.toFixed(2)}`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-currency-rupee" viewBox="0 0 16 16">
  <path d="M4 3.06h2.726c1.22 0 2.12.575 2.325 1.724H4v1.051h5.051C8.855 7.001 8 7.558 6.788 7.558H4v1.317L8.437 14h2.11L6.095 8.884h.855c2.316-.018 3.465-1.476 3.688-3.049H12V4.784h-1.345c-.08-.778-.357-1.335-.793-1.732H12V2H4z"/>
</svg>

} />
      </div>

      <div className="grid grid-charts">
        <div className="card chart-card">
          <div className="card-head">
            <h3 className="card-title">Revenue (monthly)</h3>
            <div className="muted small">Trend of total revenue</div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueChart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A0522D" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#A0522D" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(15,23,42,0.04)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <Tooltip formatter={(v) => `₹${v}`} contentStyle={{ borderRadius: 8, border: "1px solid rgba(15,23,42,0.06)" }} />
                <Area type="monotone" dataKey="revenue" stroke="#A0522D" strokeWidth={3} fill="url(#revenueGradient)" dot={{ r: 4, fill: '#A0522D', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#A0522D', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-head">
            <h3 className="card-title">Orders (monthly)</h3>
            <div className="muted small">Number of orders</div>
          </div>
          <div className="chart-wrap">
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={ordersChart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
      <defs>
        <linearGradient id="orderBarGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="50%" stopColor="rgba(173, 92, 5, 0.8)" />
          <stop offset="100%" stopColor="rgba(225, 213, 208, 0.05)" />
        </linearGradient>
      </defs>

      <CartesianGrid stroke="rgba(15,23,42,0.04)" strokeDasharray="3 3" />
      <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 12 }} />
      <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} />
      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(15,23,42,0.06)" }} />
      <Bar
        dataKey="orders"
        fill="url(#orderBarGradient)"
        radius={[6, 6, 0, 0]}
        barSize={39}
      />
    </BarChart>
  </ResponsiveContainer>
     </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardOverview;
