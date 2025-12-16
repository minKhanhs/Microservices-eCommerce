import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, Table, Tag, Button, message, Spin, Popconfirm, Breadcrumb, Divider 
} from 'antd';
import { 
    ArrowLeftOutlined, HomeOutlined, ShoppingOutlined, 
    EnvironmentOutlined, PhoneOutlined, SolutionOutlined 
} from '@ant-design/icons';
import orderApi from '../../api/orderApi';
import dayjs from 'dayjs';
import { DEFAULT_PRODUCT_IMG, handleImageError } from '../../utils/constants';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  // 1. Load chi tiết đơn
  const fetchOrderDetail = async () => {
    try {
      const res = await orderApi.getById(orderId);
      // API trả về trực tiếp object order
      setOrder(res.data || res);
    } catch (error) {
      console.error(error);
      message.error("Không tìm thấy đơn hàng");
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  // 2. Xử lý Hủy đơn
  const handleCancelOrder = async () => {
    setCanceling(true);
    try {
        await orderApi.cancelOrder(orderId);
        message.success("Đã hủy đơn hàng thành công");
        fetchOrderDetail(); // Reload lại để cập nhật trạng thái
    } catch (error) {
        const msg = error.response?.data?.message || "Hủy đơn thất bại";
        message.error(msg);
    } finally {
        setCanceling(false);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getStatusTag = (status) => {
    switch (status) {
      case 'PENDING': return <Tag color="orange" className="text-base px-3 py-1">Chờ xử lý</Tag>;
      case 'CONFIRMED': return <Tag color="blue" className="text-base px-3 py-1">Đã xác nhận</Tag>;
      case 'SHIPPING': 
      case 'SHIPPED': return <Tag color="cyan" className="text-base px-3 py-1">Đang giao hàng</Tag>;
      case 'DELIVERED': 
      case 'COMPLETED': return <Tag color="green" className="text-base px-3 py-1">Hoàn thành</Tag>;
      case 'CANCELLED': return <Tag color="red" className="text-base px-3 py-1">Đã hủy</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
        title: 'Sản phẩm',
        dataIndex: 'productName',
        key: 'product',
        render: (text, record) => (
            <div className="flex items-center gap-3">
                {/* JSON items không có ảnh, dùng ảnh mặc định */}
                <img 
                    src={DEFAULT_PRODUCT_IMG} 
                    onError={handleImageError}
                    alt="img" 
                    className="w-16 h-16 object-cover rounded border bg-white"
                />
                <div>
                    <span className="font-medium text-base block">{text}</span>
                    <span className="text-xs text-gray-500">Mã SP: {record.productId}</span>
                </div>
            </div>
        )
    },
    { 
        title: 'Đơn giá', 
        dataIndex: 'price', 
        key: 'price', 
        render: (price) => formatPrice(price) 
    },
    { 
        title: 'Số lượng', 
        dataIndex: 'quantity', 
        key: 'quantity', 
        align: 'center' 
    },
    { 
        title: 'Tạm tính', 
        key: 'total', 
        align: 'right',
        render: (_, record) => <span className="font-bold text-red-600">{formatPrice(record.price * record.quantity)}</span> 
    }
  ];

  if (loading) return <div className="h-screen flex justify-center items-center"><Spin size="large" /></div>;
  if (!order) return null;

  // Chỉ cho phép hủy nếu trạng thái là PENDING
  const canCancel = order.status === 'PENDING';

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item href="/"><HomeOutlined /> Trang chủ</Breadcrumb.Item>
        <Breadcrumb.Item href="/orders">Lịch sử đơn hàng</Breadcrumb.Item>
        <Breadcrumb.Item>Chi tiết</Breadcrumb.Item>
      </Breadcrumb>

      <div className="max-w-5xl mx-auto">
        {/* HEADER ĐƠN HÀNG */}
        <Card className="shadow-sm mb-6 border-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold mb-1">Đơn hàng</h2>
                    <p className="text-gray-500">Đặt ngày: {dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                </div>
                <div className="flex items-center gap-4">
                    {getStatusTag(order.status)}
                    
                    {canCancel && (
                        <Popconfirm
                            title="Hủy đơn hàng?"
                            description="Hành động này không thể hoàn tác"
                            onConfirm={handleCancelOrder}
                            okText="Đồng ý hủy"
                            cancelText="Không"
                            okButtonProps={{ danger: true, loading: canceling }}
                        >
                            <Button danger type="primary">Hủy đơn hàng</Button>
                        </Popconfirm>
                    )}
                </div>
            </div>
        </Card>

        {/* THÔNG TIN NHẬN HÀNG (JSON không có fullname/email nên dùng phone/address) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card title={<><SolutionOutlined/> Thông tin liên hệ</>} className="shadow-sm border-0 h-full">
                <p className="mb-2"><span className="text-gray-500">Số điện thoại:</span> <span className="font-bold">{order.phone}</span></p>
            </Card>
            
            <Card title={<><EnvironmentOutlined/> Địa chỉ giao hàng</>} className="shadow-sm border-0 h-full">
                <p className="font-medium text-lg">{order.shippingAddress}</p>
                <p className="text-gray-500 mt-2 text-sm italic">
                    (Vui lòng chú ý điện thoại, nhân viên giao hàng sẽ liên hệ)
                </p>
            </Card>
        </div>

        {/* DANH SÁCH SẢN PHẨM */}
        <Card title={<><ShoppingOutlined/> Chi tiết sản phẩm</>} className="shadow-sm border-0 mb-6">
            <Table 
                columns={columns} 
                dataSource={order.items || []} 
                rowKey="itemId" // JSON trả về itemId, dùng làm key
                pagination={false}
            />
            
            <Divider />
            
            <div className="flex justify-end">
                <div className="w-full md:w-1/3 space-y-3">
                    <div className="flex justify-between text-gray-600">
                        <span>Tạm tính:</span>
                        <span>{formatPrice(order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Phí vận chuyển:</span>
                        <span>0 ₫</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-red-600 border-t pt-3">
                        <span>Tổng thanh toán:</span>
                        <span>{formatPrice(order.totalAmount)}</span>
                    </div>
                </div>
            </div>
        </Card>

        <Button icon={<ArrowLeftOutlined/>} onClick={() => navigate('/orders')}>
            Quay lại danh sách
        </Button>
      </div>
    </div>
  );
};

export default OrderDetailPage;