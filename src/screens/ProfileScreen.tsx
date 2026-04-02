import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Switch} from 'react-native';
import {useAuthStore} from '../store/authStore';
import {useAuth} from '../hooks/useAuth';

export default function ProfileScreen() {
  const {user} = useAuthStore();
  const {logout} = useAuth();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: () => logout()},
    ]);
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user.name.slice(0,2).toUpperCase()}</Text>
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <View style={styles.badgeRow}>
        <View style={styles.badge}><Text style={styles.badgeTxt}>{user.subscriptionTier.toUpperCase()}</Text></View>
        <View style={styles.badge}><Text style={styles.badgeTxt}>{user.role.toUpperCase()}</Text></View>
        {user.mfaEnabled && <View style={[styles.badge, styles.badgeGreen]}><Text style={styles.badgeTxt}>MFA ON</Text></View>}
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Push Notifications</Text>
        <Switch value={notifications} onValueChange={setNotifications} trackColor={{true:'#1D4ED8'}} />
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutTxt}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const PRIMARY = '#1D4ED8';
const styles = StyleSheet.create({
  container:  {flex:1, backgroundColor:'#FAFAFA', alignItems:'center', padding:24},
  avatar:     {width:80, height:80, borderRadius:40, backgroundColor:PRIMARY,
               alignItems:'center', justifyContent:'center', marginTop:32, marginBottom:12},
  avatarText: {fontSize:28, fontWeight:'700', color:'#fff'},
  name:       {fontSize:22, fontWeight:'700', color:'#111827'},
  email:      {fontSize:14, color:'#6B7280', marginTop:4, marginBottom:16},
  badgeRow:   {flexDirection:'row', gap:8, marginBottom:24},
  badge:      {backgroundColor:PRIMARY+'20', borderRadius:12, paddingHorizontal:10, paddingVertical:4},
  badgeGreen: {backgroundColor:'#D1FAE5'},
  badgeTxt:   {fontSize:11, fontWeight:'700', color:PRIMARY, letterSpacing:0.5},
  row:        {flexDirection:'row', justifyContent:'space-between', alignItems:'center',
               width:'100%', paddingVertical:16, borderBottomWidth:1, borderBottomColor:'#F3F4F6'},
  rowLabel:   {fontSize:16, color:'#374151'},
  logoutBtn:  {marginTop:32, backgroundColor:'#FEE2E2', borderRadius:12,
               paddingVertical:14, paddingHorizontal:40},
  logoutTxt:  {color:'#DC2626', fontWeight:'600', fontSize:16},
});
