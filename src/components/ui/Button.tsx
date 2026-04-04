// Button — Reusable UI component
// Brand color: #1D4ED8

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  labelStyle,
}) => {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'ai' ? '#fff' : Colors.primary}
          size="small"
        />
      ) : (
        <View style={styles.row}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`], labelStyle]}>
            {label}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconLeft:  { marginRight: 8 },
  iconRight: { marginLeft: 8 },
  fullWidth: { width: '100%' },
  disabled:  { opacity: 0.5 },

  // Sizes
  size_sm: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  size_md: { paddingHorizontal: 20, paddingVertical: 14 },
  size_lg: { paddingHorizontal: 28, paddingVertical: 18, borderRadius: 16 },

  // Variants
  variant_primary:   { backgroundColor: '#1D4ED8' },
  variant_secondary: { backgroundColor: '#3B82F633' },
  variant_outline:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#1D4ED8' },
  variant_ghost:     { backgroundColor: 'transparent' },
  variant_danger:    { backgroundColor: Colors.error },
  variant_ai:        { backgroundColor: '#1E40AF', borderWidth: 1, borderColor: '#3B82F6' },

  // Labels
  label: { ...Typography.button },
  label_primary:   { color: '#FFFFFF' },
  label_secondary: { color: '#1E40AF' },
  label_outline:   { color: '#1D4ED8' },
  label_ghost:     { color: '#1D4ED8' },
  label_danger:    { color: '#FFFFFF' },
  label_ai:        { color: '#FFFFFF' },

  // Label sizes
  labelSize_sm: { fontSize: 13 },
  labelSize_md: { fontSize: 15 },
  labelSize_lg: { fontSize: 17 },
});

export default Button;
