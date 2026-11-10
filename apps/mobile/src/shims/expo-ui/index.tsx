/**
 * iOS 16.0 port shim for `@expo/ui` (root entry).
 *
 * The upstream package renders SwiftUI through native code that requires iOS 26 APIs, so it cannot
 * compile with a 16.0 deployment target. This shim re-implements the small surface the app uses with
 * plain React Native primitives.
 *
 * Important: the app passes `useNativeState()` bindings straight into `TextInput` (`value={binding}`)
 * and calls `binding.set(...)`, so the binding must expose `.value` and `.set`, and the input must
 * read through that object.
 */
import * as React from "react";
import {
  Switch as RNSwitch,
  TextInput as RNTextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

type AnyProps = Record<string, any>;

function flatten(style: any): any {
  return Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : style;
}

function readValue(value: any): string {
  if (value && typeof value === "object" && "value" in value) {
    const inner = (value as any).value;
    return typeof inner === "string" ? inner : inner == null ? "" : String(inner);
  }
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

/** SwiftUI `Host`: a layout container that renders its children. */
export function Host({ children, style, ...rest }: AnyProps) {
  return (
    <View style={[{ flex: 1 }, flatten(style)]} {...rest}>
      {children}
    </View>
  );
}

export function Switch({ value, onValueChange, onChange, disabled, style }: AnyProps) {
  return (
    <RNSwitch
      value={!!readValue(value)}
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
  placeholderTextColor,
  style,
  textStyle,
  modifiers,
  numberOfLines,
  ...rest
}: AnyProps) {
  const text = readValue(value);
  const binding = value && typeof value === "object" && "set" in value ? value : null;
  return (
    <RNTextInput
      value={text}
      onChangeText={(next) => {
        binding?.set?.(next);
        onChangeText?.(next);
        onChange?.(next);
      }}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      multiline={!!rest.multiline}
      style={[flatten(textStyle), flatten(style)] as StyleProp<TextStyle>}
      {...rest}
    />
  );
}

export default { Host, Switch, TextInput };
