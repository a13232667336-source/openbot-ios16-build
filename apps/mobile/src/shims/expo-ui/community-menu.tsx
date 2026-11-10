/**
 * iOS 16.0 port shim for `@expo/ui/community/menu`.
 *
 * Mirrors the native contract the app relies on:
 *   <MenuView actions={actions} onPressAction={({nativeEvent}) => ...}
 *             onCloseMenu={...} shouldOpenOnLongPress ref={ref}>anchor</MenuView>
 * and the imperative `ref.show()` used by the browser screen.
 */
import * as React from "react";
import { Modal, Pressable, ScrollView, Text as RNText, View } from "react-native";

export type MenuAction = {
  id?: string;
  event?: string;
  title?: string;
  label?: string;
  systemImage?: string;
  destructive?: boolean;
  disabled?: boolean;
  children?: MenuAction[];
};

export type MenuComponentRef = { show?: () => void; hide?: () => void; open?: () => void; close?: () => void };

export type MenuComponentProps = {
  actions?: MenuAction[];
  items?: MenuAction[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (action: MenuAction) => void;
  onPressAction?: (event: { nativeEvent: { event: string } }) => void;
  onCloseMenu?: () => void;
  shouldOpenOnLongPress?: boolean;
  colorScheme?: string;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
};

function labelOf(action: MenuAction): string {
  return action.title ?? action.label ?? action.event ?? String(action.id ?? "");
}

function eventOf(action: MenuAction): string {
  return action.event ?? action.id ?? labelOf(action);
}

export const MenuView = React.forwardRef<MenuComponentRef, MenuComponentProps>(function MenuView(
  { actions, items, open, onOpenChange, onSelect, onPressAction, onCloseMenu, shouldOpenOnLongPress, children, trigger },
  ref,
) {
  const [visible, setVisible] = React.useState(false);
  const isOpen = open ?? visible;

  const setOpen = React.useCallback(
    (next: boolean) => {
      setVisible(next);
      onOpenChange?.(next);
      if (!next) onCloseMenu?.();
    },
    [onCloseMenu, onOpenChange],
  );

  React.useImperativeHandle(ref, () => ({
    show: () => setOpen(true),
    open: () => setOpen(true),
    hide: () => setOpen(false),
    close: () => setOpen(false),
  }));

  const pick = (action: MenuAction) => {
    onSelect?.(action);
    onPressAction?.({ nativeEvent: { event: eventOf(action) } });
    setOpen(false);
  };

  const list = actions ?? items ?? [];

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        onLongPress={shouldOpenOnLongPress ? () => setOpen(true) : undefined}
      >
        {trigger ?? children}
      </Pressable>
      <Modal transparent visible={isOpen} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "#00000055" }} onPress={() => setOpen(false)}>
          <View
            style={{
              marginTop: 140,
              marginHorizontal: 24,
              borderRadius: 14,
              backgroundColor: "#fff",
              overflow: "hidden",
            }}
          >
            <ScrollView style={{ maxHeight: 460 }}>
              {list.map((action, index) => (
                <Pressable
                  key={action.id ?? `${index}-${labelOf(action)}`}
                  disabled={action.disabled}
                  onPress={() => pick(action)}
                  style={{ paddingVertical: 14, paddingHorizontal: 18, opacity: action.disabled ? 0.4 : 1 }}
                >
                  <RNText style={{ fontSize: 16, color: action.destructive ? "#d33" : "#111" }}>{labelOf(action)}</RNText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
});

export default MenuView;
