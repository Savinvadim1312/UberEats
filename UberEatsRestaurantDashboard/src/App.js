import { Layout, Image } from "antd";
import SideMenu from "../src/components/SideMenu";
import AppRoutes from "./components/AppRoutes";
import { Amplify, Hub } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import awsconfig from "./aws-exports";
import { useEffect, useState } from "react";

const { Sider, Content, Footer } = Layout;

Amplify.configure(awsconfig);

function App() {
  const [user, setUser] = useState();

  useEffect(() => {
    Hub.listen("auth", (e) => {
      const { event, data } = e.payload;
      if (event === "signIn") {
        setUser(data);
      } else if (event === "signOut") {
        setUser(null);
      }
    });
  });

  console.log(user);

  return (
    <Authenticator>
      <Layout>
        <Sider style={{ height: "100vh", backgroundColor: "white" }}>
          <Image
            src="https://logos-world.net/wp-content/uploads/2020/11/Uber-Eats-Symbol.jpg"
            preview={false}
          />
          <SideMenu />
        </Sider>
        <Layout>
          <Content>
            <AppRoutes />
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Uber Eats Restaurant Dashboard ©2022
          </Footer>
        </Layout>
      </Layout>
    </Authenticator>
  );
}

export default App;
