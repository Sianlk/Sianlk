import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
        KeyboardAvoidingView, Platform, ScrollView, Alert} from 'react-native';
import {useAuth} from '../hooks/useAuth';

export default function RegisterScreen({navigation}: any) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const {register, isLoading}   = useAuth();

  const validate = (): string | null => {
    if (!name.trim())      return 'Please enter your full name.';
    if (!email.includes('@')) return 'Please enter a valid email.';
    if (password.length < 8)  return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must include a number.';
    if (password !== confirm) return 'Passwords do not match.';
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) return Alert.alert('Validation Error', err);
    const result = await register({name: name.trim(), email: email.trim().toLowerCase(), password});
    if (!result.success) {
      Alert.alert('Registration Failed', result.error ?? 'Something went wrong.');
    }
  };

  const inputOf = (placeholder: string, value: string, setValue: (v:string)=>void,
                   extra: object = {}) => (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor='#9CA3AF'
      value={value}
      onChangeText={setValue}
      {...extra}
    />
  );

  return (
    <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps='handled'>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backTxt}>← Sign In</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Sianlk today</Text>
          {inputOf('Full name', name, setName, {autoComplete:'name', returnKeyType:'next'})}
          {inputOf('Email address', email, setEmail, {keyboardType:'email-address', autoCapitalize:'none', autoComplete:'email', returnKeyType:'next'})}
          {inputOf('Password (min 8 chars)', password, setPassword, {secureTextEntry:true, autoComplete:'new-password', returnKeyType:'next'})}
          {inputOf('Confirm password', confirm, setConfirm, {secureTextEntry:true, returnKeyType:'go', onSubmitEditing:handleRegister})}
          <Text style={styles.hint}>By creating an account you agree to our Terms of Service and Privacy Policy.</Text>
          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.btnTxt}>{isLoading ? 'Creating account...' : 'Create Account'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const PRIMARY = '#1D4ED8';
const styles = StyleSheet.create({
  kav:        {flex:1},
  container:  {flex:1, backgroundColor:'#FAFAFA'},
  scroll:     {padding:24, paddingBottom:48},
  back:       {marginBottom:24},
  backTxt:    {color:PRIMARY, fontSize:16},
  title:      {fontSize:28, fontWeight:'800', color:'#111827', marginBottom:4},
  subtitle:   {fontSize:15, color:'#6B7280', marginBottom:24},
  input:      {backgroundColor:'#fff', borderWidth:1, borderColor:'#E5E7EB', borderRadius:12,
               padding:16, fontSize:16, color:'#111827', marginBottom:12},
  hint:       {fontSize:12, color:'#9CA3AF', marginBottom:20, lineHeight:18},
  btn:        {backgroundColor:PRIMARY, borderRadius:12, paddingVertical:16, alignItems:'center'},
  btnDisabled:{opacity:0.6},
  btnTxt:     {color:'#fff', fontSize:16, fontWeight:'700'},
});
