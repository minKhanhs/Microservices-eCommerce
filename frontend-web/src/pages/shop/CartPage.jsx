import { useEffect, useState, useMemo } from 'react';
import { Table, Button, InputNumber, Typography, message, Card, Empty, Spin, Breadcrumb, Modal } from 'antd';
import { DeleteOutlined, ShoppingOutlined, ArrowRightOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import cartApi from '../../api/cartApi';
import { DEFAULT_PRODUCT_IMG, handleImageError } from '../../utils/constants';

const { Title, Text } = Typography;
const { confirm } = Modal;

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State lưu các ID sản phẩm đang được chọn (Checkbox)
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 1. Load giỏ hàng (Đã sửa để khớp JSON backend)
  const fetchCart = async () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    if (!token) {
        navigate('/login');
        return;
    }

    setLoading(true);
    try {
      const res = await cartApi.getMyCart();
      
      // LOGIC MỚI: Dữ liệu trả về dạng { total:..., items: [...] }
      const data = res.data || {}; 
      const items = data.items || []; // Lấy mảng items từ object cha

      setCartItems(items);
    } catch (error) {
      console.error("Lỗi tải giỏ hàng:", error);
      if (error.response?.status !== 401) {
          message.error("Lỗi tải giỏ hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 2. Tính TỔNG TIỀN THANH TOÁN (Chỉ tính những item ĐƯỢC CHỌN)
  // Backend trả về totalPrice nhưng đó là tổng tất cả. Ở đây ta tính tổng theo checkbox.
  const paymentTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
        if (selectedRowKeys.includes(item.productId)) {
            // Javascript tự động hiểu số 2.0E8 thành 200000000
            return acc + (Number(item.price) * Number(item.quantity));
        }
        return acc;
    }, 0);
  }, [cartItems, selectedRowKeys]);

  // 3. Xử lý Update Số lượng
  const handleQuantityChange = async (newQuantity, record) => {
    if (!newQuantity || newQuantity < 1) return;

    // Optimistic Update: Cập nhật giao diện ngay lập tức
    const oldItems = [...cartItems];
    setCartItems(prev => prev.map(item => 
        item.productId === record.productId 
            ? { ...item, quantity: newQuantity } 
            : item
    ));

    try {
        await cartApi.updateQuantity({
            productId: record.productId,
            quantity: newQuantity
        });
        message.success("Đã cập nhật số lượng");
    } catch (error) {
        console.error(error);
        message.error("Lỗi cập nhật số lượng");
        setCartItems(oldItems); // Rollback nếu lỗi
    }
  };

  // 4. Xử lý Xóa
  const handleDelete = (productIds) => {
    confirm({
        title: 'Xác nhận xóa',
        content: `Bạn muốn xóa ${productIds.length} sản phẩm này?`,
        okText: 'Xóa',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: async () => {
            try {
                // Gửi mảng productIds lên backend để xóa
                await cartApi.removeItems(productIds);
                window.dispatchEvent(new Event('CART_UPDATED'));
                message.success("Đã xóa thành công");
                
                // Cập nhật state local
                setCartItems(prev => prev.filter(item => !productIds.includes(item.productId)));
                setSelectedRowKeys(prev => prev.filter(id => !productIds.includes(id)));
            } catch (error) {
                message.error("Xóa thất bại: " + (error.response?.data?.message || "Lỗi server"));
            }
        }
    });
  };

  // Cấu hình Selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
  };

  const formatPrice = (price) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'product',
      width: '40%',
      render: (text, record) => (
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 border rounded overflow-hidden flex-shrink-0 bg-white">
             {/* Dùng ảnh Mercedes nếu API chưa trả về ảnh */}
             <img 
                src={record.image || DEFAULT_PRODUCT_IMG} 
                onError={handleImageError}
                alt="product" 
                className="w-full h-full object-contain"
             />
          </div>
          <div>
            <Text strong className="text-base block mb-1">{text}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      width: '15%',
      render: (price) => <span className="font-medium">{formatPrice(price)}</span>,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '15%',
      render: (qty, record) => (
        <InputNumber 
            min={1} 
            max={100} 
            value={qty} 
            onChange={(val) => handleQuantityChange(val, record)}
            className="w-20"
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      width: '15%',
      render: (_, record) => (
        <span className="text-red-600 font-bold">
            {formatPrice(record.price * record.quantity)}
        </span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: '10%',
      render: (_, record) => (
        <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete([record.productId])} 
        />
      ),
    },
  ];

  if (loading && cartItems.length === 0) return <div className="h-screen flex justify-center items-center"><Spin size="large" /></div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
        <div className="container mx-auto px-4 py-8">
            <Breadcrumb className="mb-6">
                <Breadcrumb.Item href="/"><HomeOutlined /> Trang chủ</Breadcrumb.Item>
                <Breadcrumb.Item>Giỏ hàng</Breadcrumb.Item>
            </Breadcrumb>

            <Title level={2} className="mb-6 flex items-center gap-3">
                <ShoppingOutlined className="text-blue-600"/> Giỏ hàng
            </Title>

            {cartItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                   <Empty description="Giỏ hàng trống" />
                   <Button type="primary" className="mt-4" onClick={() => navigate('/')}>Mua sắm ngay</Button>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* BẢNG SẢN PHẨM */}
                  <div className="flex-1">
                     <div className="mb-4 flex justify-between items-center">
                        <span className="text-gray-500">Đã chọn {selectedRowKeys.length} sản phẩm</span>
                        {selectedRowKeys.length > 0 && (
                            <Button 
                                type="link" 
                                danger 
                                icon={<DeleteOutlined />} 
                                onClick={() => handleDelete(selectedRowKeys)}
                            >
                                Xóa {selectedRowKeys.length} mục đã chọn
                            </Button>
                        )}
                     </div>

                     <Table 
                        rowSelection={rowSelection} 
                        columns={columns} 
                        dataSource={cartItems} 
                        rowKey="productId" // QUAN TRỌNG: Dùng productId làm key định danh cho checkbox
                        pagination={false}
                        className="shadow-sm rounded-lg overflow-hidden bg-white"
                        scroll={{ x: 600 }}
                     />
                  </div>

                  {/* BOX THANH TOÁN */}
                  <div className="w-full lg:w-[380px]">
                     <Card className="shadow-sm rounded-lg sticky top-6 border-0">
                        <Title level={4} className="mb-6">Thanh toán</Title>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center text-gray-600">
                                <Text>Tạm tính:</Text>
                                {/* Hiển thị tổng tiền theo các món ĐANG CHỌN */}
                                <Text className="font-medium">{formatPrice(paymentTotal)}</Text>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <Text className="text-lg font-semibold">Tổng cộng:</Text>
                                <div className="text-right">
                                    <Text className="text-2xl text-red-600 font-bold block">
                                        {formatPrice(paymentTotal)}
                                    </Text>
                                    <Text type="secondary" className="text-xs">(Đã bao gồm VAT)</Text>
                                </div>
                            </div>
                        </div>
                        
                        <Button 
                            type="primary" 
                            size="large" 
                            block 
                            icon={<ArrowRightOutlined />}
                            className="h-12 text-lg bg-red-600 hover:bg-red-700 border-red-600"
                            disabled={selectedRowKeys.length === 0} 
                            onClick={() => {
                                // Lọc ra các item được chọn để truyền sang checkout
                                const itemsToCheckout = cartItems.filter(item => selectedRowKeys.includes(item.productId));
                                
                                navigate('/checkout', { 
                                    state: { 
                                        type: 'cart',
                                        selectedProductIds: selectedRowKeys,
                                        items: itemsToCheckout,
                                        total: paymentTotal 
                                    } 
                                });
                            }}
                        >
                            MUA HÀNG ({selectedRowKeys.length})
                        </Button>
                     </Card>
                  </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default CartPage;