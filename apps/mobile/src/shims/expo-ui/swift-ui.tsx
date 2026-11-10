/**
 * iOS 16.0 port shim for `@expo/ui/swift-ui`.
 *
 * React Native approximations of the SwiftUI views the app renders. Each control keeps the props
 * contract of the native version so app code keeps working; only the visuals differ.
 */
import * as React from "react";
import {
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text as RNText,
  View,
  type StyleProp,
  type TextProps,
} from "react-native";

type AnyProps = Record<string, any>;

function flatten(style: any): any {
  if (!style) return undefined;
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flatten));
  return style;
}

function asBool(value: any): boolean {
  if (typeof value === "boolean") return value;
  if (value && typeof value === "object" && "value" in value) return Boolean(value.value);
  return Boolean(value);
}

function asString(value: any): string {
  if (value && typeof value === "object" && "value" in value) value = value.value;
  if (value == null) return "";
  if (value instanceof Date) return value.toLocaleString();
  return String(value);
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

/** SF Symbols are unavailable; map a few common ones to glyphs and fall back to a neutral dot. */
const SF_GLYPHS: Record<string, string> = {
  "chevron.left": "‹",
  "chevron.right": "›",
  "chevron.down": "⌄",
  "chevron.up": "⌃",
  "xmark": "✕",
  "plus": "＋",
  "checkmark": "✓",
  "ellipsis": "⋯",
  "arrow.up": "↑",
  "arrow.down": "↓",
  "paperplane": "➤",
  "trash": "🗑",
  "square.and.arrow.up": "⇪",
  "gearshape": "⚙",
  magnifyingglass: "⌕",
};

export function Image({ systemName, source, style, ...rest }: AnyProps) {
  if (source) return <RNText {...rest} />;
  const glyph = SF_GLYPHS[systemName] ?? "•";
  const flat = flatten(style) ?? {};
  const size = typeof flat.width === "number" ? flat.width : typeof flat.height === "number" ? flat.height : 18;
  return (
    <RNText
      {...rest}
      style={[
        { fontSize: Math.max(12, size * 0.9), color: flat.tint ?? flat.color ?? "#666", textAlign: "center" },
        flat,
      ]}
    >
      {glyph}
    </RNText>
  );
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

export function Link({ children, onPress, style, ...rest }: AnyProps) {
  return (
    <Pressable onPress={onPress} style={flatten(style)} {...rest}>
      {children}
    </Pressable>
  );
}

export function Menu({ children, style, ...rest }: AnyProps) {
  return (
    <View style={flatten(style)} {...rest}>
      {children}
    </View>
  );
}

/** Picker: shows the current label and cycles through its options on tap. */
export function Picker({ children, selection, onSelectionChange, style, options, ...rest }: AnyProps) {
  const opts: any[] = options ?? React.Children.toArray(children);
  const [index, setIndex] = React.useState(() => {
    const found = opts.findIndex((o: any) => (o?.props?.value ?? o) === selection);
    return found >= 0 ? found : 0;
  });
  const current = opts[index];
  const label = typeof current === "object" && current ? (current.props?.label ?? String(current.props?.value ?? "")) : String(current ?? "");
  return (
    <Pressable
      style={[{ paddingVertical: 8 }, flatten(style)]}
      onPress={() => {
        const next = (index + 1) % Math.max(1, opts.length);
        setIndex(next);
        const value = typeof opts[next] === "object" && opts[next] ? opts[next].props?.value : opts[next];
        onSelectionChange?.(value);
      }}
      {...rest}
    >
      <RNText>{label}</RNText>
    </Pressable>
  );
}

export function DatePicker({ value, onDateChange, onChange, mode, style, ...rest }: AnyProps) {
  const [open, setOpen] = React.useState(false);
  const current = value instanceof Date ? value : new Date();
  const label = mode === "time" ? current.toLocaleTimeString() : current.toLocaleDateString();
  const shift = (minutes: number) => {
    const next = new Date(current.getTime() + minutes * 60000);
    onDateChange?.(next);
    onChange?.(next);
  };
  return (
    <View style={flatten(style)} {...rest}>
      <Pressable onPress={() => setOpen(true)}>
        <RNText>{label}</RNText>
      </Pressable>
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "#0008", justifyContent: "center" }} onPress={() => setOpen(false)}>
          <View style={{ margin: 32, borderRadius: 14, backgroundColor: "#fff", padding: 16, gap: 12 }}>
            <RNText style={{ color: "#111", fontSize: 16 }}>{label}</RNText>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable onPress={() => shift(-1440)} style={{ padding: 10, backgroundColor: "#eee", borderRadius: 8 }}>
                <RNText>-1 天</RNText>
              </Pressable>
              <Pressable onPress={() => shift(1440)} style={{ padding: 10, backgroundColor: "#eee", borderRadius: 8 }}>
                <RNText>+1 天</RNText>
              </Pressable>
              <Pressable onPress={() => shift(0)} style={{ padding: 10, backgroundColor: "#ddd", borderRadius: 8 }}>
                <RNText>现在</RNText>
              </Pressable>
            </View>
            <Pressable onPress={() => setOpen(false)} style={{ padding: 10, alignSelf: "flex-end" }}>
              <RNText style={{ color: "#06f" }}>完成</RNText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const COLOR_SWATCHES = ["#000000", "#ffffff", "#ff3b30", "#ff9500", "#34c759", "#0a84ff", "#5e5ce6", "#bf5af2"];

export function ColorPicker({ selection, onSelectionChange, style, children, ...rest }: AnyProps) {
  return (
    <View style={[{ flexDirection: "row", flexWrap: "wrap", gap: 8 }, flatten(style)]} {...rest}>
      {COLOR_SWATCHES.map((color) => (
        <Pressable
          key={color}
          onPress={() => onSelectionChange?.(color)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: color,
            borderWidth: selection === color ? 2 : 1,
            borderColor: selection === color ? "#06f" : "#ccc",
          }}
        />
      ))}
      {children}
    </View>
  );
}

/** Slider with a working drag handle (PanResponder), honouring min/max/step. */
export function Slider({
  value = 0,
  minimumValue = 0,
  maximumValue = 1,
  step = 0,
  onValueChange,
  onChange,
  disabled,
  style,
  ...rest
}: AnyProps) {
  const [width, setWidth] = React.useState(0);
  const [current, setCurrent] = React.useState(Number(asString(value)) || 0);

  React.useEffect(() => {
    setCurrent(Number(asString(value)) || 0);
  }, [value]);

  const commit = (next: number) => {
    let clamped = Math.min(maximumValue, Math.max(minimumValue, next));
    if (step > 0) clamped = Math.round(clamped / step) * step;
    setCurrent(clamped);
    onValueChange?.(clamped);
    onChange?.(clamped);
  };

  const pan = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (evt) => {
          if (width > 0) {
            const ratio = evt.nativeEvent.locationX / width;
            commit(minimumValue + ratio * (maximumValue - minimumValue));
          }
        },
        onPanResponderMove: (evt) => {
          if (width > 0) {
            const ratio = Math.min(1, Math.max(0, evt.nativeEvent.locationX / width));
            commit(minimumValue + ratio * (maximumValue - minimumValue));
          }
        },
      }),
    [disabled, width, minimumValue, maximumValue, step],
  );

  const ratio = maximumValue === minimumValue ? 0 : (current - minimumValue) / (maximumValue - minimumValue);

  return (
    <View
      {...rest}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[{ height: 36, justifyContent: "center" }, flatten(style)]}
      {...pan.panHandlers}
    >
      <View style={{ height: 4, borderRadius: 2, backgroundColor: "#8886" }} />
      <View
        style={{
          position: "absolute",
          left: 0,
          width: Math.max(0, Math.min(1, ratio)) * width,
          height: 4,
          borderRadius: 2,
          backgroundColor: "#06f",
        }}
      />
      <View
        style={{
          position: "absolute",
          left: Math.max(0, Math.min(1, ratio)) * width - 9,
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: "#fff",
          borderWidth: 2,
          borderColor: "#06f",
        }}
      />
    </View>
  );
}

/**
 * SwiftUI `@State`-style binding: the app reads `binding.value`, calls `binding.set(next)`, and
 * passes the binding itself as `value` to `TextInput`.
 */
export function useNativeState<T>(initial: T) {
  const [value, setValue] = React.useState<T>(initial);
  const ref = React.useRef<any>(null);
  if (!ref.current) ref.current = {};
  Object.defineProperty(ref.current, "value", { get: () => value, configurable: true });
  ref.current.set = (next: T) => setValue(next);
  return ref.current as { readonly value: T; set: (next: T) => void };
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
