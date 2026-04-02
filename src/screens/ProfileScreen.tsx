import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

const PRIMARY = '#1D4ED8';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const handleLogout = () => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign Out', style: 'destructive', onPress: logout },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.email?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.card}>
          {[['Account ID', user?.id ?? '—'],['Role', user?.role ?? '—'],['Plan', user?.subscription_tier ?? '—']].map(([l,v]) => (
            <View style={styles.row} key={l}>
              <Text style={styles.label}>{l}</Text>
              <Text style={styles.value}>{v}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutTxt}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  {flex:1, backgroundColor:'#FAFAFA'},
  scroll:     {padding:24, alignItems:'center', paddingBottom:48},
  avatar:     {width:88, height:88, borderRadius:44, backgroundColor:PRIMARY,
                alignItems:'center', justifyContent:'center', marginBottom:12, marginTop:16},
  avatarText: {color:'#fff', fontSize:36, fontWeight:'800'},
  email:      {fontSize:16, fontWeight:'600', color:'#374151', marginBottom:24},
  card:       {width:'100%', backgroundColor:'#fff', borderRadius:16, padding:20, marginBottom:20,
                shadowColor:'#000', shadowOpacity:0.06, shadowRadius:8, elevation:2},
  row:        {flexDirection:'row', justifyContent:'space-between', paddingVertical:10,
                borderBottomWidth:1, borderBottomColor:'#F3F4F6'},
  label:      {color:'#6B7280', fontSize:14},
  value:      {color:'#111827', fontSize:14, fontWeight:'600', flexShrink:1, textAlign:'right'},
  logoutBtn:  {width:'100%', borderWidth:2, borderColor:'#EF4444', borderRadius:14,
                paddingVertical:16, alignItems:'center'},
  logoutTxt:  {color:'#EF4444', fontSize:16, fontWeight:'700'},
});
