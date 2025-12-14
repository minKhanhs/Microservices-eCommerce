import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Tag, Space, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import adminApi from '../../api/adminApi';

const { Search } = Input;

const ProductManager = () => {
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Nếu null là Thêm, có data là Sửa

  const [form] = Form.useForm();
  const [catForm] = Form.useForm();

  // --- 1. LOAD DATA ---
  const fetchProducts = async (keyword = '') => {
    setLoading(true);
    try {
      let res;
      if (keyword.trim()) {
        res = await adminApi.searchProducts(keyword);
      } else {
        res = await adminApi.getAllProducts();
      }
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await adminApi.getAllCategories();
      setCategories(res.data || []);
    } catch (error) {
      console.error("Lỗi tải danh mục");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // --- 2. XỬ LÝ SẢN PHẨM (THÊM / SỬA) ---
  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      // Nếu là Sửa -> Fill dữ liệu cũ vào form
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        // Giả sử product trả về có categories list object, ta cần map về mảng ID
        categoryIds: product.categories ? product.categories.map(c => c.id) : []
      });
    } else {
      // Nếu là Thêm -> Reset form
      form.resetFields();
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (values) => {
    try {
      if (editingProduct) {
        // --- LOGIC UPDATE ---
        await adminApi.updateProduct(editingProduct.id, values);
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        // --- LOGIC ADD ---
        await adminApi.createProduct(values);
        message.success("Thêm sản phẩm thành công!");
      }
      
      setIsProductModalOpen(false);
      form.resetFields();
      fetchProducts(); // Reload lại bảng
    } catch (error) {
      message.error("Thao tác thất bại! Kiểm tra lại dữ liệu.");
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await adminApi.deleteProduct(id);
      message.success("Đã xóa sản phẩm");
      fetchProducts();
    } catch (error) {
      message.error("Xóa thất bại!");
    }
  };

  // --- 3. XỬ LÝ DANH MỤC (THÊM NHANH) ---
  const handleCreateCategory = async (values) => {
    try {
      await adminApi.createCategory(values); // values = { name: "Xe" }
      message.success("Thêm danh mục thành công");
      setIsCategoryModalOpen(false);
      catForm.resetFields();
      fetchCategories(); // Reload lại list danh mục để chọn ngay
    } catch (error) {
      message.error("Lỗi thêm danh mục");
    }
  };

  // --- 4. CẤU HÌNH CỘT BẢNG ---
  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-bold text-blue-700">{text}</span>
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryNames',
      key: 'categoryNames',
      render: (names) => (
        <>
          {names && names.map((name, index) => (
            <Tag color="cyan" key={index}>
              {name}
            </Tag>
          ))}
        </>
      )
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Tag color={stock < 5 ? 'red' : 'green'}>{stock}</Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleOpenModal(record)} 
          >
            Sửa
          </Button>
          <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => handleDeleteProduct(record.id)}>
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* HEADER TOOLBAR */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold border-l-4 border-blue-600 pl-3">Quản lý Sản phẩm</h2>
        
        <Space>
            {/* Nút thêm danh mục nhanh */}
            <Button icon={<AppstoreAddOutlined />} onClick={() => setIsCategoryModalOpen(true)}>
                Thêm Danh mục
            </Button>
            
            {/* Nút thêm sản phẩm */}
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
                Thêm Sản phẩm
            </Button>
        </Space>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-4 w-full md:w-1/2">
        <Search 
            placeholder="Nhập tên xe để tìm kiếm..." 
            enterButton={<SearchOutlined />} 
            size="large" 
            onSearch={(value) => fetchProducts(value)}
            allowClear
        />
      </div>

      {/* TABLE */}
      <Table 
        columns={columns} 
        dataSource={products} 
        rowKey="id" 
        loading={loading} 
        pagination={{ pageSize: 8 }}
      />

      {/* --- MODAL 1: THÊM / SỬA SẢN PHẨM --- */}
      <Modal 
        title={editingProduct ? `Cập nhật: ${editingProduct.name}` : "Thêm Sản Phẩm Mới"} 
        open={isProductModalOpen} 
        onCancel={() => setIsProductModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveProduct}>
          <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                    <Input placeholder="VD: Toyota Camry" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="categoryIds" label="Danh mục" rules={[{ required: true, message: 'Chọn ít nhất 1 danh mục' }]}>
                    <Select 
                        mode="multiple" 
                        placeholder="Chọn danh mục (Xe, Điện tử...)"
                        options={categories.map(c => ({ label: c.name, value: c.id }))}
                    />
                </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="price" label="Giá (VNĐ)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="stock" label="Số lượng kho" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} placeholder="VD: Xả kho, Xe mới nhập..." />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsProductModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">
                {editingProduct ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* --- MODAL 2: THÊM DANH MỤC NHANH --- */}
      <Modal
        title="Thêm Danh Mục Mới"
        open={isCategoryModalOpen}
        onCancel={() => setIsCategoryModalOpen(false)}
        footer={null}
        width={400}
      >
          <Form form={catForm} layout="vertical" onFinish={handleCreateCategory}>
             <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}>
                <Input placeholder="VD: Xe máy" />
             </Form.Item>
             <Button type="primary" htmlType="submit" block>Tạo Danh Mục</Button>
          </Form>
      </Modal>
    </div>
  );
};

export default ProductManager;