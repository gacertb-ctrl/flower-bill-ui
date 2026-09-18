import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoneyBillWave,
  faCartPlus,
  faHandHoldingDollar,
  faReceipt,
  faTriangleExclamation,
  faClockRotateLeft,
  faCalendarAlt,
  faRotateRight,
  faBoxesStacked
} from '@fortawesome/free-solid-svg-icons';
import ERPLayout from '../components/layout/ERPLayout';
import { fetchStocks } from '../api/stockAPI';
import { getAllSalesEntries, getAllPurchaseEntries } from '../api/entryAPI';
import { fetchCustomers } from '../api/customerAPI';
import { useAuth } from '../context/AuthContext';
import { formatLocalDate } from '../utils/dateUtils';
import './HomePage.css';

const HomePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // Data states
  const [salesList, setSalesList] = useState([]);
  const [purchaseList, setPurchaseList] = useState([]);
  const [stocksList, setStocksList] = useState([]);
  const [customerOutstanding, setCustomerOutstanding] = useState(0);

  const loadDashboardData = async (dateObj, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const dateString = formatLocalDate(dateObj);

      // Fetch all core datasets in parallel
      const [stocksData, salesData, purchaseData, customersData] = await Promise.all([
        fetchStocks(dateObj).catch(() => []),
        getAllSalesEntries(dateString).catch(() => []),
        getAllPurchaseEntries(dateString).catch(() => []),
        fetchCustomers().catch(() => [])
      ]);

      setStocksList(Array.isArray(stocksData) ? stocksData : []);
      setSalesList(Array.isArray(salesData) ? salesData : []);
      setPurchaseList(Array.isArray(purchaseData) ? purchaseData : []);

      // Calculate Customer Outstanding
      if (Array.isArray(customersData)) {
        const totalCustOut = customersData.reduce((acc, c) => {
          const debit = parseFloat(c.debit_amount || 0);
          const credit = parseFloat(c.credit_amount || 0);
          return acc + Math.max(0, debit - credit);
        }, 0);
        setCustomerOutstanding(totalCustOut);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData(selectedDate);
  }, [selectedDate]);

  // Today Totals
  const todaySalesAmt = useMemo(() => {
    return salesList.reduce((acc, curr) => acc + Number(curr.totalAmount || curr.sales_total || curr.price * curr.quantity || 0), 0);
  }, [salesList]);

  const todayPurchaseAmt = useMemo(() => {
    return purchaseList.reduce((acc, curr) => acc + Number(curr.totalAmount || curr.purchase_total || curr.price * curr.quantity || 0), 0);
  }, [purchaseList]);

  // Process Data for Bar Chart (Flower-wise: Stock vs Sales vs Purchase)
  const barChartData = useMemo(() => {
    const map = {};

    // Stock items
    stocksList.forEach((s) => {
      const name = s.product_name || s.name || s.product_code || 'Other';
      if (!map[name]) map[name] = { name, stock: 0, sales: 0, purchase: 0 };
      const purchases = parseFloat(s.total_purchase_quality || 0);
      const sales = parseFloat(s.total_sales_quality || 0);
      map[name].stock += Math.max(0, purchases - sales);
      map[name].purchase += purchases;
      map[name].sales += sales;
    });

    // Also include sales entries if any
    salesList.forEach((entry) => {
      const name = entry.productName || entry.product_name;
      if (name) {
        if (!map[name]) map[name] = { name, stock: 0, sales: 0, purchase: 0 };
        map[name].sales += Number(entry.quantity || 1);
      }
    });

    // Take top 8 active items
    return Object.values(map)
      .filter((x) => x.stock > 0 || x.purchase > 0 || x.sales > 0)
      .slice(0, 8);
  }, [stocksList, salesList]);

  // Pie Chart Data
  const pieChartData = useMemo(() => {
    const s = todaySalesAmt > 0 ? todaySalesAmt : salesList.length;
    const p = todayPurchaseAmt > 0 ? todayPurchaseAmt : purchaseList.length;

    if (s === 0 && p === 0) {
      return [
        { name: t('action_new_sale') || 'விற்பனை', value: 1, color: '#059669' },
        { name: t('action_new_purchase') || 'கொள்முதல்', value: 1, color: '#2563EB' }
      ];
    }

    return [
      { name: t('action_new_sale') || 'விற்பனை', value: s, color: '#059669' },
      { name: t('action_new_purchase') || 'கொள்முதல்', value: p, color: '#2563EB' }
    ];
  }, [todaySalesAmt, todayPurchaseAmt, salesList, purchaseList, t]);

  // Attention Items: Low Stock and Out of Stock
  const attentionItems = useMemo(() => {
    return stocksList
      .map((s) => {
        const purchases = parseFloat(s.total_purchase_quality || 0);
        const sales = parseFloat(s.total_sales_quality || 0);
        const balance = purchases - sales;
        return {
          ...s,
          balance
        };
      })
      .filter((s) => s.balance <= 5)
      .slice(0, 5);
  }, [stocksList]);

  // Currency Formatter
  const formatRupee = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  return (
    <ERPLayout
      pageTitle={t('dashboard_title') || 'முகப்பு'}
      breadcrumbCurrent={t('dashboard_title') || 'முகப்பு'}
    >
      <div className="dashboard-container">
        {/* Welcome Banner */}
        <section className="dashboard-welcome-banner">
          <div className="welcome-title-group">
            <h1>
              {t('greeting_admin') || 'வணக்கம்'}, {user?.name || user?.username || 'நிர்வாகி'}!
            </h1>
            <p className="welcome-subtitle">
              {t('dashboard_subgreeting') || 'பூ மார்க்கெட் · இன்றைய வணிக செயல்பாடுகள் மற்றும் நிதி நிலை'}
            </p>
          </div>

          <div className="welcome-actions">
            <div className="welcome-date-badge">
              <FontAwesomeIcon icon={faCalendarAlt} />
              <input
                type="date"
                className="bg-transparent text-white border-0 font-numeric"
                style={{ outline: 'none', cursor: 'pointer', colorScheme: 'dark' }}
                value={formatLocalDate(selectedDate)}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    setSelectedDate(new Date(y, m - 1, d));
                  }
                }}
                aria-label="Select dashboard date"
              />
            </div>

            <button
              className={`btn-erp-secondary ${refreshing ? 'erp-spinning' : ''}`}
              onClick={() => loadDashboardData(selectedDate, true)}
              title={t('refresh') || 'புதுப்பி'}
              aria-label="Refresh dashboard data"
            >
              <FontAwesomeIcon icon={faRotateRight} />
            </button>
          </div>
        </section>

        {/* Core Financial & Business KPIs */}
        {loading ? (
          <div className="stock-kpis-grid dashboard-kpis-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="stock-kpi-card erp-skeleton">
                <div className="stock-kpi-skeleton-line short"></div>
                <div className="stock-kpi-skeleton-line long"></div>
              </div>
            ))}
          </div>
        ) : (
        <section className="stock-kpis-grid dashboard-kpis-grid" aria-label="வணிக முக்கிய அளவீடுகள்">
          {/* 1. Today Sales */}
          <div className="stock-kpi-card card-emerald">
            <div className="stock-kpi-icon-wrap">
              <FontAwesomeIcon icon={faMoneyBillWave} />
            </div>
            <div className="stock-kpi-content">
              <span className="stock-kpi-label">{t('kpi_today_sales') || 'இன்று விற்பனை'}</span>
              <div className="stock-kpi-value-group">
                <span className="stock-kpi-value font-numeric text-emerald">
                  {formatRupee(todaySalesAmt)}
                </span>
              </div>
              <span className="stock-kpi-subtext">
                {salesList.length} பரிவர்த்தனைகள்
              </span>
            </div>
          </div>

          {/* 2. Today Purchases */}
          <div className="stock-kpi-card card-blue">
            <div className="stock-kpi-icon-wrap">
              <FontAwesomeIcon icon={faCartPlus} />
            </div>
            <div className="stock-kpi-content">
              <span className="stock-kpi-label">{t('kpi_today_purchase_qty') || 'இன்று கொள்முதல்'}</span>
              <div className="stock-kpi-value-group">
                <span className="stock-kpi-value font-numeric text-blue">
                  {formatRupee(todayPurchaseAmt)}
                </span>
              </div>
              <span className="stock-kpi-subtext">
                {purchaseList.length} வரவுகள்
              </span>
            </div>
          </div>

          {/* 3. Customer Outstanding */}
          <div className="stock-kpi-card card-violet">
            <div className="stock-kpi-icon-wrap">
              <FontAwesomeIcon icon={faReceipt} />
            </div>
            <div className="stock-kpi-content">
              <span className="stock-kpi-label">{t('kpi_customer_outstanding') || 'வாடிக்கையாளர் பாக்கி'}</span>
              <div className="stock-kpi-value-group">
                <span className="stock-kpi-value font-numeric">
                  {formatRupee(customerOutstanding)}
                </span>
              </div>
              <span className="stock-kpi-subtext">
                மொத்த வசூல் பாக்கி
              </span>
            </div>
          </div>
        </section>
        )}

        {/* High-Frequency Quick Actions Bar */}
        <section className="dashboard-quick-actions-bar">
          <div className="quick-actions-title">
            {t('quick_actions_title') || 'விரைவு செயல்பாடுகள்'}
          </div>
          <div className="quick-actions-grid">
            <button
              className="btn-dashboard-action sale"
              onClick={() => navigate('/entries')}
            >
              <FontAwesomeIcon icon={faCartPlus} />
              <span>+ {t('action_new_sale') || 'விற்பனை பதிவு'}</span>
            </button>

            <button
              className="btn-dashboard-action purchase"
              onClick={() => navigate('/entries')}
            >
              <FontAwesomeIcon icon={faBoxesStacked} />
              <span>+ {t('action_new_purchase') || 'கொள்முதல் பதிவு'}</span>
            </button>

            <button
              className="btn-dashboard-action receive"
              onClick={() => navigate('/debit-credit')}
            >
              <FontAwesomeIcon icon={faReceipt} />
              <span>{t('action_receive_money') || 'பணம் பெறுதல்'}</span>
            </button>

            <button
              className="btn-dashboard-action pay"
              onClick={() => navigate('/debit-credit')}
            >
              <FontAwesomeIcon icon={faHandHoldingDollar} />
              <span>{t('action_pay_money') || 'பணம் செலுத்துதல்'}</span>
            </button>
          </div>
        </section>

        {/* Charts Grid */}
        <section className="dashboard-charts-grid">
          {/* Flower-Wise Sales vs Purchases */}
          <div className="dashboard-chart-card">
            <div className="chart-card-header">
              <h2 className="chart-card-title">
                {t('chart_sales_vs_purchase') || 'பொருட்கள் வாரியான விற்பனை vs கொள்முதல்'}
              </h2>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={320} minWidth={250}>
                <BarChart
                  data={barChartData.length > 0 ? barChartData : [
                    { name: 'மல்லி', purchase: 150, sales: 120 },
                    { name: 'பிச்சி', purchase: 80, sales: 75 },
                    { name: 'செவ்வந்தி', purchase: 90, sales: 60 },
                    { name: 'அரளி', purchase: 110, sales: 95 }
                  ]}
                  margin={{ top: 15, right: 20, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="purchase" fill="#2563EB" name={t('chart_purchase_label') || 'கொள்முதல்'} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sales" fill="#059669" name={t('chart_sales_label') || 'விற்பனை'} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Financial Ratio Split */}
          <div className="dashboard-chart-card">
            <div className="chart-card-header">
              <h2 className="chart-card-title">
                {t('chart_financial_split') || 'விற்பனை vs கொள்முதல் நிதி பகிர்வு'}
              </h2>
            </div>
            <div className="chart-wrapper d-flex align-items-center justify-content-center">
              <ResponsiveContainer width="100%" height={320} minWidth={250}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatRupee(val)} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Lower Grid: Attention Panel & Quick Navigation */}
        <section className="dashboard-lower-grid">
          {/* Attention Panel: Low / Out of Stock Flowers */}
          <div className="dashboard-panel-card">
            <div className="panel-header">
              <h2 className="panel-title text-danger">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                <span>{t('attention_section_title') || 'குறைந்த இருப்பு எச்சரிக்கை'}</span>
              </h2>
              <button
                className="btn-erp-ghost btn-sm"
                onClick={() => navigate('/stocks')}
              >
                அனைத்தும் பார்
              </button>
            </div>

            <div className="attention-items-list">
              {attentionItems.length > 0 ? (
                attentionItems.map((item) => (
                  <div
                    key={item.product_code || item.product_name}
                    className={`attention-item ${item.balance <= 0 ? 'out' : 'low'}`}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span className="attention-flower-name">{item.product_name}</span>
                      <span className="erp-badge erp-badge-violet font-numeric">{item.product_code}</span>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="font-numeric fw-bold">
                        {item.balance.toFixed(2)} {item.unit || 'kg'}
                      </span>
                      <span className={`attention-badge ${item.balance <= 0 ? 'out' : 'low'}`}>
                        {item.balance <= 0 ? 'இருப்பு இல்லை' : 'குறைவு'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted">
                  அனைத்து பூ வகைகளிலும் போதுமான இருப்பு உள்ளது!
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity / Fast Links */}
          <div className="dashboard-panel-card">
            <div className="panel-header">
              <h2 className="panel-title">
                <FontAwesomeIcon icon={faClockRotateLeft} className="text-primary" />
                <span>{t('recent_activity_title') || 'சமீபத்திய வணிக பதிவு சுருக்கம்'}</span>
              </h2>
              <button
                className="btn-erp-ghost btn-sm"
                onClick={() => navigate('/entries')}
              >
                பதிவுகள்
              </button>
            </div>

            <div className="activity-feed-list">
              <div className="activity-feed-item">
                <div className="activity-feed-left">
                  <div className="activity-feed-icon sale">
                    <FontAwesomeIcon icon={faCartPlus} />
                  </div>
                  <div>
                    <span className="activity-feed-title">இன்றைய மொத்த விற்பனைகள்</span>
                    <span className="activity-feed-meta">பதிவு செய்யப்பட்ட பூ விற்பனைகள்</span>
                  </div>
                </div>
                <span className="activity-feed-amount font-numeric text-emerald">
                  {formatRupee(todaySalesAmt)}
                </span>
              </div>

              <div className="activity-feed-item">
                <div className="activity-feed-left">
                  <div className="activity-feed-icon purchase">
                    <FontAwesomeIcon icon={faBoxesStacked} />
                  </div>
                  <div>
                    <span className="activity-feed-title">இன்றைய மொத்த கொள்முதல்கள்</span>
                    <span className="activity-feed-meta">சப்ளையர்களிடமிருந்து பெறப்பட்ட பூக்கள்</span>
                  </div>
                </div>
                <span className="activity-feed-amount font-numeric text-blue">
                  {formatRupee(todayPurchaseAmt)}
                </span>
              </div>

              <div className="activity-feed-item">
                <div className="activity-feed-left">
                  <div className="activity-feed-icon sale">
                    <FontAwesomeIcon icon={faReceipt} />
                  </div>
                  <div>
                    <span className="activity-feed-title">வாடிக்கையாளர் மொத்த பாக்கி</span>
                    <span className="activity-feed-meta">கடை மற்றும் வியாபாரிகளிடம் வசூலிக்கப்பட வேண்டியது</span>
                  </div>
                </div>
                <span className="activity-feed-amount font-numeric text-primary">
                  {formatRupee(customerOutstanding)}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ERPLayout>
  );
};

export default HomePage;