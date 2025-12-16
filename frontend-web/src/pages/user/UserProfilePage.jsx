import { useEffect, useState } from 'react';
import { 
  Card, Tabs, Form, Input, Button, List, 
  message, Modal, Popconfirm, Skeleton, Space, Tag 
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  EnvironmentOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  SaveOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import userApi from '../../api/userApi';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // State lưu danh sách địa chỉ (lấy từ userData.addresses)
  const [addresses, setAddresses] = useState([]);

  // State Modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  // Form instances
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [addressForm] = Form.useForm();

  // 1. Load dữ liệu Profile (Bao gồm cả Address)
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    if (!token) {
        navigate('/login');
        return;
    }

    setLoading(true);
    try {
      const res = await userApi.getProfile();
      const data = res.data || res; // Xử lý nếu axios trả về data trực tiếp hoặc gói trong data

      setUserData(data);
      
      // Cập nhật State địa chỉ từ dữ liệu profile trả về
      setAddresses(data.addresses || []);

      // Đổ dữ liệu vào Form Profile
      // LƯU Ý: Backend trả về 'fullName' nhưng input update cần 'fullname'
      profileForm.setFieldsValue({
        fullname: data.fullName, 
        email: data.email,
        phone: data.phone
      });

    } catch (error) {
      console.error(error);
      message.error("Lỗi tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // --- TAB 1: CẬP NHẬT THÔNG TIN ---
  const handleUpdateProfile = async (values) => {
    try {
      // Input: { fullname: "...", email: "...", phone: "..." }
      await userApi.updateProfile(values);
      message.success("Cập nhật hồ sơ thành công!");
      
      // Update lại UI ngay lập tức
      setUserData(prev => ({ 
          ...prev, 
          fullName: values.fullname, // Cập nhật lại hiển thị
          email: values.email, 
          phone: values.phone 
      }));
    } catch (error) {
      message.error("Cập nhật thất bại: " + (error.response?.data?.message || "Lỗi hệ thống"));
    }
  };

  // --- TAB 2: QUẢN LÝ ĐỊA CHỈ ---
  const handleAddAddress = async (values) => {
    try {
      await userApi.addAddress(values);
      message.success("Thêm địa chỉ thành công");
      setIsAddressModalOpen(false);
      addressForm.resetFields();
      
      // Gọi lại API Profile để lấy danh sách địa chỉ mới nhất (vì ID địa chỉ do BE sinh ra)
      fetchUserProfile(); 
    } catch (error) {
      message.error("Thêm địa chỉ thất bại");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await userApi.deleteAddress(addressId);
      message.success("Đã xóa địa chỉ");
      
      // Cập nhật UI: Lọc bỏ địa chỉ vừa xóa khỏi state local
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    } catch (error) {
      message.error("Xóa thất bại");
    }
  };

  // --- TAB 3: ĐỔI MẬT KHẨU ---
  const handleChangePassword = async (values) => {
    try {
      await userApi.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });
      message.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      passwordForm.resetFields();
      
      // Logout và chuyển trang
      localStorage.clear();
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      const errMsg = error.response?.data?.message || error.response?.data || "Đổi mật khẩu thất bại";
      message.error(errMsg);
    }
  };

  // --- GIAO DIỆN CON ---
  const ProfileTab = () => (
    <Form 
      form={profileForm} 
      layout="vertical" 
      onFinish={handleUpdateProfile}
      className="max-w-lg mt-4"
    >
      <Form.Item label="Tên đăng nhập">
        <Input value={userData?.username} disabled className="bg-gray-100 text-gray-500 cursor-not-allowed" />
      </Form.Item>

      <Form.Item 
        label="Họ và tên" 
        name="fullname" // Name khớp với API update input
        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
      </Form.Item>

      <Form.Item 
        label="Email" 
        name="email"
        rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}
      >
        <Input prefix={<MailOutlined />} placeholder="email@example.com" />
      </Form.Item>

      <Form.Item 
        label="Số điện thoại" 
        name="phone"
        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
      >
        <Input prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
          Lưu thay đổi
        </Button>
      </Form.Item>
    </Form>
  );

  const AddressTab = () => (
    <div className="mt-4">
      <Button 
        type="dashed" 
        block 
        icon={<PlusOutlined />} 
        className="mb-6 h-12 text-blue-500 border-blue-400 hover:text-blue-600 hover:border-blue-500"
        onClick={() => setIsAddressModalOpen(true)}
      >
        Thêm địa chỉ mới
      </Button>

      <List
        grid={{ gutter: 16, column: 1 }} // Dạng danh sách dọc
        dataSource={addresses}
        locale={{ emptyText: 'Chưa có địa chỉ nào' }}
        renderItem={(item) => (
          <List.Item>
            <Card 
              size="small"
              className="shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
              title={
                <Space>
                    <EnvironmentOutlined className="text-red-500"/> 
                    <span className="font-semibold">{item.fullAddress}</span>
                </Space>
              }
              extra={
                <Popconfirm 
                  title="Xóa địa chỉ này?" 
                  description="Hành động này không thể hoàn tác"
                  onConfirm={() => handleDeleteAddress(item.id)}
                  okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
                >
                   <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              }
            >
              <div className="text-gray-600 text-sm">
                  <p>• Đường: {item.street}</p>
                  <p>• Quận/Huyện: {item.district}</p>
                  <p>• Thành phố: {item.city}</p>
              </div>
            </Card>
          </List.Item>
        )}
      />

      {/* MODAL ADD ADDRESS */}
      <Modal
        title="Thêm địa chỉ giao hàng"
        open={isAddressModalOpen}
        onCancel={() => setIsAddressModalOpen(false)}
        footer={null}
      >
        <Form form={addressForm} layout="vertical" onFinish={handleAddAddress}>
          <Form.Item label="Tỉnh / Thành phố" name="city" rules={[{ required: true, message: 'Nhập thành phố' }]}>
            <Input placeholder="Ví dụ: Hà Nội" />
          </Form.Item>
          <Form.Item label="Quận / Huyện" name="district" rules={[{ required: true, message: 'Nhập quận huyện' }]}>
            <Input placeholder="Ví dụ: Hai Bà Trưng" />
          </Form.Item>
          <Form.Item label="Địa chỉ chi tiết (Đường, số nhà)" name="street" rules={[{ required: true, message: 'Nhập tên đường' }]}>
            <Input placeholder="Ví dụ: Số 1 Đại Cồ Việt" />
          </Form.Item>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setIsAddressModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu địa chỉ</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );

  const SecurityTab = () => (
    <Form 
      form={passwordForm} 
      layout="vertical" 
      onFinish={handleChangePassword}
      className="max-w-md mt-4"
    >
      <Form.Item 
        label="Mật khẩu hiện tại" 
        name="oldPassword" 
        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" />
      </Form.Item>

      <Form.Item 
        label="Mật khẩu mới" 
        name="newPassword" 
        rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
      </Form.Item>

      <Form.Item 
        label="Xác nhận mật khẩu mới" 
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: 'Vui lòng xác nhận mật khẩu' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" danger htmlType="submit" className="w-full">
          Đổi mật khẩu
        </Button>
      </Form.Item>
    </Form>
  );

  // --- RENDER MAIN ---
  const tabItems = [
    { key: '1', label: <span><UserOutlined />Thông tin cá nhân</span>, children: <ProfileTab /> },
    { key: '2', label: <span><EnvironmentOutlined />Sổ địa chỉ</span>, children: <AddressTab /> },
    { key: '3', label: <span><LockOutlined />Bảo mật</span>, children: <SecurityTab /> },
  ];

  if (loading && !userData) return <div className="p-10"><Skeleton active avatar paragraph={{ rows: 4 }} /></div>;

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý tài khoản</h2>
        <Card className="shadow-md rounded-lg border-0">
            {/* Hiển thị Header nhỏ thông tin user */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold uppercase">
                    {userData?.username?.charAt(0) || "U"}
                </div>
                <div>
                    <h3 className="text-xl font-bold m-0">{userData?.fullName}</h3>
                    <p className="text-gray-500">{userData?.email}</p>
                </div>
            </div>

            <Tabs defaultActiveKey="1" items={tabItems} size="large" />
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage;