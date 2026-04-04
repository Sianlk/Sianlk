// Card Component — Sianlk
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '../../theme/colors';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'ai' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, variant='default', padding='md', style }) => (
  <View style={[styles.base, styles['v_'+variant], styles['p_'+padding], style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  base: { borderRadius: 16, overflow: 'hidden' },
  v_default:  { backgroundColor: Colors.surface, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:2 },
  v_elevated: { backgroundColor: Colors.surface, shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.12, shadowRadius:24, elevation:8 },
  v_outlined: { backgroundColor: Colors.surface, borderWidth:1, borderColor: Colors.gray200 },
  v_ai:       { backgroundColor: '#1E40AF08', borderWidth:1, borderColor: '#1D4ED833' },
  v_glass:    { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth:1, borderColor:'rgba(255,255,255,0.2)' },
  p_none: { padding: 0 },
  p_sm:   { padding: 12 },
  p_md:   { padding: 16 },
  p_lg:   { padding: 24 },
});

export default Card;
