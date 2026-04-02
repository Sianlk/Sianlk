import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView} from 'react-native';
import {useAuthStore} from '../store/authStore';

export default function HomeScreen() {
  const {user} = useAuthStore();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}!</Text>
          <Text style={styles.tagline}>One Platform. Infinite Possibilities.</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
        <View key="0" style={styles.featureCard}>
          <Text style={styles.featureText}>Business Intelligence</Text>
        </View>
        <View key="1" style={styles.featureCard}>
          <Text style={styles.featureText}>AI Automation</Text>
        </View>
        <View key="2" style={styles.featureCard}>
          <Text style={styles.featureText}>Team Management</Text>
        </View>
        <View key="3" style={styles.featureCard}>
          <Text style={styles.featureText}>Revenue Analytics</Text>
        </View>
        </View>
        {user && (
          <View style={styles.planBadge}>
            <Text style={styles.planText}>{user.subscriptionTier.toUpperCase()} PLAN</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY = '#1D4ED8';
const styles = StyleSheet.create({
  container:    {flex:1, backgroundColor:'#FAFAFA'},
  scroll:       {padding:20, paddingBottom:40},
  header:       {backgroundColor:PRIMARY, borderRadius:16, padding:24, marginBottom:20},
  greeting:     {fontSize:22, fontWeight:'700', color:'#fff', marginBottom:4},
  tagline:      {fontSize:14, color:'rgba(255,255,255,0.85)'},
  section:      {marginBottom:24},
  sectionTitle: {fontSize:16, fontWeight:'600', color:'#111827', marginBottom:12},
  featureCard:  {backgroundColor:'#fff', borderRadius:12, padding:16, marginBottom:10,
                 shadowColor:'#000', shadowOpacity:0.06, shadowRadius:8, elevation:2},
  featureText:  {fontSize:15, color:'#374151', fontWeight:'500'},
  planBadge:    {backgroundColor:PRIMARY+'20', borderRadius:20, paddingVertical:8,
                 paddingHorizontal:16, alignSelf:'center', marginTop:8},
  planText:     {color:PRIMARY, fontWeight:'700', fontSize:12, letterSpacing:1},
});
