import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Select, message, Card, Space, Typography, Avatar } from 'antd';
import { EyeOutlined, UserOutlined, ClockCircleOutlined, EnvironmentOutlined, PhoneOutlined } from '@ant-design/icons';
import adminApi from '../../api/adminApi';

const { Option } = Select;
const { Text, Title } = Typography;

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State lưu map: userId -> "Tên User" (Cache để không gọi API nhiều lần)
  const [userMap, setUserMap] = useState({}); 

  // Modal chi tiết
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 1. Load danh sách đơn hàng
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllOrders();
      // Dữ liệu Spring Page thường nằm trong res.data.content
      const orderList = res.data.content || res.data || [];
      setOrders(orderList);

      // --- KỸ THUẬT LẤY TÊN USER (Resolve User Names) ---
      // Lọc ra các userId duy nhất để tránh gọi trùng
      const uniqueUserIds = [...new Set(orderList.map(o => o.userId))];
      
      // Chỉ gọi API cho những user chưa có trong userMap
      const idsToFetch = uniqueUserIds.filter(id => !userMap[id]);

      if (idsToFetch.length > 0) {
        // Gọi song song (Parallel) để nhanh hơn
        const userPromises = idsToFetch.map(id => adminApi.getUserById(id));
        const userResponses = await Promise.all(userPromises);
        
        // Cập nhật vào Map
        const newUserMap = { ...userMap };
        userResponses.forEach((uRes, index) => {
           // Giả sử API user trả về object { id, username, fullName ... }
           // Chúng ta ưu tiên hiển thị fullName, nếu không có thì lấy username
           const userData = uRes.data;
           newUserMap[idsToFetch[index]] = userData.fullName || userData.username || "Unknown";
        });
        setUserMap(newUserMap);
      }

    } catch (error) {
      console.error(error);
      message.error("Lỗi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Cập nhật trạng thái đơn
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      message.success(`Đã cập nhật trạng thái: ${newStatus}`);
      
      // Update local state để không cần reload lại trang
      setOrders(prev => prev.map(o => 
        o.orderId === orderId ? { ...o, status: newStatus } : o
      ));
      
      // Nếu đang mở modal thì update luôn modal
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      message.error("Cập nhật thất bại!");
    }
  };

  // 3. Helper hiển thị màu trạng thái
  const getStatusTag = (status) => {
    switch (status) {
      case 'PENDING': return <Tag color="orange">Chờ xử lý</Tag>;
      case 'CONFIRMED': return <Tag color="blue">Đã xác nhận</Tag>;
      case 'SHIPPED': return <Tag color="cyan">Đang giao</Tag>;
      case 'DELIVERED': return <Tag color="green">Đã giao</Tag>;
      case 'CANCELLED': return <Tag color="red">Đã hủy</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const formatDate = (dateStr) => new Date(dateStr).toLocaleString('vi-VN');

  // 4. Cấu hình bảng
  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (id) => <Text code copyable>{id.substring(0, 8)}...</Text>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userId',
      key: 'userId',
      render: (uid) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          {/* Lấy tên từ Map, nếu chưa load xong thì hiện Loading */}
          <span className="font-medium">{userMap[uid] || <span className="text-gray-400">Đang tải...</span>}</span>
        </Space>
      )
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <span className="text-xs text-gray-500">{formatDate(date)}</span>
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <span className="font-bold text-blue-600">{formatPrice(amount)}</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
            type="text" 
            icon={<EyeOutlined />} 
            className="text-blue-600"
            onClick={() => {
                setSelectedOrder(record);
                setIsModalOpen(true);
            }}
        >
            Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 border-l-4 border-blue-600 pl-3">Quản lý Đơn hàng</h2>
      
      <Table 
        columns={columns} 
        dataSource={orders} 
        rowKey="orderId" 
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      <Modal
        title={`Chi tiết đơn hàng`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Thông tin chung */}
            <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-start">
               <div>
                  <p><span className="font-semibold"><UserOutlined/> Khách hàng:</span> {userMap[selectedOrder.userId]}</p>
                  <p><span className="font-semibold"><PhoneOutlined/> SĐT:</span> {selectedOrder.phone}</p>
                  <p><span className="font-semibold"><EnvironmentOutlined/> Địa chỉ:</span> {selectedOrder.shippingAddress}</p>
                  <p><span className="font-semibold"><ClockCircleOutlined/> Ngày đặt:</span> {formatDate(selectedOrder.createdAt)}</p>
               </div>
               <div className="text-right">
                  <p className="font-bold text-lg text-blue-600">{formatPrice(selectedOrder.totalAmount)}</p>
                  <div className="mt-2">
                     <span className="mr-2 font-semibold">Cập nhật trạng thái:</span>
                     <Select 
                        defaultValue={selectedOrder.status} 
                        style={{ width: 140 }}
                        onChange={(val) => handleUpdateStatus(selectedOrder.orderId, val)}
                     >
                        <Option value="PENDING">Chờ xử lí</Option>
                        <Option value="CONFIRMED">Đã xác nhận</Option>
                        <Option value="SHIPPED">Đang giao</Option>
                        <Option value="DELIVERED">Đã giao</Option>
                        <Option value="CANCELLED">Đã hủy</Option>
                     </Select>
                  </div>
               </div>
            </div>

            {/* Danh sách sản phẩm */}
            <h4 className="font-bold border-b pb-2">Sản phẩm đã đặt</h4>
            <div className="space-y-3">
                {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-dashed pb-2 last:border-0">
                        <div className="flex gap-3">
                           {/* Nếu có ảnh thì hiện ảnh, không thì hiện icon box */}
                           <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center font-bold text-gray-500">
                              IMG
                           </div>
                           <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-xs text-gray-500">Mã SP: {item.productId}</p>
                           </div>
                        </div>
                        <div className="text-right">
                            <p>x{item.quantity}</p>
                            <p className="font-semibold">{formatPrice(item.price)}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManager;