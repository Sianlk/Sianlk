import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/authStore';

const PRIMARY = '#1D4ED8';

export default function HomeScreen() {
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.email?.split('@')[0] ?? 'there'} 👋</Text>
          <Text style={styles.appName}>Sianlk</Text>
          <Text style={styles.tagline}>One Platform. Infinite Possibilities.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Status</Text>
          <Text style={styles.cardValue}>{user?.subscription_tier ?? 'Free'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Role</Text>
          <Text style={styles.cardValue}>{user?.role ?? 'user'}</Text>
        </View>
        <TouchableOpacity style={styles.ctaBtn}>
          <Text style={styles.ctaTxt}>Get Started →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  {flex:1, backgroundColor:'#FAFAFA'},
  scroll:     {padding:24, paddingBottom:48},
  header:     {backgroundColor:PRIMARY, borderRadius:20, padding:28, marginBottom:20},
  greeting:   {color:'rgba(255,255,255,0.85)', fontSize:16, marginBottom:4},
  appName:    {color:'#fff', fontSize:28, fontWeight:'800', marginBottom:4},
  tagline:    {color:'rgba(255,255,255,0.7)', fontSize:14},
  card:       {backgroundColor:'#fff', borderRadius:16, padding:20, marginBottom:12,
                shadowColor:'#000', shadowOpacity:0.06, shadowRadius:8, elevation:2},
  cardTitle:  {color:'#6B7280', fontSize:12, fontWeight:'600', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4},
  cardValue:  {color:'#111827', fontSize:18, fontWeight:'700'},
  ctaBtn:     {backgroundColor:PRIMARY, borderRadius:14, paddingVertical:18, alignItems:'center', marginTop:8},
  ctaTxt:     {color:'#fff', fontSize:16, fontWeight:'700'},
});
