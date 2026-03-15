import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faCheck, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { fetchStocks } from '../api/stockAPI';
import { getAllSalesEntries, getAllPurchaseEntries } from '../api/entryAPI';
import '../styles/HomePage.css'; // Will create this

const HomePage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    barData: [],
    pieData: [],
    totals: { sales: 0, purchase: 0 }
  });

  const COLORS = ['#111827', '#6b7280', '#9ca3af', '#e5e7eb']; // Monochrome pie colors

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];

        const [stocksData, salesData, purchaseData] = await Promise.all([
          fetchStocks(today),
          getAllSalesEntries(dateString),
          getAllPurchaseEntries(dateString)
        ]);

        const productMap = {};

        if (Array.isArray(stocksData)) {
          stocksData.forEach(item => {
            const name = item.productName || item.product_name || "Unknown";
            if (!productMap[name]) productMap[name] = { name, stock: 0, sales: 0, purchase: 0 };
            productMap[name].stock += Number(item.quantity || 0);
          });
        }

        if (Array.isArray(salesData)) {
          salesData.forEach(entry => {
            const name = entry.productName || entry.product_name;
            if (name) {
              if (!productMap[name]) productMap[name] = { name, stock: 0, sales: 0, purchase: 0 };
              productMap[name].sales += Number(entry.quantity || 1);
            }
          });
        }

        if (Array.isArray(purchaseData)) {
          purchaseData.forEach(entry => {
            const name = entry.productName || entry.product_name;
            if (name) {
              if (!productMap[name]) productMap[name] = { name, stock: 0, sales: 0, purchase: 0 };
              productMap[name].purchase += Number(entry.quantity || 1);
            }
          });
        }

        const barData = Object.values(productMap);

        const totalSalesAmt = Array.isArray(salesData)
          ? salesData.reduce((acc, curr) => acc + Number(curr.totalAmount || curr.sales_total || 0), 0)
          : 0;

        const totalPurchaseAmt = Array.isArray(purchaseData)
          ? purchaseData.reduce((acc, curr) => acc + Number(curr.totalAmount || curr.purchase_total || 0), 0)
          : 0;

        const totalSales = salesData.length;
        const totalPurchase = purchaseData.length;

        const pieData = [
          { name: 'Total Sales', value: totalSales },
          { name: 'Total Purchase', value: totalPurchase },
        ];

        setDashboardData({
          barData,
          pieData,
          totals: { sales: totalSalesAmt, purchase: totalPurchaseAmt }
        });

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">{t('loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      
      {/* Top Banner mapping to "Overall Information" request */}
      <section className="dashboard-row top-metrics">
        <div className="saas-card metric-card hero-metric">
           <div className="saas-card-body">
             <h5 className="text-secondary fw-semibold">{t('total_revenue_today')}</h5>
             <h1 className="fw-bold mt-2">₹ {dashboardData.totals.sales.toLocaleString()}</h1>
             <div className="d-flex gap-4 mt-4">
                 <div className="small-stat">
                     <span className="text-muted d-block small">{t('total_sales_hash')}</span>
                     <span className="fw-bold">{dashboardData.pieData[0].value}</span>
                 </div>
                 <div className="small-stat">
                     <span className="text-muted d-block small">{t('total_purchase_hash')}</span>
                     <span className="fw-bold">{dashboardData.pieData[1].value}</span>
                 </div>
                 <div className="small-stat">
                     <span className="text-muted d-block small">{t('purchase_cost')}</span>
                     <span className="fw-bold">₹ {dashboardData.totals.purchase.toLocaleString()}</span>
                 </div>
             </div>
           </div>
        </div>

        <div className="saas-card metric-card">
           <div className="saas-card-header d-flex justify-content-between">
              <span>{t('monthly_progress')}</span>
              <FontAwesomeIcon icon={faEllipsisVertical} />
           </div>
           <div className="saas-card-body d-flex flex-column align-items-center justify-content-center h-100">
              <div style={{ width: '100%', height: '140px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={dashboardData.pieData}
                      cx="50%" cy="50%"
                      innerRadius={45} outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {dashboardData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <button className="btn btn-outline-primary btn-sm mt-2 w-100">{t('download_report')}</button>
           </div>
        </div>
      </section>

      {/* Main Grid: Weekly Progress + Tasks */}
      <section className="dashboard-row middle-section">
        <div className="saas-card chart-card">
            <div className="saas-card-header d-flex justify-content-between">
                <span>{t('weekly_progress')}</span>
                <span className="badge bg-light text-dark border">{t('this_week')}</span>
            </div>
            <div className="saas-card-body">
                <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer>
                        <LineChart data={dashboardData.barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                            <Legend iconType="circle" />
                            <Line type="monotone" dataKey="sales" stroke="#111827" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                            <Line type="monotone" dataKey="purchase" stroke="#9ca3af" strokeWidth={3} dot={{r: 4}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Syncing Tasks to Recent Product Stock List structurally */}
        <div className="saas-card tasks-card">
            <div className="saas-card-header d-flex justify-content-between">
                <span>{t('tasks_in_process')}</span>
                <FontAwesomeIcon icon={faEllipsisVertical} />
            </div>
            <div className="saas-card-body p-0">
               <ul className="list-group list-group-flush pt-2 pb-2">
                   {dashboardData.barData.slice(0, 4).map((item, idx) => (
                       <li key={idx} className="list-group-item d-flex justify-content-between align-items-center border-0 px-4 py-3 task-item">
                           <div>
                               <h6 className="mb-0 fw-semibold">{item.name}</h6>
                               <small className="text-muted">{t('stock_units', { count: item.stock })}</small>
                           </div>
                           <FontAwesomeIcon icon={faEllipsisVertical} className="text-muted" style={{cursor: 'pointer'}} />
                       </li>
                   ))}
               </ul>
            </div>
        </div>
      </section>

      {/* Bottom Grid: Projects mapping to Suppliers/Customers conceptually */}
      <section className="dashboard-row bottom-section">
         <div className="saas-card">
             <div className="saas-card-header">{t('recent_projects')}</div>
             <div className="saas-card-body pb-4">
                 <div className="row">
                     {[
                         { title: t('supplier_network'), desc: t('active_order_routing'), status: t('in_progress') },
                         { title: t('customer_onboarding'), desc: t('retail_pos_integration'), status: t('completed') },
                         { title: t('inventory_audit'), desc: t('q3_stock_reconciliation'), status: t('in_progress') }
                     ].map((proj, i) => (
                         <div className="col-md-4" key={i}>
                             <div className="border rounded p-3 project-box hover-shadow transition-fast">
                                 <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="bg-light p-2 rounded text-dark"><FontAwesomeIcon icon={faFolderOpen} /></div>
                                    <span className={`badge ${proj.status === t('completed') ? 'bg-dark' : 'bg-light text-dark border'}`}>{proj.status}</span>
                                 </div>
                                 <h6 className="fw-semibold mt-3">{proj.title}</h6>
                                 <p className="text-muted small mb-0">{proj.desc}</p>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
         </div>
      </section>

    </div>
  );
};

export default HomePage;