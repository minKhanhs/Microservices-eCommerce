import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Select, message, Space, Typography, Avatar, Tooltip } from 'antd';
import { EyeOutlined, UserOutlined, MailOutlined, EditOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import adminApi from '../../api/adminApi';

const { Option } = Select;
const { Text } = Typography;

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // State quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // State bộ lọc Role (Frontend filtering hoặc gọi API filter)
  const [filterRole, setFilterRole] = useState(null);

  // 1. Load danh sách User
  const fetchUsers = async () => {
    setLoading(true);
    try {
      let res;
      if (filterRole) {
        res = await adminApi.getUsersByRole(filterRole);
      } else {
        res = await adminApi.getAllUsers();
      }
      const userList = Array.isArray(res.data) ? res.data : (res.data.content || []);
      setUsers(userList);
    } catch (error) {
      console.error(error);
      // message.error("Lỗi tải danh sách người dùng"); // Tạm tắt để đỡ spam nếu 403
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  // 2. Xử lý đổi Role
  const handleUpdateRole = async (userId, newRoleVal) => {
    try {
      // Gọi API đã sửa ở bước trên
      await adminApi.changeUserRole(userId, newRoleVal);
      
      message.success(`Đã cập nhật quyền thành công: ${newRoleVal}`);

      // Cập nhật State Local (Lưu ý: kiểm tra kỹ record dùng 'id' hay 'userId')
      setUsers(prev => prev.map(u => 
        (u.userId === userId || u.id === userId) ? { ...u, role: newRoleVal } : u
      ));

      // Cập nhật Modal
      if (selectedUser && (selectedUser.userId === userId || selectedUser.id === userId)) {
        setSelectedUser({ ...selectedUser, role: newRoleVal });
      }

    } catch (error) {
      console.error("Lỗi update role:", error);
      // Hiển thị thông báo lỗi chi tiết từ Backend trả về
      const errorMsg = error.response?.data?.message || error.response?.data || "Lỗi cập nhật (403: Kiểm tra quyền Admin)";
      message.error(typeof errorMsg === 'string' ? errorMsg : "Thất bại");
    }
  };

  // 3. Helper hiển thị Tag Role
  const getRoleTag = (role) => {
    switch (role) {
      case 'ADMIN': return <Tag icon={<SafetyCertificateOutlined />} color="red">QUẢN TRỊ VIÊN</Tag>;
      case 'USER': return <Tag icon={<UserOutlined />} color="blue">NGƯỜI DÙNG</Tag>;
      default: return <Tag>{role}</Tag>;
    }
  };

  // 4. Cấu hình bảng
  const columns = [
    {
      title: 'ID',
      dataIndex: 'userId',
      key: 'userId',
      render: (id) => <Text code copyable>{id.substring(0, 8)}...</Text>
    },
    {
      title: 'Thông tin người dùng',
      key: 'info',
      render: (_, record) => (
        <Space>
           <Avatar style={{ backgroundColor: record.role === 'ADMIN' ? '#f56a00' : '#87d068' }} icon={<UserOutlined />} />
           <div className="flex flex-col">
             <span className="font-medium">{record.fullName || "Chưa cập nhật tên"}</span>
             <span className="text-xs text-gray-400">{record.username}</span>
           </div>
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <Space>
          <MailOutlined className="text-gray-400" />
          <span>{email}</span>
        </Space>
      )
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => getRoleTag(role)
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết & Sửa quyền">
            <Button 
                type="text" 
                icon={<EditOutlined />} 
                className="text-blue-600 hover:bg-blue-50"
                onClick={() => {
                    setSelectedUser(record);
                    setIsModalOpen(true);
                }}
            >
                Quản lý
            </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold border-l-4 border-blue-600 pl-3">Quản lý Người dùng</h2>
          
          {/* Bộ lọc Role */}
          <Select 
            placeholder="Lọc theo quyền" 
            style={{ width: 150 }} 
            allowClear
            onChange={(val) => setFilterRole(val)}
          >
             <Option value="ADMIN">Admin</Option>
             <Option value="USER">User</Option>
          </Select>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      {/* MODAL CHI TIẾT USER */}
      <Modal
        title={
            <Space>
                <UserOutlined />
                <span>Thông tin người dùng</span>
            </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
            <Button key="close" onClick={() => setIsModalOpen(false)}>Đóng</Button>
        ]}
      >
        {selectedUser && (
          <div className="space-y-6 pt-4">
             {/* Header Info */}
             <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                <Avatar size={64} style={{ backgroundColor: selectedUser.role === 'ADMIN' ? '#f56a00' : '#87d068' }}>
                    {selectedUser.username?.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                    <h3 className="text-lg font-bold m-0">{selectedUser.fullName || selectedUser.username}</h3>
                    <p className="text-gray-500 m-0">{selectedUser.email}</p>
                    <div className="mt-1">{getRoleTag(selectedUser.role)}</div>
                </div>
             </div>

             {/* Form sửa quyền */}
             <div>
                <h4 className="font-semibold mb-2 border-b pb-1">Cập nhật quyền hạn</h4>
                <div className="flex items-center gap-3 mt-3">
                    <span>Quyền hiện tại:</span>
                    <Select 
                        defaultValue={selectedUser.role} 
                        style={{ width: 200 }}
                        onChange={(val) => handleUpdateRole(selectedUser.userId, val)}
                    >
                        <Option value="USER">USER</Option>
                        <Option value="ADMIN">ADMIN</Option>
                    </Select>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    * Lưu ý: Cấp quyền ADMIN cho phép người dùng truy cập vào trang quản trị hệ thống.
                </p>
             </div>

             {/* Thông tin chi tiết (Read only) */}
             <div>
                <h4 className="font-semibold mb-2 border-b pb-1">Chi tiết kỹ thuật</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-gray-500">User ID:</span> {selectedUser.id}</p>
                    <p><span className="text-gray-500">Username:</span> {selectedUser.username}</p>
                    {/* Thêm các trường khác nếu API trả về (phone, address...) */}
                </div>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManager;