import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, DatePicker, message, Spin, Tag, Tooltip } from 'antd';
import { 
  DollarCircleOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  DropboxOutlined, 
  RiseOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import adminApi from '../../api/adminApi';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  
  // State lưu số liệu tổng quan (Cập nhật thêm các trường chi tiết đơn hàng)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    newUsers: 0
  });

  const [revenueData, setRevenueData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // 1. Hàm load số liệu tổng quan
  const fetchGeneralStats = async () => {
    setLoading(true);
    try {
      const [resOrderStats, resProductCount, resUserTotal, resUserNew, resLowStock] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getTotalProductCount(),
        adminApi.getTotalUsers(),
        adminApi.getNewUsersThisMonth(),
        adminApi.getLowStock()
      ]);

      const orderData = resOrderStats?.data || {};

      setStats({
        // Map đúng key: totalRevenue
        totalRevenue: orderData.totalRevenue || 0,
        totalOrders: orderData.totalOrders || 0,
        pendingOrders: orderData.pendingOrders || 0,
        completedOrders: orderData.completedOrders || 0,
        cancelledOrders: orderData.cancelledOrders || 0,

        // Các thống kê khác
        totalProducts: (typeof resProductCount.data === 'number') ? resProductCount.data : (resProductCount.data?.count || 0),
        totalUsers: (typeof resUserTotal.data === 'number') ? resUserTotal.data : (resUserTotal.data?.count || 0),
        newUsers: (typeof resUserNew.data === 'number') ? resUserNew.data : (resUserNew.data?.count || 0),
      });

      setLowStockProducts(Array.isArray(resLowStock.data) ? resLowStock.data : []);
    } catch (error) {
      console.error("Lỗi tải dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Hàm load biểu đồ (Logic xử lý Object -> Array đã làm ở bước trước)
  const fetchChartData = async (date) => {
    try {
      const month = date.month() + 1;
      const year = date.year();
      
      const res = await adminApi.getRevenueChart(month, year);
      const rawData = res.data || {}; 

      const chartData = Object.keys(rawData)
        .map(key => ({
            day: parseInt(key),
            revenue: rawData[key]
        }))
        .sort((a, b) => a.day - b.day)
        .map(item => ({
            name: `${item.day}/${month}`,
            doanhThu: item.revenue
        }));

      setRevenueData(chartData);
    } catch (error) {
      console.error("Lỗi tải biểu đồ:", error);
    }
  };

  useEffect(() => {
    fetchGeneralStats();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchChartData(selectedDate);
    }
  }, [selectedDate]);

  const formatCurrency = (value) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 1,
      maximumFractionDigits: 2 }).format(value);

  return (
    <div className="p-2">
      <h2 className="text-xl font-bold mb-6">Tổng quan hệ thống</h2>

      <Spin spinning={loading}>
        <Row gutter={16} className="shrink-0">
          {/* 1. DOANH THU */}
          <Col span={6}>
            <Card variant="borderless" className="shadow-sm h-full">
              <Statistic
                title="Doanh thu tổng"
                value={stats.totalRevenue}
                precision={2}
                styles={{ content: { color: '#3f8600', fontWeight: 'bold' } }}
                prefix={<DollarCircleOutlined />}
                suffix="₫"
                formatter={(val) => formatCurrency(val).replace('₫', '')}
              />
            </Card>
          </Col>

          {/* 2. SẢN PHẨM */}
          <Col span={6}>
            <Card variant="borderless" className="shadow-sm h-full">
              <Statistic
                title="Tổng sản phẩm"
                value={stats.totalProducts}
                styles={{ content: { color: '#1677ff' } }}
                prefix={<DropboxOutlined />}
              />
            </Card>
          </Col>

          {/* 3. USER */}
          <Col span={6}>
            <Card variant="borderless" className="shadow-sm h-full">
              <Statistic
                title="Tổng người dùng"
                value={stats.totalUsers}
                prefix={<UserOutlined />}
              />
              <div className="text-xs text-gray-500 mt-2">
                 <RiseOutlined className="text-green-500 mr-1"/> 
                 +{stats.newUsers} user mới tháng này
              </div>
            </Card>
          </Col>

          {/* 4. ĐƠN HÀNG (Đã nâng cấp hiển thị chi tiết) */}
          <Col span={6}>
             <Card variant="borderless" className="shadow-sm h-full">
              <Statistic
                title="Tổng đơn hàng"
                value={stats.totalOrders}
                prefix={<ShoppingCartOutlined />}
                styles={{ content: { color: '#cf1322' } }}
              />
              {/* Hiển thị thêm chi tiết trạng thái đơn */}
              <div className="flex gap-1 mt-2">
                  <Tooltip title="Đơn chờ xử lý">
                    <Tag color="orange" icon={<SyncOutlined spin />}>{stats.pendingOrders}</Tag>
                  </Tooltip>
                  <Tooltip title="Đơn hoàn thành">
                    <Tag color="green" icon={<CheckCircleOutlined />}>{stats.completedOrders}</Tag>
                  </Tooltip>
                  <Tooltip title="Đơn đã hủy">
                    <Tag color="red" icon={<CloseCircleOutlined />}>{stats.cancelledOrders}</Tag>
                  </Tooltip>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Biểu đồ Doanh thu */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm flex flex-col min-h-0">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Biểu đồ doanh thu ngày</h3>
              <DatePicker 
                picker="month" 
                value={selectedDate} 
                onChange={(date) => setSelectedDate(date)} 
                format="MM/YYYY"
                allowClear={false}
              />
           </div>
           
           <div className="flex-1 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={revenueData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="name" />
                 <YAxis tickFormatter={(val) => val >= 1000000 ? `${val/1000000}M` : val} />
                 <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                 <Legend />
                 <Bar dataKey="doanhThu" name="Doanh thu (VND)" fill="#1677ff" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Bảng Sắp hết hàng */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col min-h-0">
           <h3 className="text-lg font-bold mb-4 text-red-600">Sản phẩm sắp hết hàng</h3>
           <Table
             dataSource={lowStockProducts}
             rowKey="id"
             pagination={{ pageSize: 5, size: 'small' }}
             size="small"
             columns={[
               {
                 title: 'Sản phẩm',
                 dataIndex: 'name', 
                 key: 'name',
                 render: (text) => <span className="font-medium line-clamp-1">{text}</span>
               },
               {
                 title: 'SL',
                 dataIndex: 'stock',
                 key: 'stock',
                 width: 60,
                 render: (sl) => <Tag color="red">{sl}</Tag>
               }
             ]}
           />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;