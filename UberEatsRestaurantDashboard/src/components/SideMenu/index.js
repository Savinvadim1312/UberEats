import { Menu } from "antd";
import { useNavigate } from "react-router-dom";
import { Auth } from "aws-amplify";

const SideMenu = () => {
  const navigate = useNavigate();

  const onClick = async (menuItem) => {
    if (menuItem.key === "signout") {
      await Auth.signOut();
    } else {
      navigate(menuItem.key);
    }
  };

  const menuItems = [
    {
      key: "/",
      label: "Orders",
    },
    {
      key: "menu",
      label: "Menu",
    },
    {
      key: "order-history",
      label: "Order History",
    },
    {
      key: "settings",
      label: "Settings",
    },
    {
      key: "signout",
      label: "Sign out",
      danger: true,
    },
  ];

  return <Menu items={menuItems} onClick={onClick} />;
};

export default SideMenu;
