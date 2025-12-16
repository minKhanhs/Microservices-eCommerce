import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Tabs, message, Spin, Avatar, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, SaveOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../api/adminApi';

const UserProfile = () => {
    const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Form instances để có thể reset sau khi submit
  const [profileForm] = Form.useForm();
  const [passForm] = Form.useForm();

  // 1. Load thông tin cá nhân lúc vào trang
  const fetchMyProfile = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMyProfile();
      setUserData(res.data);
      
      // Đổ dữ liệu vào form profile
      profileForm.setFieldsValue({
        fullName: res.data.fullName,
        email: res.data.email,
        username: res.data.username // Thường username không cho sửa
      });
    } catch (error) {
      console.error(error);
      message.error("Không thể tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  // 2. Xử lý cập nhật thông tin (Tab 1)
  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      // Gọi API update
      await adminApi.updateMyProfile({
        fullName: values.fullName,
        email: values.email
      });
      message.success("Cập nhật thông tin thành công!");
      
      // Update lại state hiển thị local (Avatar, tên...)
      setUserData(prev => ({ ...prev, ...values }));
    } catch (error) {
      console.error(error);
      message.error("Lỗi cập nhật profile.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Xử lý đổi mật khẩu (Tab 2)
  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      
      // Backend thường cần: oldPassword, newPassword, confirmPassword
      await adminApi.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });

      message.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      passForm.resetFields();
      
      // Tùy chọn: Có thể tự động logout user ra luôn
      localStorage.clear();
      setTimeout(() => {
          navigate('/admin/login');
      }, 1000);

    } catch (error) {
      console.error(error);
      // Lấy thông báo lỗi từ backend (ví dụ: "Sai mật khẩu cũ")
      const errMsg = error.response?.data?.message || error.response?.data || "Đổi mật khẩu thất bại";
      message.error(typeof errMsg === 'string' ? errMsg : "Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  // --- GIAO DIỆN TAB 1: THÔNG TIN CHUNG ---
  const GeneralInfoTab = () => (
    <Form
      form={profileForm}
      layout="vertical"
      onFinish={handleUpdateProfile}
      className="mt-4 max-w-lg"
    >
      <Row gutter={24}>
        <Col span={24} md={8} className="flex flex-col items-center justify-center mb-6">
           <Avatar size={100} icon={<UserOutlined />} className="bg-blue-500 mb-4"/>
           <h3 className="text-lg font-bold m-0">{userData?.username}</h3>
           <span className="text-gray-500">{userData?.role || 'USER'}</span>
        </Col>
        
        <Col span={24} md={16}>
          <Form.Item label="Tên đăng nhập" name="username">
            <Input prefix={<UserOutlined />} disabled className="bg-gray-100" />
          </Form.Item>

          <Form.Item 
            label="Họ và tên" 
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập họ tên của bạn" />
          </Form.Item>

          <Form.Item 
            label="Email" 
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="example@gmail.com" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  // --- GIAO DIỆN TAB 2: ĐỔI MẬT KHẨU ---
  const SecurityTab = () => (
    <Form
      form={passForm}
      layout="vertical"
      onFinish={handleChangePassword}
      className="mt-4 max-w-md mx-auto"
    >
      <div className="text-center mb-6">
          <SafetyCertificateOutlined style={{ fontSize: 40, color: '#faad14' }} />
          <p className="text-gray-500 mt-2">Nên đặt mật khẩu mạnh gồm chữ hoa, thường và số.</p>
      </div>

      <Form.Item
        label="Mật khẩu hiện tại"
        name="oldPassword"
        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu cũ" />
      </Form.Item>

      <Form.Item
        label="Mật khẩu mới"
        name="newPassword"
        rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' }
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
      </Form.Item>

      <Form.Item
        label="Xác nhận mật khẩu mới"
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: 'Vui lòng xác nhận lại mật khẩu' },
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
        <Button type="primary" danger htmlType="submit" loading={loading} block>
          Đổi mật khẩu
        </Button>
      </Form.Item>
    </Form>
  );

  // --- RENDER CHÍNH ---
  const items = [
    {
      key: '1',
      label: (<span><UserOutlined />Thông tin cá nhân</span>),
      children: <GeneralInfoTab />,
    },
    {
      key: '2',
      label: (<span><LockOutlined />Bảo mật & Mật khẩu</span>),
      children: <SecurityTab />,
    },
  ];

  return (
    <div className="p-4 flex justify-center">
      <Card 
        title="Hồ sơ của tôi" 
        className="w-full max-w-4xl shadow-md"
        loading={!userData && loading} // Hiện loading card nếu chưa có data
      >
         <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </div>
  );
};

export default UserProfile;