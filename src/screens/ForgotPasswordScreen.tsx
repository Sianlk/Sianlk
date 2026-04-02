import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform} from 'react-native';

const API_BASE = 'https://api.sianlk.sianlk.com/api/v1';

export default function ForgotPasswordScreen({navigation}: any) {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return Alert.alert('Error', 'Please enter your email address.');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: email.trim().toLowerCase()}),
      });
      if (res.ok || res.status === 202) {
        setSent(true);
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } catch { Alert.alert('Error', 'Network error. Please check your connection.'); }
    finally { setLoading(false); }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.icon}>📧</Text>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>We sent a password reset link to {email}. Check your spam folder if you don't see it.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.btnTxt}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.inner}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your email and we'll send you a reset link.</Text>
        <TextInput
          style={styles.input}
          placeholder='your@email.com'
          placeholderTextColor='#9CA3AF'
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          autoCapitalize='none'
          autoComplete='email'
        />
        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.btnTxt}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const PRIMARY = '#1D4ED8';
const styles = StyleSheet.create({
  container:  {flex:1, backgroundColor:'#FAFAFA'},
  inner:      {flex:1, padding:24},
  center:     {flex:1, alignItems:'center', justifyContent:'center', padding:24},
  back:       {marginBottom:32},
  backTxt:    {color:PRIMARY, fontSize:16},
  icon:       {fontSize:48, marginBottom:16},
  title:      {fontSize:26, fontWeight:'700', color:'#111827', marginBottom:8},
  subtitle:   {fontSize:15, color:'#6B7280', marginBottom:32, lineHeight:22, textAlign:'center'},
  input:      {backgroundColor:'#fff', borderWidth:1, borderColor:'#E5E7EB', borderRadius:12,
               padding:16, fontSize:16, color:'#111827', marginBottom:16},
  btn:        {backgroundColor:PRIMARY, borderRadius:12, paddingVertical:16, alignItems:'center'},
  btnDisabled:{opacity:0.6},
  btnTxt:     {color:'#fff', fontSize:16, fontWeight:'700'},
});
