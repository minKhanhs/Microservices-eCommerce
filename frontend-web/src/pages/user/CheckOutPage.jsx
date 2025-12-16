import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Row, Col, Card, Radio, Button, Typography, 
  message, Divider, Space, List, Tag, Spin 
} from 'antd';
import { 
  EnvironmentOutlined, CreditCardOutlined, 
  ShoppingOutlined, CheckCircleOutlined, PlusOutlined 
} from '@ant-design/icons';
import userApi from '../../api/userApi';     // API User
import orderApi from '../../api/orderApi';   // API Order
import paymentApi from '../../api/paymentApi'; // API Payment
import { DEFAULT_PRODUCT_IMG, handleImageError } from '../../utils/constants';

const { Title, Text } = Typography;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const checkoutData = location.state;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD'); 
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // 1. Load Profile để lấy danh sách địa chỉ
  useEffect(() => {
    if (!checkoutData) {
        message.error("Dữ liệu thanh toán không hợp lệ");
        navigate('/');
        return;
    }

    const fetchUserProfile = async () => {
        try {
            // Thay vì gọi getAddresses, ta gọi getProfile
            const res = await userApi.getProfile();
            const userData = res.data || res; 
            
            // Lấy trực tiếp mảng addresses từ response profile
            const userAddresses = userData.addresses || [];
            setAddresses(userAddresses);
            
            // Chọn mặc định địa chỉ đầu tiên
            if (userAddresses.length > 0) {
                setSelectedAddressId(userAddresses[0].id);
            }
        } catch (error) {
            console.error("Lỗi lấy thông tin người dùng:", error);
            message.warning("Vui lòng thêm địa chỉ giao hàng trong hồ sơ");
        } finally {
            setInitializing(false);
        }
    };

    fetchUserProfile();
  }, [navigate, checkoutData]);

  // 2. Xử lý Đặt hàng & Thanh toán (Giữ nguyên logic cũ)
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
        message.error("Vui lòng chọn địa chỉ nhận hàng!");
        return;
    }

    setLoading(true);
    try {
        let orderResponse; 
        
        // --- GỌI API ĐẶT HÀNG ---
        if (checkoutData.type === 'buy-now') {
            orderResponse = await orderApi.placeOrderBuyNow({
                productId: checkoutData.productId,
                quantity: checkoutData.quantity,
                addressId: selectedAddressId
            });
        } else {
            orderResponse = await orderApi.placeOrderCart({
                selectedProductIds: checkoutData.selectedProductIds,
                addressId: selectedAddressId
            });
        }

        const orderId = orderResponse.data?.orderId || orderResponse.data?.id;

        message.success("Đặt hàng thành công!");

        // --- GỌI API THANH TOÁN ---
        if (paymentMethod === 'VNPAY') {
            const paymentRes = await paymentApi.createPayment({
                orderId: orderId,
                paymentMethod: "VNPAY"
            });

            const paymentUrl = paymentRes.data?.url || paymentRes.data;
            if (paymentUrl) {
                window.location.href = paymentUrl;
            } else {
                message.warning("Lỗi lấy link thanh toán. Vui lòng kiểm tra lại đơn hàng.");
                navigate('/orders');
            }
        } else {
            // COD
            navigate('/orders');
        }

    } catch (error) {
        console.error(error);
        const errorMsg = error.response?.data?.message || "Đặt hàng thất bại";
        message.error(errorMsg);
    } finally {
        setLoading(false);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (initializing) return <div className="h-screen flex justify-center items-center"><Spin size="large" /></div>;
  if (!checkoutData) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Title level={2} className="mb-6 flex items-center gap-2">
            <CheckCircleOutlined className="text-blue-600"/> Thanh toán
        </Title>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            
            {/* DANH SÁCH ĐỊA CHỈ TỪ PROFILE */}
            <Card 
                title={<><EnvironmentOutlined/> Địa chỉ nhận hàng</>} 
                className="shadow-sm mb-6 border-0"
                extra={<Button type="link" icon={<PlusOutlined/>} onClick={() => navigate('/profile')}>Quản lý địa chỉ</Button>}
            >
                {addresses.length === 0 ? (
                    <div className="text-center py-4">
                        <Text type="secondary">Bạn chưa có địa chỉ nào.</Text>
                        <Button type="primary" className="mt-2 block mx-auto" onClick={() => navigate('/profile')}>Thêm địa chỉ ngay</Button>
                    </div>
                ) : (
                    <Radio.Group 
                        className="w-full" 
                        value={selectedAddressId} 
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                    >
                        <List
                            dataSource={addresses}
                            renderItem={item => (
                                <List.Item className="border-b last:border-0 p-3 hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedAddressId(item.id)}>
                                    <Radio value={item.id} className="w-full pointer-events-none"> {/* Radio chỉ hiển thị, click xử lý ở List Item */}
                                        <div className="ml-2 pointer-events-auto">
                                            <div className="font-bold text-gray-800">
                                                {/* Ưu tiên hiển thị fullAddress nếu có */}
                                                {item.fullAddress}
                                            </div>
                                            {/* Fallback hiển thị chi tiết nếu fullAddress null */}
                                            {!item.fullAddress && (
                                                <div className="text-gray-500 text-sm">
                                                    {item.street}, {item.district}, {item.city}
                                                </div>
                                            )}
                                        </div>
                                    </Radio>
                                </List.Item>
                            )}
                        />
                    </Radio.Group>
                )}
            </Card>

            {/* PHƯƠNG THỨC THANH TOÁN */}
            <Card title={<><CreditCardOutlined/> Phương thức thanh toán</>} className="shadow-sm border-0">
                <Radio.Group 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="flex flex-col gap-4"
                >
                    <Radio value="COD" className=" p-4 rounded hover:border-blue-500 transition bg-white">
                        <Space align="start">
                            <div>
                                <div className="font-bold">Thanh toán khi nhận hàng (COD)</div>
                                <div className="text-xs text-gray-500">Thanh toán tiền mặt cho shipper khi nhận được hàng</div>
                            </div>
                        </Space>
                    </Radio>
                    
                    <Radio value="VNPAY" className="p-4 rounded hover:border-blue-500 transition bg-white">
                        <Space align="start">
                            <div>
                                <div className="font-bold">Thanh toán qua VNPAY</div>
                                <div className="text-xs text-gray-500">Quét mã QR, thẻ ATM/Visa nội địa & quốc tế</div>
                            </div>
                        </Space>
                    </Radio>
                </Radio.Group>
            </Card>
          </Col>

          {/* CỘT PHẢI: TỔNG KẾT ĐƠN HÀNG */}
          <Col xs={24} md={8}>
             <Card title={<><ShoppingOutlined/> Đơn hàng</>} className="shadow-sm border-0 sticky top-4">
                <div className="max-h-[350px] overflow-y-auto mb-4 pr-1 custom-scrollbar">
                    {checkoutData.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 mb-4 pb-4 border-b last:border-0 last:mb-0">
                            <div className="w-16 h-16 border rounded overflow-hidden bg-white flex-shrink-0">
                                <img 
                                    src={item.image || DEFAULT_PRODUCT_IMG} 
                                    onError={handleImageError}
                                    className="w-full h-full object-contain" 
                                    alt="prod"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium line-clamp-2 text-sm text-gray-800">
                                    {item.name || item.productName}
                                </div>
                                <div className="flex justify-between mt-1 text-sm">
                                    <span className="text-gray-500">x{item.quantity}</span>
                                    <span className="font-semibold">{formatPrice(item.price)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Divider />

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>Tạm tính:</span>
                        <span>{formatPrice(checkoutData.total)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-4">
                        <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-red-600 block">
                                {formatPrice(checkoutData.total)}
                            </span>
                            <span className="text-xs text-gray-400">(VAT included)</span>
                        </div>
                    </div>
                </div>

                <Button 
                    type="primary" 
                    size="large" 
                    block
                    className="h-12 text-lg bg-red-600 hover:bg-red-700 border-red-600 shadow-md font-bold"
                    onClick={handlePlaceOrder}
                    loading={loading}
                    disabled={addresses.length === 0}
                >
                    ĐẶT HÀNG
                </Button>
             </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CheckoutPage;