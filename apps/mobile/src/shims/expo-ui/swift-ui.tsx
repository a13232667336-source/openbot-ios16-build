/** iOS 16.0 port shim for `@expo/ui/swift-ui` — React Native approximations of the SwiftUI views. */
import * as React from "react";
import {
  Image as RNImage,
  Pressable,
  Text as RNText,
  View,
  type StyleProp,
  type TextProps,
  type ViewStyle,
} from "react-native";

type AnyProps = Record<string, any>;

function flatten(style: any): any {
  return Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : style;
}

export function Text({ children, style, ...rest }: AnyProps) {
  return (
    <RNText style={style as StyleProp<any>} {...(rest as TextProps)}>
      {children}
    </RNText>
  );
}

function box(direction: "row" | "column") {
  return function Box({ children, style, spacing, ...rest }: AnyProps) {
    return (
      <View
        style={[
          { flexDirection: direction, gap: typeof spacing === "number" ? spacing : undefined },
          flatten(style),
        ]}
        {...rest}
      >
        {children}
      </View>
    );
  };
}

export const HStack = box("row");
export const VStack = box("column");

export function ZStack({ children, style, ...rest }: AnyProps) {
  return (
    <View style={[{ alignItems: "center", justifyContent: "center" }, flatten(style)]} {...rest}>
      {children}
    </View>
  );
}

export function Spacer() {
  return <View style={{ flex: 1 }} />;
}

export function Image({ systemName, source, style, ...rest }: AnyProps) {
  if (source) return <RNImage source={source} style={style as StyleProp<any>} {...rest} />;
  // SF Symbols are not available without the native module; draw a neutral placeholder.
  return <View style={[{ width: 20, height: 20, borderRadius: 4, backgroundColor: "#8884" }, flatten(style)]} />;
}

export function Button({ label, children, onPress, action, style, ...rest }: AnyProps) {
  return (
    <Pressable
      onPress={onPress ?? action}
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, flatten(style)]}
      {...rest}
    >
      {children ?? (label ? <RNText>{label}</RNText> : null)}
    </Pressable>
  );
}

export function Link({ children, onPress, url, style, ...rest }: AnyProps) {
  return (
    <Pressable onPress={onPress} style={flatten(style)} {...rest}>
      {children}
    </Pressable>
  );
}

/** Menu / Picker / DatePicker / ColorPicker / Slider degrade to plain containers. */
export function Menu({ children, style, ...rest }: AnyProps) {
  return <View style={flatten(style)} {...rest}>{children}</View>;
}

export function Picker({ children, style, ...rest }: AnyProps) {
  return <View style={flatten(style)} {...rest}>{children}</View>;
}

export function DatePicker({ value, onDateChange, onChange, style, ...rest }: AnyProps) {
  const text = value instanceof Date ? value.toLocaleDateString() : String(value ?? "");
  return (
    <Pressable
      onPress={() => {
        const now = new Date();
        onDateChange?.(now);
        onChange?.(now);
      }}
      style={flatten(style)}
      {...rest}
    >
      <RNText>{text || "选择日期"}</RNText>
    </Pressable>
  );
}

export function ColorPicker({ style, children, ...rest }: AnyProps) {
  return <View style={flatten(style)} {...rest}>{children}</View>;
}

export function Slider({ value, onValueChange, style, ...rest }: AnyProps) {
  return (
    <Pressable
      onPress={() => onValueChange?.(value)}
      style={[{ height: 28, justifyContent: "center" }, flatten(style)]}
      {...rest}
    >
      <View style={{ height: 4, borderRadius: 2, backgroundColor: "#8886" }} />
    </Pressable>
  );
}

/**
 * SwiftUI `@State`-style binding: the app reads `binding.value` and calls `binding.set(next)`, and
 * passes the binding itself as `value` to `TextInput`. Keep that shape.
 */
export function useNativeState<T>(initial: T) {
  const [value, setValue] = React.useState<T>(initial);
  const binding = React.useRef<any>(null);
  if (!binding.current) {
    binding.current = {
      get value() {
        return value;
      },
      set(next: T) {
        setValue(next);
      },
    } as any;
  }
  const ref = binding.current as { value: T; set: (next: T) => void };
  Object.defineProperty(ref, "value", { get: () => value, configurable: true });
  ref.set = (next: T) => setValue(next);
  return ref;
}

export default {
  Text,
  HStack,
  VStack,
  ZStack,
  Spacer,
  Image,
  Button,
  Link,
  Menu,
  Picker,
  DatePicker,
  ColorPicker,
  Slider,
  useNativeState,
};
