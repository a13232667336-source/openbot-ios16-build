/**
 * iOS 16.0 port shim for `@expo/ui/community/menu` — a Modal-based menu that accepts the same
 * props shape the app passes to the native menu.
 */
import * as React from "react";
import { Modal, Pressable, ScrollView, Text as RNText, View } from "react-native";

export type MenuAction = {
  id?: string;
  title?: string;
  label?: string;
  systemImage?: string;
  destructive?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children?: MenuAction[];
};

export type MenuComponentProps = {
  actions?: MenuAction[];
  items?: MenuAction[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (action: MenuAction) => void;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
};

export type MenuComponentRef = { open?: () => void; close?: () => void };

function renderItems(actions: MenuAction[] | undefined, onPick: (a: MenuAction) => void) {
  return (actions ?? []).map((action, index) => (
    <Pressable
      key={action.id ?? action.title ?? action.label ?? String(index)}
      onPress={() => onPick(action)}
      style={{ paddingVertical: 12, paddingHorizontal: 16 }}
    >
      <RNText style={{ color: action.destructive ? "#d33" : undefined }}>
        {action.title ?? action.label ?? ""}
      </RNText>
    </Pressable>
  ));
}

export function MenuView({
  actions,
  items,
  open,
  onOpenChange,
  onSelect,
  children,
  trigger,
}: MenuComponentProps) {
  const [visible, setVisible] = React.useState(false);
  const isOpen = open ?? visible;
  const setOpen = (next: boolean) => {
    setVisible(next);
    onOpenChange?.(next);
  };

  const pick = (action: MenuAction) => {
    onSelect?.(action);
    action.onPress?.();
    setOpen(false);
  };

  return (
    <View>
      <Pressable onPress={() => setOpen(true)}>{trigger ?? children}</Pressable>
      <Modal transparent visible={isOpen} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "#0008" }} onPress={() => setOpen(false)}>
          <View
            style={{
              marginTop: 120,
              marginHorizontal: 32,
              borderRadius: 14,
              backgroundColor: "#fff",
              overflow: "hidden",
            }}
          >
            <ScrollView style={{ maxHeight: 420 }}>{renderItems(actions ?? items, pick)}</ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default MenuView;
