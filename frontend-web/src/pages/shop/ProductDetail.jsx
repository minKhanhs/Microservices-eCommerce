import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Button, InputNumber, Divider, message, Spin, Breadcrumb, Card } from 'antd';
import { ShoppingCartOutlined, HomeOutlined, SafetyCertificateOutlined, SyncOutlined, ThunderboltOutlined } from '@ant-design/icons';
import productApi from '../../api/productApi';
import cartApi from '../../api/cartApi';
import { DEFAULT_PRODUCT_IMG, handleImageError } from '../../utils/constants';

const { Title, Text, Paragraph } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // useEffect: Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const res = await productApi.getById(id);
        const productData = res.data || res;
        setProduct(productData);

        // Fetch related products based on categoryId
        if (productData.categoryId) { 
            const resRelated = await productApi.getByCategory(productData.categoryId);
            const related = (resRelated.data || resRelated).filter(p => p.id !== productData.id).slice(0, 4);
            setRelatedProducts(related);
        }
      } catch (error) {
        message.error("Không tìm thấy sản phẩm!");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  // --- Helper function to check login status ---
  const checkLogin = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    if (!token) {
        message.warning("Vui lòng đăng nhập để mua hàng");
        navigate('/login');
        return false;
    }
    return true;
  };

  // --- Handler: Add to Cart ---
  const handleAddToCart = async () => {
    if (!checkLogin()) return;

    try {
        await cartApi.addToCart({
            productId: product.id,
            quantity: quantity
        });
        message.success("Đã thêm vào giỏ hàng thành công!");
        window.dispatchEvent(new Event('CART_UPDATED')); // Notify header to update cart count
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data || "Lỗi hệ thống";
        message.error(errorMsg);
    }
  };

  // --- Handler: Buy Now ---
  const handleBuyNow = () => {
    if (!checkLogin()) return;

    // Navigate to checkout with "buy-now" type and product details
    navigate('/checkout', {
        state: {
            type: 'buy-now',
            productId: product.id,
            quantity: quantity,
            items: [{
                productId: product.id,
                name: product.name, 
                price: product.price,
                quantity: quantity,
                image: product.image
            }],
            total: product.price * quantity
        }
    });
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) return <div className="h-screen flex justify-center items-center"><Spin size="large" /></div>;
  if (!product) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item href="/"><HomeOutlined /> Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item>Chi tiết sản phẩm</Breadcrumb.Item>
          <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Product Detail Box */}
        <div className="bg-white p-8 rounded-xl shadow-sm mb-12">
          <Row gutter={[48, 32]}>
            {/* Left Column: Product Image */}
            <Col xs={24} md={10}>
              <div className="border rounded-xl overflow-hidden p-4 bg-white flex justify-center items-center h-[400px]">
                <img 
                  src={product.image || DEFAULT_PRODUCT_IMG} 
                  onError={handleImageError}
                  alt={product.name} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </Col>

            {/* Right Column: Product Information */}
            <Col xs={24} md={14}>
              <Title level={2} style={{ marginTop: 0 }}>{product.name}</Title>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-100">
                 <Text className="text-4xl text-red-600 font-bold block mb-2">
                    {formatPrice(product.price)}
                 </Text>
                 <Text type="secondary">Tình trạng: {product.stock > 0 ? <span className="text-green-600 font-semibold">Còn hàng ({product.stock})</span> : <span className="text-red-500 font-semibold">Hết hàng</span>}</Text>
              </div>

              <Paragraph className="text-gray-600 text-base mb-8 leading-relaxed">
                {product.description || "Mô tả đang cập nhật..."}
              </Paragraph>
              
              <Divider />

              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                 <div className="flex items-center gap-4">
                    <span className="font-semibold">Số lượng:</span>
                    <InputNumber 
                        min={1} 
                        max={product.stock} 
                        value={quantity} 
                        onChange={setQuantity}
                        size="large"
                        className="w-32"
                    />
                 </div>
                 
                 {/* Action Buttons */}
                 <div className="flex gap-1 w-full sm:w-auto">
                     {/* Add to Cart Button */}
                     <Button 
                       size="large" 
                       icon={<ShoppingCartOutlined />}
                       className="h-12 px-6 text-lg border-blue-600 text-blue-600 hover:text-blue-700 hover:border-blue-700 bg-blue-50 flex-1 sm:flex-none"
                       onClick={handleAddToCart}
                       disabled={product.stock <= 0}
                     >
                     </Button>

                     {/* Buy Now Button */}
                     <Button 
                       type="primary"
                       size="large" 
                       icon={<ThunderboltOutlined />}
                       className="h-12 px-8 text-lg bg-red-600 hover:bg-red-700 border-red-600 flex-1 sm:flex-none"
                       onClick={handleBuyNow}
                       disabled={product.stock <= 0}
                     >
                       Mua ngay
                     </Button>
                 </div>
              </div>

              {/* Policy Information (Static) */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
                 <div className="flex items-center gap-2">
                    <SafetyCertificateOutlined className="text-blue-600 text-xl"/> 
                    <span>Bảo hành chính hãng</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <SyncOutlined className="text-blue-600 text-xl"/> 
                    <span>Đổi trả dễ dàng</span>
                 </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
            <div className="mt-12">
                <Title level={3} className="mb-6 border-l-4 border-blue-600 pl-3">Sản phẩm tương tự</Title>
                <Row gutter={[24, 24]}>
                    {relatedProducts.map(relProd => (
                        <Col key={relProd.id} xs={24} sm={12} md={6}>
                            <Card
                                hoverable
                                cover={
                                    <img 
                                        alt={relProd.name} 
                                        src={relProd.image ? relProd.image : DEFAULT_PRODUCT_IMG}
                                        onError={handleImageError}
                                        className="h-48 object-contain p-4" 
                                    />
                                }
                                onClick={() => navigate(`/product/${relProd.id}`)}
                            >
                                <Card.Meta 
                                    title={relProd.name} 
                                    description={<span className="text-red-600 font-bold">{formatPrice(relProd.price)}</span>} 
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;