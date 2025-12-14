import { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Spin, Carousel, Typography, Badge, message } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import productApi from '../../api/productApi';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Meta } = Card;

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Gọi API lấy danh sách sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productApi.getAll();
        // Kiểm tra xem backend trả về List trực tiếp hay nằm trong object con
        // Dựa vào code backend của bạn thì nó trả về List<Product> trực tiếp
        setProducts(response.data || response); 
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        message.error("Không thể tải danh sách sản phẩm!");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Hàm format tiền VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Banner quảng cáo (Dữ liệu giả)
  const banners = [
    "https://img.freepik.com/free-vector/horizontal-banner-online-fashion-sale_23-2148585404.jpg",
    "https://img.freepik.com/free-vector/ecommerce-web-page-concept-illustration_114360-8204.jpg",
  ];

  return (
    <div className="homepage-container">
      {/* --- 1. HERO SECTION (BANNER) --- */}
      <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
        <Carousel autoplay>
          {banners.map((img, index) => (
            <div key={index}>
              <img 
                src={img} 
                alt="Banner" 
                className="w-full h-[300px] md:h-[400px] object-cover" 
              />
            </div>
          ))}
        </Carousel>
      </div>

      {/* --- 2. DANH SÁCH SẢN PHẨM --- */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <Title level={2} style={{ color: '#1890ff' }}>Sản Phẩm Mới Nhất</Title>
          <Text type="secondary">Khám phá các sản phẩm công nghệ đỉnh cao với giá tốt nhất</Text>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" tip="Đang tải sản phẩm..." />
          </div>
        ) : (
          <Row gutter={[24, 24]}> {/* Khoảng cách giữa các ô */}
            {products.map((product) => (
              <Col 
                key={product.id} 
                xs={24}   // Mobile: 1 cột (chiếm 24/24 phần)
                sm={12}   // Tablet: 2 cột (chiếm 12/24 phần)
                md={8}    // Laptop nhỏ: 3 cột
                lg={6}    // PC: 4 cột (chiếm 6/24 phần)
              >
                <Card
                  hoverable
                  className="h-full flex flex-col justify-between shadow-sm hover:shadow-xl transition-shadow duration-300"
                  cover={
                    <div className="relative group overflow-hidden h-[200px]">
                      <img
                        alt={product.name}
                        // Vì backend chưa có trường image, dùng ảnh placeholder tạm
                        src={product.image || "https://placehold.co/400x300/png?text=Product+Image"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Nút thao tác nhanh khi hover */}
                      <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center gap-2 transition-all">
                        <Button 
                            type="primary" 
                            shape="circle" 
                            icon={<EyeOutlined />} 
                            onClick={() => navigate(`/product/${product.id}`)}
                        />
                        <Button 
                            type="primary" 
                            danger 
                            shape="circle" 
                            icon={<ShoppingCartOutlined />} 
                            onClick={() => message.success("Đã thêm vào giỏ (Demo)")}
                        />
                      </div>
                    </div>
                  }
                >
                  <Meta
                    title={<div className="truncate text-lg font-semibold">{product.name}</div>}
                    description={
                      <div>
                        <div className="text-red-600 font-bold text-lg my-2">
                          {formatPrice(product.price)}
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Kho: {product.stock}</span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {product.category || "Điện tử"}
                          </span>
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