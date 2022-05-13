import { useState, useEffect } from "react";
import { Card, Table, Tag } from "antd";
import { useRestaurantContext } from "../../contexts/RestaurantContext";
import { DataStore } from "aws-amplify";
import { Order, OrderStatus } from "../../models";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
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
            .status("eq", "PICKED_UP")
            .status("eq", "COMPLETED")
            .status("eq", "DECLINED_BY_RESTAURANT")
        )
    ).then(setOrders);
  }, [restaurant]);

  const renderOrderStatus = (orderStatus) => {
    const statusToColor = {
      [OrderStatus.PICKED_UP]: "orange",
      [OrderStatus.COMPLETED]: "green",
      [OrderStatus.DECLINED_BY_RESTAURANT]: "red",
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
      render: (price) => `${price?.toFixed(2) ?? 0} $`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: renderOrderStatus,
    },
  ];
  return (
    <Card title={"History Orders"} style={{ margin: 20 }}>
      <Table
        dataSource={orders}
        columns={tableColumns}
        rowKey="id"
        onRow={(orderItem) => ({
          onClick: () => navigate(`/order/${orderItem.id}`),
        })}
      />
    </Card>
  );
};

export default OrderHistory;
