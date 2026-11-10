/**
 * iOS 16.0 port shim for `@expo/ui` (root entry).
 *
 * The upstream package renders SwiftUI through native code that requires iOS 26 APIs, so it cannot
 * compile with a 16.0 deployment target. This shim re-implements the small surface the app uses with
 * plain React Native primitives. Visual fidelity is lower than the native version; behaviour is kept.
 */
import * as React from "react";
import {
  Pressable,
  StyleSheet,
  Switch as RNSwitch,
  Text as RNText,
  TextInput as RNTextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

type AnyProps = Record<string, any>;

/** SwiftUI Host: just renders its children. */
export function Host({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function Switch({
  value,
  onValueChange,
  onChange,
  disabled,
  style,
}: AnyProps) {
  return (
    <RNSwitch
      value={!!value}
      disabled={!!disabled}
      onValueChange={(next) => {
        onValueChange?.(next);
        onChange?.(next);
      }}
      style={style as StyleProp<ViewStyle>}
    />
  );
}

export function TextInput({
  value,
  onChangeText,
  onChange,
  placeholder,
  style,
  ...rest
}: AnyProps) {
  return (
    <RNTextInput
      value={typeof value === "string" ? value : undefined}
      onChangeText={(next) => {
        onChangeText?.(next);
        onChange?.(next);
      }}
      placeholder={placeholder}
      style={style as StyleProp<TextStyle>}
      {...rest}
    />
  );
}

export default { Host, Switch, TextInput };
