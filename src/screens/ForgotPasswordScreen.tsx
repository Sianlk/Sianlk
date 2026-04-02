import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
        KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { api } from '../api/client';

const PRIMARY = '#1D4ED8';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email,     setEmail]     = useState('');
  const [sent,      setSent]      = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes('@')) return Alert.alert('Error', 'Please enter a valid email address.');
    setIsLoading(true);
    try {
      await api.post('/api/v1/auth/forgot-password', { email: email.trim().toLowerCase() }, false);
    } catch {
      // Always succeed to prevent email enumeration (OWASP)
    } finally {
      setIsLoading(false);
      setSent(true);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.checkIcon}>Email Sent</Text>
          <Text style={styles.sentTitle}>Check Your Email</Text>
          <Text style={styles.sentBody}>If that email is registered, you will receive a reset link shortly.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.btnTxt}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backTxt}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email and we will send you a reset link.</Text>
          <TextInput
            style={styles.input} placeholder="Email address" placeholderTextColor="#9CA3AF"
            value={email} onChangeText={setEmail} keyboardType="email-address"
            autoCapitalize="none" autoComplete="email" />
          <TouchableOpacity style={[styles.btn, isLoading ? styles.btnDisabled : {}]} onPress={handleSubmit} disabled={isLoading}>
            <Text style={styles.btnTxt}>{isLoading ? 'Sending...' : 'Send Reset Link'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav:        {flex:1},
  container:  {flex:1, backgroundColor:'#FAFAFA'},
  inner:      {padding:24},
  center:     {flex:1, padding:32, alignItems:'center', justifyContent:'center'},
  back:       {marginBottom:24},
  backTxt:    {color:PRIMARY, fontSize:15, fontWeight:'600'},
  title:      {fontSize:28, fontWeight:'800', color:'#111827', marginBottom:8},
  subtitle:   {fontSize:15, color:'#6B7280', marginBottom:24, lineHeight:22},
  input:      {backgroundColor:'#fff', borderWidth:1, borderColor:'#E5E7EB', borderRadius:12,
                padding:16, fontSize:16, color:'#111827', marginBottom:16},
  btn:        {backgroundColor:PRIMARY, borderRadius:12, paddingVertical:16, alignItems:'center'},
  btnDisabled:{opacity:0.6},
  btnTxt:     {color:'#fff', fontSize:16, fontWeight:'700'},
  checkIcon:  {fontSize:20, fontWeight:'700', color:PRIMARY, marginBottom:12},
  sentTitle:  {fontSize:24, fontWeight:'800', color:'#111827', marginBottom:8, textAlign:'center'},
  sentBody:   {fontSize:15, color:'#6B7280', textAlign:'center', lineHeight:22, marginBottom:32},
});
