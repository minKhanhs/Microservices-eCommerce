import { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Spin, Carousel, Typography, Input, Tabs, message, Empty } from 'antd';
import { ShoppingCartOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import productApi from '../../api/productApi';
import cartApi from '../../api/cartApi';
import { DEFAULT_PRODUCT_IMG,handleImageError } from '../../utils/constants';

const { Title, Text } = Typography;
const { Meta } = Card;
const { Search } = Input;

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State quản lý tab danh mục đang chọn (null = Tất cả)
  const [activeCategory, setActiveCategory] = useState('all');

  // 1. Load danh mục và sản phẩm ban đầu
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // Gọi song song 2 API để tiết kiệm thời gian
        const [resProducts, resCats] = await Promise.all([
          productApi.getAll(),
          productApi.getAllCategories()
        ]);
        
        setProducts(resProducts.data || resProducts);
        setCategories(resCats.data || resCats);
      } catch (error) {
        console.error(error);
        message.error("Lỗi tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // 2. Xử lý tìm kiếm
  const handleSearch = async (value) => {
    if (!value.trim()) {
        // Nếu search rỗng thì load lại tất cả
        const res = await productApi.getAll();
        setProducts(res.data || res);
        return;
    }
    setLoading(true);
    try {
      const res = await productApi.search(value);
      setProducts(res.data || res);
      setActiveCategory('all'); // Reset tab về tất cả
    } catch (error) {
      message.error("Lỗi tìm kiếm");
    } finally {
      setLoading(false);
    }
  };

  // 3. Xử lý khi bấm chuyển Tab Danh mục
  const handleCategoryChange = async (key) => {
    setActiveCategory(key);
    setLoading(true);
    try {
      let res;
      if (key === 'all') {
        res = await productApi.getAll();
      } else {
        res = await productApi.getByCategory(key);
      }
      setProducts(res.data || res);
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 4. Xử lý Thêm vào giỏ nhanh (Gọi API cartApi)
  const handleQuickAddToCart = async (e, product) => {
    e.stopPropagation(); 
    // 1. Kiểm tra Token chính xác
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        message.warning("Vui lòng đăng nhập để mua hàng!");
        // Lưu lại trang hiện tại để login xong redirect về (tuỳ chọn)
        navigate('/login');
        return;
    }

    try {
        await cartApi.addToCart({
            productId: product.id,
            quantity: 1
        });
        window.dispatchEvent(new Event('CART_UPDATED'));
        message.success("Đã thêm vào giỏ hàng!");
    } catch (error) {
        // 2. Lấy đúng lỗi từ Backend trả về (Text hoặc JSON message)
        const errorMsg = error.response?.data?.message || error.response?.data || "Lỗi không xác định";
        message.error(typeof errorMsg === 'string' ? errorMsg : "Thêm thất bại");
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const banners = [
    "https://img.freepik.com/free-vector/horizontal-banner-online-fashion-sale_23-2148585404.jpg",
    "https://img.freepik.com/free-vector/ecommerce-web-page-concept-illustration_114360-8204.jpg",
  ];

  // Tạo danh sách tab cho Tabs component
  const tabItems = [
     { key: 'all', label: 'Tất cả' },
     ...categories.map(cat => ({ 
         key: cat.id, // Giả sử category có trường id
         label: cat.name 
     }))
  ];

  return (
    <div className="homepage-container bg-gray-50 min-h-screen pb-10">
      {/* Banner */}
      <div className="mb-8 shadow-md">
        <Carousel autoplay>
          {banners.map((img, index) => (
            <div key={index}>
              <img src={img} alt="Banner" className="w-full h-[250px] md:h-[400px] object-cover" />
            </div>
          ))}
        </Carousel>
      </div>

      <div className="container mx-auto px-4">
        {/* THANH CÔNG CỤ: Search + Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8 -mt-16 relative z-10 mx-4 md:mx-0">
            <Row gutter={[16, 16]} align="middle" justify="space-between">
                <Col xs={24} md={10}>
                    <Title level={4} style={{ margin: 0 }}>Khám phá sản phẩm</Title>
                </Col>
                <Col xs={24} md={14}>
                    <Search 
                        placeholder="Tìm kiếm điện thoại, laptop..." 
                        enterButton="Tìm kiếm" 
                        size="large" 
                        onSearch={handleSearch}
                        allowClear
                    />
                </Col>
            </Row>
            
            {/* Tabs Danh mục */}
            <div className="mt-4">
                <Tabs 
                    activeKey={activeCategory} 
                    onChange={handleCategoryChange} 
                    items={tabItems}
                    type="card"
                />
            </div>
        </div>

        {/* DANH SÁCH SẢN PHẨM */}
        {loading ? (
          <div className="flex justify-center py-20"><Spin size="large" /></div>
        ) : products.length === 0 ? (
          <Empty description="Không tìm thấy sản phẩm nào" />
        ) : (
          <Row gutter={[24, 24]}>
            {products.map((product) => (
              <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  className="h-full flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border-0"
                  cover={
                    <div className="relative group overflow-hidden h-[220px] bg-white p-4 flex items-center justify-center">
                      <img
                        alt={product.name}
                        src={product.image ? product.image : DEFAULT_PRODUCT_IMG}
                        onError={handleImageError}
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Overlay buttons */}
                      <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center gap-3 transition-all">
                        <Button 
                            type="default" shape="circle" icon={<EyeOutlined />} size="large"
                            onClick={() => navigate(`/product/${product.id}`)}
                        />
                        <Button 
                            type="primary" shape="circle" icon={<ShoppingCartOutlined />} size="large" danger
                            onClick={(e) => handleQuickAddToCart(e, product)}
                        />
                      </div>
                    </div>
                  }
                  onClick={() => navigate(`/product/${product.id}`)} // Click vào card cũng chuyển trang
                >
                  <Meta
                    title={<div className="truncate font-semibold text-gray-800" title={product.name}>{product.name}</div>}
                    description={
                      <div>
                        <div className="flex justify-between items-end mt-2">
                           <span className="text-red-600 font-bold text-lg">{formatPrice(product.price)}</span>
                           {product.stock <= 0 && <span className="text-xs bg-gray-200 px-2 py-1 rounded">Hết hàng</span>}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default HomePage;