import { useEffect, useState } from 'react';
import { Table, Tag, Button, Typography, message, Card, Empty, Spin, Breadcrumb } from 'antd';
import { EyeOutlined, HistoryOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import orderApi from '../../api/orderApi';
import dayjs from 'dayjs';

const { Title } = Typography;

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams()
  const [pagination, setPagination] = useState({
      current: 1,
      pageSize: 10,
      total: 0
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getMyOrders();
      // LOGIC MỚI: Dữ liệu nằm trong res.data.content
      const data = res.data || {};
      const orderList = data.content || [];
      
      setOrders(orderList);
      
      // Cập nhật phân trang (nếu muốn dùng sau này)
      setPagination({
          current: data.number + 1, // Spring boot page bắt đầu từ 0
          pageSize: data.size,
          total: data.totalElements
      });

    } catch (error) {
      console.error(error);
      if(error.response?.status !== 401) {
          message.error("Lỗi tải lịch sử đơn hàng");
      }
    } finally {
      setLoading(false);
    }
  };
    useEffect(() => {
        const status = searchParams.get('paymentStatus');

        if (status) {
            if (status === 'success') {
                message.success("Thanh toán thành công! Đơn hàng đã được xác nhận.", 5);
                // Reload lại danh sách đơn hàng để cập nhật trạng thái mới
                fetchOrders();
            } else if (status === 'failed') {
                message.error("Thanh toán thất bại hoặc bị hủy.", 5);
            } else if (status === 'error') {
                message.error("Có lỗi xảy ra trong quá trình xử lý thanh toán.", 5);
            }

            // 4. Xóa query param trên URL để người dùng F5 không bị hiện lại thông báo
            // Xóa ?paymentStatus=... giữ lại đường dẫn sạch /orders
            setSearchParams({});
        }
    }, [searchParams]);
  useEffect(() => {
    fetchOrders();
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  
  const getStatusTag = (status) => {
    switch (status) {
      case 'PENDING': return <Tag color="orange">Chờ xử lý</Tag>;
      case 'CONFIRMED': return <Tag color="blue">Đã xác nhận</Tag>;
      case 'SHIPPING': 
      case 'SHIPPED': return <Tag color="cyan">Đang giao</Tag>;
      case 'COMPLETED': 
      case 'DELIVERED': return <Tag color="green">Hoàn thành</Tag>;
      case 'CANCELLED': return <Tag color="red">Đã hủy</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (id) => <span className="font-mono text-gray-500">#{id ? id.substring(0, 8) : '...'}</span>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      // Format ngày giờ từ chuỗi ISO
      render: (date) => <span className="text-gray-700">{dayjs(date).format('DD/MM/YYYY HH:mm')}</span>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <span className="font-bold text-red-600">{formatPrice(amount)}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => (
        <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/order/${record.orderId}`)}
        >
            Chi tiết
        </Button>
      ),
    },
  ];

  if (loading && orders.length === 0) return <div className="h-screen flex justify-center items-center"><Spin size="large" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <Breadcrumb className="mb-6">
          <Breadcrumb.Item href="/"><HomeOutlined /> Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item>Lịch sử đơn hàng</Breadcrumb.Item>
      </Breadcrumb>

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
            <HistoryOutlined className="text-2xl text-blue-600"/>
            <Title level={3} style={{ margin: 0 }}>Đơn hàng của tôi</Title>
        </div>

        {orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                <Empty description="Bạn chưa có đơn hàng nào" />
                <Button type="primary" className="mt-4" onClick={() => navigate('/')}>Mua sắm ngay</Button>
            </div>
        ) : (
            <Card className="shadow-sm border-0 rounded-lg overflow-hidden">
                <Table 
                    columns={columns} 
                    dataSource={orders} 
                    rowKey="orderId"
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        onChange: (page) => {
                             // Nếu muốn làm phân trang server-side thì gọi API tại đây
                             // Hiện tại backend bạn trả về page 0, ta tạm dùng client pagination cho đơn giản nếu ít đơn
                        }
                    }}
                />
            </Card>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;