import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Table from '../components/Table';
import { fetchStocks } from '../api/stockAPI';
import { useTranslation } from 'react-i18next';

const StocksPage = () => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stockData, setStockData] = useState([]);

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

  // Fetch initial data with the current date
  React.useEffect(() => {
    fetchStockData(selectedDate);
  }, [selectedDate]);

  return (
    <div className="container-fluid mt-4 p-4 fade-in-up delay-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 text-primary mb-0 fw-bold">{t('Stocks Management') || 'Stocks Management'}</h2>
        <div className="d-flex align-items-center bg-white p-2 rounded-pill shadow-sm">
          <DatePicker selected={selectedDate} onChange={handleDateChange} className="form-control border-0 bg-transparent fw-bold" />
        </div>
      </div>
      <div className="row fade-in-up delay-2">
        <div className="col-12">
          <Table page="stocks" data={stockData} />
        </div>
      </div>
    </div>
  );
};

export default StocksPage;