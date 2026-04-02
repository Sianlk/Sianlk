import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity, Linking } from 'react-native';

const PRIMARY = '#1D4ED8';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [biometrics,    setBiometrics]    = useState(false);
  const [analytics,     setAnalytics]     = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Settings</Text>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Push Notifications</Text>
            <Switch value={notifications} onValueChange={setNotifications} trackColor={{true:PRIMARY}} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Biometric Sign-In</Text>
            <Switch value={biometrics} onValueChange={setBiometrics} trackColor={{true:PRIMARY}} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Analytics</Text>
            <Switch value={analytics} onValueChange={setAnalytics} trackColor={{true:PRIMARY}} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.row}><Text style={styles.rowLabel}>Version</Text><Text style={styles.dimText}>1.0.0</Text></View>
          <View style={styles.row}><Text style={styles.rowLabel}>App</Text><Text style={styles.dimText}>Sianlk</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Legal</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://sianlk.com/privacy')}>
            <Text style={styles.link}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://sianlk.com/terms')}>
            <Text style={styles.link}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('mailto:support@sianlk.com')}>
            <Text style={styles.link}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    {flex:1, backgroundColor:'#F9FAFB'},
  scroll:       {padding:20, paddingBottom:48},
  heading:      {fontSize:28, fontWeight:'800', color:'#111827', marginBottom:20},
  sectionTitle: {fontSize:12, fontWeight:'700', color:'#6B7280', textTransform:'uppercase',
                  letterSpacing:0.8, marginBottom:8, marginTop:16},
  card:         {backgroundColor:'#fff', borderRadius:16, overflow:'hidden',
                  shadowColor:'#000', shadowOpacity:0.05, shadowRadius:8, elevation:2},
  row:          {flexDirection:'row', justifyContent:'space-between', alignItems:'center',
                  paddingHorizontal:16, paddingVertical:14,
                  borderBottomWidth:1, borderBottomColor:'#F3F4F6'},
  rowLabel:     {fontSize:15, color:'#374151'},
  dimText:      {fontSize:14, color:'#9CA3AF'},
  linkRow:      {paddingHorizontal:16, paddingVertical:14, borderBottomWidth:1, borderBottomColor:'#F3F4F6'},
  link:         {color:PRIMARY, fontSize:15, fontWeight:'600'},
});
