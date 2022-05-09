import { Card, Table, Button } from "antd";
import dishes from "../../assets/data/dishes.json";
import { Link } from 'react-router-dom'

const RestaurantMenu = () => {
  const tableColumns = [
    {
      title: "Menu Item",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Price",
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price} $` 
    },
    {
      title: "Action",
      key: 'action',
      render: () => <Button danger>Remove</Button>
    }
  ];

  const renderNewItemButton = () => (
    <Link to={'create'}>
      <Button type="primary">New Item</Button>
    </Link>
  )

  return (
    <Card title={"Menu"} style={{ margin: 20 }} extra={renderNewItemButton()}>
      <Table dataSource={dishes} columns={tableColumns} rowKey="id" />
    </Card>
  );
};

export default RestaurantMenu;
