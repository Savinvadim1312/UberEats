import { Card, Table, Button, Popconfirm } from "antd";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { DataStore } from "aws-amplify";
import { Dish } from "../../models";
import { useRestaurantContext } from "../../contexts/RestaurantContext";

const RestaurantMenu = () => {
  const [dishes, setDishes] = useState([]);
  const { restaurant } = useRestaurantContext();

  useEffect(() => {
    if (restaurant?.id) {
      DataStore.query(Dish, (c) => c.restaurantID("eq", restaurant.id)).then(
        setDishes
      );
    }
  }, [restaurant?.id]);

  const deleteDish = (dish) => {
    DataStore.delete(dish);
    setDishes(dishes.filter((d) => d.id !== dish.id));
  };

  const tableColumns = [
    {
      title: "Menu Item",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price} $`,
    },
    {
      title: "Action",
      key: "action",
      render: (_, item) => (
        <Popconfirm
          placement="topLeft"
          title={"Are you sure you want to delete this dish?"}
          onConfirm={() => deleteDish(item)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger>Remove</Button>
        </Popconfirm>
      ),
    },
  ];

  const renderNewItemButton = () => (
    <Link to={"create"}>
      <Button type="primary">New Item</Button>
    </Link>
  );

  return (
    <Card title={"Menu"} style={{ margin: 20 }} extra={renderNewItemButton()}>
      <Table dataSource={dishes} columns={tableColumns} rowKey="id" />
    </Card>
  );
};

export default RestaurantMenu;
