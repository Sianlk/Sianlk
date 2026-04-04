// Biometric Authentication — Sianlk
// Face ID / Touch ID / Fingerprint with secure key storage

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import Analytics from '../services/analytics';

const TOKEN_KEY = '@sianlk_biometric_token';
const BIOMETRIC_ENABLED_KEY = '@sianlk_biometric_enabled';

export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
}

export async function getBiometricType(): Promise<string> {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'Face ID';
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'Fingerprint';
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'Iris';
  return 'Biometric';
}

export async function authenticateWithBiometric(reason?: string): Promise<boolean> {
  const available = await isBiometricAvailable();
  if (!available) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason ?? 'Authenticate to access Sianlk',
    cancelLabel: 'Cancel',
    fallbackLabel: 'Use Passcode',
    disableDeviceFallback: false,
  });

  Analytics.track('biometric_auth', { success: result.success, type: await getBiometricType() });
  return result.success;
}

export async function saveTokenBiometric(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token, {
    requireAuthentication: true,
    authenticationPrompt: 'Authenticate to save credentials for Sianlk',
  });
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
}

export async function getTokenBiometric(): Promise<string | null> {
  const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
  if (enabled !== 'true') return null;
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY, {
      requireAuthentication: true,
      authenticationPrompt: 'Authenticate to sign in to Sianlk',
    });
  } catch {
    return null;
  }
}

export async function disableBiometric(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'false');
}

export default {
  isBiometricAvailable,
  getBiometricType,
  authenticateWithBiometric,
  saveTokenBiometric,
  getTokenBiometric,
  disableBiometric,
};
