/** iOS 16.0 port shim for `@expo/ui/community/datetime-picker` — a lightweight date/time row. */
import * as React from "react";
import { Pressable, Text as RNText, View } from "react-native";

type AnyProps = Record<string, any>;

export function DateTimePicker({ value, onChange, mode, style }: AnyProps) {
  const current = value instanceof Date ? value : new Date();
  const label =
    mode === "time"
      ? current.toLocaleTimeString()
      : current.toLocaleDateString();

  return (
    <View style={[{ paddingVertical: 8 }, style]}>
      <Pressable onPress={() => onChange?.(new Date())}>
        <RNText>{label}</RNText>
      </Pressable>
    </View>
  );
}

export default DateTimePicker;
