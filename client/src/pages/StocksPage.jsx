import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Table from '../components/Table';
import { fetchStocks } from '../api/stockAPI';
import GlassCard from '../components/ui/GlassCard';
import { useTranslation } from 'react-i18next';

const StocksPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stockData, setStockData] = useState([]);
  const { t } = useTranslation();
  const page = 'stocks';

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchStockData(date);
  };

  const fetchStockData = async (date) => {
    try {
      const data = await fetchStocks(date);
      setStockData(data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  React.useEffect(() => {
    fetchStockData(selectedDate);
  }, [selectedDate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-nature-800 dark:text-nature-100">{t(`${page}.title`) || 'Stocks'}</h2>
          
          <div className="flex items-center gap-3">
            <span className="text-nature-600 dark:text-nature-300 font-medium">Date:</span>
            <div className="relative">
              <DatePicker 
                selected={selectedDate} 
                onChange={handleDateChange} 
                className="w-full px-4 py-2 bg-white/50 dark:bg-nature-900/50 border border-nature-200 dark:border-nature-700 rounded-xl focus:ring-2 focus:ring-nature-400 focus:border-transparent outline-none transition-all text-nature-800 dark:text-nature-100"
                dateFormat="dd/MM/yyyy"
              />
              <svg className="absolute right-3 top-2.5 w-5 h-5 text-nature-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <Table page="stocks" data={stockData} />
        </div>
      </GlassCard>
    </div>
  );
};

export default StocksPage;