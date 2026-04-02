import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
        KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';

const PRIMARY = '#1D4ED8';

export default function RegisterScreen({ navigation }: any) {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const { register, isLoading } = useAuth();

  const validate = (): string | null => {
    if (!name.trim())            return 'Please enter your full name.';
    if (!email.includes('@'))    return 'Please enter a valid email.';
    if (password.length < 8)     return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must include a number.';
    if (password !== confirm)    return 'Passwords do not match.';
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) return Alert.alert('Validation Error', err);
    const result = await register({ name: name.trim(), email: email.trim().toLowerCase(), password });
    if (!result.success) Alert.alert('Registration Failed', result.error ?? 'Something went wrong.');
  };

  return (
    <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backTxt}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="#9CA3AF"
            value={name} onChangeText={setName} autoCapitalize="words" returnKeyType="next" />
          <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#9CA3AF"
            value={email} onChangeText={setEmail} keyboardType="email-address"
            autoCapitalize="none" autoComplete="email" returnKeyType="next" />
          <TextInput style={styles.input} placeholder="Password (min 8 chars)" placeholderTextColor="#9CA3AF"
            value={password} onChangeText={setPassword} secureTextEntry returnKeyType="next" />
          <TextInput style={styles.input} placeholder="Confirm password" placeholderTextColor="#9CA3AF"
            value={confirm} onChangeText={setConfirm} secureTextEntry returnKeyType="go"
            onSubmitEditing={handleRegister} />
          <TouchableOpacity style={[styles.btn, isLoading ? styles.btnDisabled : {}]} onPress={handleRegister} disabled={isLoading}>
            <Text style={styles.btnTxt}>{isLoading ? 'Creating account...' : 'Create Account'}</Text>
          </TouchableOpacity>
          <View style={styles.footer}>
            <Text style={styles.footerTxt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav:         {flex:1},
  container:   {flex:1, backgroundColor:'#FAFAFA'},
  scroll:      {padding:24, paddingBottom:48},
  back:        {marginBottom:16},
  backTxt:     {color:PRIMARY, fontSize:15, fontWeight:'600'},
  title:       {fontSize:28, fontWeight:'800', color:'#111827', marginBottom:24},
  input:       {backgroundColor:'#fff', borderWidth:1, borderColor:'#E5E7EB', borderRadius:12,
                padding:16, fontSize:16, color:'#111827', marginBottom:12},
  btn:         {backgroundColor:PRIMARY, borderRadius:12, paddingVertical:16, alignItems:'center', marginTop:4},
  btnDisabled: {opacity:0.6},
  btnTxt:      {color:'#fff', fontSize:16, fontWeight:'700'},
  footer:      {flexDirection:'row', justifyContent:'center', marginTop:24},
  footerTxt:   {color:'#6B7280', fontSize:14},
  footerLink:  {color:PRIMARY, fontSize:14, fontWeight:'700'},
});
