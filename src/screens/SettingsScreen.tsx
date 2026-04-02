import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Linking} from 'react-native';

interface SettingItem { label: string; action?: () => void; value?: string; }

function SettingRow({label, action, value}: SettingItem) {
  return (
    <TouchableOpacity style={styles.row} onPress={action} disabled={!action}>
      <Text style={styles.rowLabel}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {action && <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const open = (url: string) => Linking.openURL(url).catch(() => null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.sectionHeader}>ACCOUNT</Text>
        <SettingRow label='Subscription' value='Manage' action={() => open('https://sianlk.sianlk.com/subscription')} />
        <SettingRow label='Change Password' action={() => {}} />
        <SettingRow label='Two-Factor Authentication' action={() => {}} />
        <Text style={styles.sectionHeader}>SUPPORT</Text>
        <SettingRow label='Help Centre' action={() => open('https://sianlk.sianlk.com/support')} />
        <SettingRow label='Privacy Policy' action={() => open('https://sianlk.sianlk.com/privacy')} />
        <SettingRow label='Terms of Service' action={() => open('https://sianlk.sianlk.com/terms')} />
        <SettingRow label='Contact Support' action={() => Linking.openURL('mailto:support@sianlk.com')} />
        <Text style={styles.sectionHeader}>APP</Text>
        <SettingRow label='Version' value='1.0.0 (1)' />
        <SettingRow label='Open Source Licenses' action={() => {}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY = '#1D4ED8';
const styles = StyleSheet.create({
  container:     {flex:1, backgroundColor:'#F9FAFB'},
  sectionHeader: {fontSize:12, fontWeight:'600', color:'#9CA3AF', letterSpacing:0.8,
                  paddingHorizontal:20, paddingTop:24, paddingBottom:8, textTransform:'uppercase'},
  row:           {flexDirection:'row', justifyContent:'space-between', alignItems:'center',
                  backgroundColor:'#fff', paddingHorizontal:20, paddingVertical:16,
                  borderBottomWidth:1, borderBottomColor:'#F3F4F6'},
  rowLabel:      {fontSize:16, color:'#111827'},
  rowValue:      {fontSize:14, color:PRIMARY, fontWeight:'600'},
  chevron:       {fontSize:20, color:'#9CA3AF', marginLeft:8},
});
