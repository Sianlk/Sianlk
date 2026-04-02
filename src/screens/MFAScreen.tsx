/**
 * MFA verification screen — TOTP entry with backup code fallback.
 * Required for enterprise/premium tier users.
 */
import React, {useState, useRef} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

interface Props {
  onVerified: () => void;
  onCancel: () => void;
  userEmail: string;
}

export const MFAScreen: React.FC<Props> = ({onVerified, onCancel, userEmail}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [useBackup, setUseBackup] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const verify = async () => {
    if (code.length !== 6 && !useBackup) return;
    setLoading(true);
    try {
      const endpoint = useBackup ? "/api/v1/auth/mfa/backup" : "/api/v1/auth/mfa/verify";
      const r = await fetch(endpoint, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({code}),
      });
      if (r.ok) {
        onVerified();
      } else {
        Alert.alert("Invalid Code", "Please check your authenticator app and try again.");
        setCode("");
      }
    } catch {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inner}>
        <Text style={styles.title}>Two-Factor Authentication</Text>
        <Text style={styles.subtitle}>
          {useBackup
            ? "Enter one of your 8-character backup codes."
            : `Enter the 6-digit code from your authenticator app for ${userEmail}`}
        </Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={code}
          onChangeText={setCode}
          keyboardType={useBackup ? "default" : "number-pad"}
          maxLength={useBackup ? 8 : 6}
          placeholder={useBackup ? "4A3B2C1D" : "000000"}
          placeholderTextColor="#555"
          autoFocus
          onSubmitEditing={verify}
          accessibilityLabel="Authentication code"
        />
        <TouchableOpacity
          style={[styles.btn, (!code || loading) && styles.btnDisabled]}
          onPress={verify}
          disabled={!code || loading}
          accessibilityRole="button">
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Verify</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {setUseBackup(!useBackup); setCode("");}}>
          <Text style={styles.link}>
            {useBackup ? "Use authenticator app instead" : "Use a backup code"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#0f0f1a"},
  inner: {flex: 1, padding: 24, justifyContent: "center"},
  title: {fontSize: 28, fontWeight: "800", color: "#fff", marginBottom: 12},
  subtitle: {fontSize: 15, color: "#aaa", marginBottom: 32, lineHeight: 22},
  input: {
    backgroundColor: "#1a1a2e", color: "#fff", fontSize: 24, fontWeight: "700",
    textAlign: "center", letterSpacing: 8, padding: 20, borderRadius: 12,
    marginBottom: 20, borderWidth: 1, borderColor: "#333"},
  btn: {backgroundColor: "#6d6dff", padding: 18, borderRadius: 12, alignItems: "center", marginBottom: 16},
  btnDisabled: {opacity: 0.5},
  btnText: {color: "#fff", fontSize: 17, fontWeight: "700"},
  link: {color: "#6d6dff", textAlign: "center", fontSize: 15, marginBottom: 12},
  cancel: {color: "#666", textAlign: "center", fontSize: 15},
});
