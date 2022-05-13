import { useState, useEffect } from "react";
import { Card, Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";

import { DataStore } from "aws-amplify";
import { Order, OrderStatus } from "../../models";
import { useRestaurantContext } from "../../contexts/RestaurantContext";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const { restaurant } = useRestaurantContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (!restaurant) {
      return;
    }
    DataStore.query(Order, (order) =>
      order
        .orderRestaurantId("eq", restaurant.id)
        .or((orderStatus) =>
          orderStatus
            .status("eq", "NEW")
            .status("eq", "COOKING")
            .status("eq", "ACCEPTED")
            .status("eq", "READY_FOR_PICKUP")
        )
    ).then(setOrders);
  }, [restaurant]);

  useEffect(() => {
    const subscription = DataStore.observe(Order).subscribe((msg) => {
      const { opType, element } = msg;
      if (opType === "INSERT" && element.orderRestaurantId === restaurant.id) {
        setOrders((existingOrders) => [element, ...existingOrders]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const renderOrderStatus = (orderStatus) => {
    const statusToColor = {
      [OrderStatus.NEW]: "green",
      [OrderStatus.COOKING]: "orange",
      [OrderStatus.READY_FOR_PICKUP]: "red",
      [OrderStatus.ACCEPTED]: "purple",
    };

    return <Tag color={statusToColor[orderStatus]}>{orderStatus}</Tag>;
  };

  const tableColumns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Created at",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Price",
      dataIndex: "total",
      key: "total",
      render: (price) => `${price.toFixed(2)} $`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: renderOrderStatus,
    },
  ];

  return (
    <Card title={"Orders"} style={{ margin: 20 }}>
      <Table
        dataSource={orders}
        columns={tableColumns}
        rowKey="id"
        onRow={(orderItem) => ({
          onClick: () => navigate(`order/${orderItem.id}`),
        })}
      />
    </Card>
  );
};

export default Orders;
