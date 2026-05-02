import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faShoppingCart, faServer, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { fetchStocks } from '../api/stockAPI';
import { getAllSalesEntries, getAllPurchaseEntries } from '../api/entryAPI';
import GlassCard from '../components/ui/GlassCard';

const HomePage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    barData: [],
    pieData: [],
    totals: { sales: 0, purchase: 0 }
  });

  // Nature-inspired colors for charts
  const CHART_COLORS = {
    sales: '#5c995c',    // nature-500
    purchase: '#e69966', // accent-orange
    stock: '#7ab8e6',    // accent-blue
  };

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
          { name: t('Total Sales'), value: totalSales },
          { name: t('Total Purchase'), value: totalPurchase },
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
  }, [t]);

  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-nature-200 border-t-nature-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-nature-800 dark:text-nature-100 tracking-tight">{t("Today's Overview")}</h2>
          <p className="text-nature-500 dark:text-nature-400 mt-1">{currentDate}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <GlassCard className="p-6 relative overflow-hidden group bg-white/70 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-nature-100 dark:bg-nature-800/80 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h5 className="text-sm font-bold text-nature-500 dark:text-nature-400 mb-2 uppercase tracking-wider">{t('Total Sales')}</h5>
              <h3 className="text-4xl font-extrabold text-nature-800 dark:text-nature-100">₹ {dashboardData.totals.sales.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-nature-100 dark:bg-nature-800 text-nature-600 dark:text-nature-300 flex items-center justify-center shadow-inner">
              <FontAwesomeIcon icon={faChartLine} size="lg" />
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6 relative overflow-hidden group bg-white/70 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h5 className="text-sm font-bold text-accent-orange dark:text-orange-400 mb-2 uppercase tracking-wider">{t('Total Purchase')}</h5>
              <h3 className="text-4xl font-extrabold text-nature-800 dark:text-nature-100">₹ {dashboardData.totals.purchase.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/30 text-accent-orange flex items-center justify-center shadow-inner">
              <FontAwesomeIcon icon={faShoppingCart} size="lg" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group bg-gradient-to-br from-white/70 to-nature-50/70 dark:from-nature-900/60 dark:to-nature-800/60 border border-nature-200 dark:border-nature-700/50">
           <div className="absolute -right-6 -top-6 w-24 h-24 bg-nature-100 dark:bg-nature-700/50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
           <div className="relative z-10 flex flex-col justify-between h-full">
             <div className="flex items-center justify-between">
               <h5 className="text-sm font-bold text-nature-500 dark:text-nature-400 uppercase tracking-wider">{t('System Status')}</h5>
               <FontAwesomeIcon icon={faServer} className="text-nature-400 dark:text-nature-500" />
             </div>
             <h3 className="text-xl font-semibold text-nature-700 dark:text-nature-200 mt-4 flex items-center gap-3">
               <FontAwesomeIcon icon={faCircleCheck} className="text-nature-500 animate-pulse" />
               {t('All systems operational')}
             </h3>
           </div>
        </GlassCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart: Stock vs Purchase vs Sales */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 h-full flex flex-col bg-white/70 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50">
            <h4 className="text-xl font-bold text-nature-800 dark:text-nature-100 mb-6">{t('Product Overview')}</h4>
            <div className="flex-1 w-full min-h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5f2e5" strokeOpacity={0.5} vertical={false} />
                  <XAxis dataKey="name" tick={{fill: '#5c995c', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: '#5c995c', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(122,184,122,0.2)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', color: '#244024' }}
                    itemStyle={{ color: '#244024' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px', color: '#477a47' }}/>
                  <Bar dataKey="stock" fill={CHART_COLORS.stock} name={t('Current Stock')} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="purchase" fill={CHART_COLORS.purchase} name={t('Purchase Qty')} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sales" fill={CHART_COLORS.sales} name={t('Sales Qty')} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Pie Chart: Total Amount Comparison */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 h-full flex flex-col items-center bg-white/70 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50">
            <h4 className="text-xl font-bold text-nature-800 dark:text-nature-100 mb-6 w-full text-left">{t('Activity Ratio')}</h4>
            <div className="flex-1 w-full min-h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {dashboardData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? CHART_COLORS.sales : CHART_COLORS.purchase} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `₹ ${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(122,184,122,0.2)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', color: '#244024' }}
                    itemStyle={{ color: '#244024' }}
                  />
                  <Legend iconType="circle" verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '14px', color: '#477a47' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default HomePage;