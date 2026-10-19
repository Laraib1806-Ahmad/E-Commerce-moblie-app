import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";
import { useAppSelector } from "@/store/hooks";

const home = require("@/assets/images/tabIcons/homeIcon.png");
const cartIcon = require("@/assets/images/tabIcons/cart.png");
const heartIcon = require("@/assets/images/tabIcons/heart.png");
const ordersIcon = require("@/assets/images/tabIcons/orders.png");
const profileIcon = require("@/assets/images/tabIcons/profile.png");
const searchIcon = require("@/assets/images/tabIcons/search.png");
const activityIcon = require("@/assets/images/tabIcons/activity.png");
const importIcon = require("@/assets/images/tabIcons/import.png");
const productsIcon = require("@/assets/images/tabIcons/products.png");

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  const role = useAppSelector((s) => s.auth.user?.role);

  const tabProps = {
    backgroundColor: colors.background,
    indicatorColor: colors.backgroundElement,
    labelStyle: { selected: { color: colors.text } },
  };

  if (role === "admin") {
    return (
      <NativeTabs {...tabProps}>
        <NativeTabs.Trigger name="admin-products">
          <NativeTabs.Trigger.Label>Products</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={productsIcon}
            renderingMode="template"
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="admin-import">
          <NativeTabs.Trigger.Label>Import</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon src={importIcon} renderingMode="template" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="admin-logs">
          <NativeTabs.Trigger.Label>Activity</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={activityIcon}
            renderingMode="template"
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="index" hidden />
        <NativeTabs.Trigger name="search" hidden />
        <NativeTabs.Trigger name="cart" hidden />
        <NativeTabs.Trigger name="orders" hidden />
        <NativeTabs.Trigger name="profile" hidden />
        <NativeTabs.Trigger name="favorites" hidden />
      </NativeTabs>
    );
  }

  return (
    <NativeTabs {...tabProps}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={home} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="favorites">
        <NativeTabs.Trigger.Label>Favorites</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={heartIcon} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cart">
        <NativeTabs.Trigger.Label>Cart</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={cartIcon} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="orders">
        <NativeTabs.Trigger.Label>Orders</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={ordersIcon} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={profileIcon} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" hidden />
      <NativeTabs.Trigger name="admin-products" hidden />
      <NativeTabs.Trigger name="admin-import" hidden />
      <NativeTabs.Trigger name="admin-logs" hidden />
    </NativeTabs>
  );
}
