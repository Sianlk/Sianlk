import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
        KeyboardAvoidingView, Platform, ScrollView, Alert} from 'react-native';
import {useAuth} from '../hooks/useAuth';

export default function LoginScreen({navigation}: any) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const {login, isLoading}      = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Error', 'Please enter your email and password.');
    }
    const result = await login({email: email.trim().toLowerCase(), password});
    if (!result.success) {
      if (result.requiresMFA) {
        navigation.navigate('MFA', {email: email.trim().toLowerCase(), password});
      } else {
        Alert.alert('Sign In Failed', result.error ?? 'Invalid email or password.');
      }
    }
    // success: navigation handled by auth state change in AppNavigator
  };

  return (
    <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps='handled'>
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.appName}>Sianlk</Text>
          </View>
          <Text style={styles.title}>Sign In</Text>
          <TextInput
            style={styles.input}
            placeholder='Email address'
            placeholderTextColor='#9CA3AF'
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
            autoCapitalize='none'
            autoComplete='email'
            returnKeyType='next'
          />
          <View style={styles.pwWrap}>
            <TextInput
              style={styles.pwInput}
              placeholder='Password'
              placeholderTextColor='#9CA3AF'
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              autoComplete='password'
              returnKeyType='go'
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
              <Text style={styles.eyeTxt}>{showPw ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotWrap}>
            <Text style={styles.forgotTxt}>Forgot password?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.btnTxt}>{isLoading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>
          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divTxt}>or</Text>
            <View style={styles.divLine} />
          </View>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.secondaryTxt}>Create an account</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const PRIMARY = '#1D4ED8';
const styles = StyleSheet.create({
  kav:          {flex:1},
  container:    {flex:1, backgroundColor:'#FAFAFA'},
  scroll:       {padding:24, paddingBottom:48},
  logoWrap:     {alignItems:'center', marginTop:32, marginBottom:32},
  logoCircle:   {width:72, height:72, borderRadius:36, backgroundColor:PRIMARY,
                 alignItems:'center', justifyContent:'center', marginBottom:12},
  logoText:     {fontSize:32, fontWeight:'800', color:'#fff'},
  appName:      {fontSize:20, fontWeight:'700', color:'#111827'},
  title:        {fontSize:28, fontWeight:'800', color:'#111827', marginBottom:24},
  input:        {backgroundColor:'#fff', borderWidth:1, borderColor:'#E5E7EB', borderRadius:12,
                 padding:16, fontSize:16, color:'#111827', marginBottom:12},
  pwWrap:       {flexDirection:'row', backgroundColor:'#fff', borderWidth:1, borderColor:'#E5E7EB',
                 borderRadius:12, marginBottom:8, alignItems:'center'},
  pwInput:      {flex:1, padding:16, fontSize:16, color:'#111827'},
  eyeBtn:       {padding:16},
  eyeTxt:       {fontSize:18},
  forgotWrap:   {alignSelf:'flex-end', marginBottom:20},
  forgotTxt:    {color:PRIMARY, fontSize:14, fontWeight:'600'},
  btn:          {backgroundColor:PRIMARY, borderRadius:12, paddingVertical:16, alignItems:'center', marginBottom:12},
  btnDisabled:  {opacity:0.6},
  btnTxt:       {color:'#fff', fontSize:16, fontWeight:'700'},
  divider:      {flexDirection:'row', alignItems:'center', marginVertical:20},
  divLine:      {flex:1, height:1, backgroundColor:'#E5E7EB'},
  divTxt:       {color:'#9CA3AF', marginHorizontal:12, fontSize:14},
  secondaryBtn: {borderWidth:2, borderColor:PRIMARY, borderRadius:12, paddingVertical:14, alignItems:'center'},
  secondaryTxt: {color:PRIMARY, fontSize:16, fontWeight:'700'},
});
