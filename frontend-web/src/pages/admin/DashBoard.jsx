import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Gọi API thống kê tổng quan (Order Service)
        const resStats = await axiosClient.get('/api/orders/admin/dashboard');
        setStats(resStats.data);

        // 2. Gọi API biểu đồ doanh thu (Order Service)
        const resChart = await axiosClient.get('/api/orders/admin/revenue-daily?month=12&year=2025');
        
        // Convert dữ liệu Map object sang Array cho Recharts vẽ
        const chartArray = Object.keys(resChart.data).map(day => ({
            name: `Ngày ${day}`,
            total: resChart.data[day]
        }));
        setRevenueData(chartArray);

      } catch (error) {
        console.error("Lỗi tải dashboard", error);
      }
    };
    fetchData();
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard Thống Kê</h2>
      
      {/* 3 Thẻ thống kê */}
      <Row gutter={16} style={{ marginBottom: 30 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Doanh thu" value={stats.totalRevenue} prefix={<DollarOutlined />} precision={2} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Tổng đơn hàng" value={stats.totalOrders} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
            <Card>
                <Statistic title="Đơn chờ xử lý" value={stats.pendingOrders} valueStyle={{ color: '#cf1322' }} />
            </Card>
        </Col>
      </Row>

      {/* Biểu đồ */}
      <h3>Biểu đồ doanh thu tháng 12</h3>
      <BarChart width={800} height={300} data={revenueData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

export default Dashboard;