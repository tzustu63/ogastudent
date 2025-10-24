import React from "react";
import { Menu } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  BarChartOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores";
import type { MenuProps } from "antd";

type MenuItem = Required<MenuProps>["items"][number];

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      {
        key: "/",
        icon: <HomeOutlined />,
        label: "首頁",
      },
      {
        key: "/students",
        icon: <UserOutlined />,
        label: "學生管理",
      },
    ];

    // 只有管理員可以看到人員管理
    if (user?.role === "admin") {
      baseItems.push({
        key: "/users",
        icon: <UserOutlined />,
        label: "人員管理",
      });
    }

    // 管理員和稽核人員可以看到報表
    if (user?.role === "admin" || user?.role === "auditor") {
      baseItems.push({
        key: "/reports",
        icon: <BarChartOutlined />,
        label: "報表統計",
      });
    }

    // 所有角色都可以看到通知
    baseItems.push({
      key: "/notifications",
      icon: <BellOutlined />,
      label: "通知",
    });

    // 只有管理員可以看到系統設定
    if (user?.role === "admin") {
      baseItems.push({
        key: "/settings",
        icon: <SettingOutlined />,
        label: "系統設定",
      });
    }

    return baseItems;
  };

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={getMenuItems()}
      onClick={handleMenuClick}
      style={{ height: "100%", borderRight: 0 }}
    />
  );
};

export default Navigation;
