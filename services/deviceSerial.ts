import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { getDeviceSerialStored, saveDeviceSerialStored } from './secureStorage';

/**
 * Identificador estável do dispositivo usado como `cad_terminal.serial`.
 *
 * - Android: Application.getAndroidId()
 * - iOS: identifierForVendor
 * - Fallback (web / ID indisponível): UUID persistido em SecureStore
 *
 * O valor exibido na tela de engrenagem deve ser o mesmo cadastrado no back-office.
 */
export async function getDeviceSerial(): Promise<string> {
  try {
    if (Platform.OS === 'android') {
      const androidId = Application.getAndroidId();
      if (androidId && androidId.trim() !== '') {
        return androidId.trim();
      }
    }

    if (Platform.OS === 'ios') {
      const iosId = await Application.getIosIdForVendorAsync();
      if (iosId && iosId.trim() !== '') {
        return iosId.trim();
      }
    }
  } catch {
    // cai no fallback
  }

  const stored = await getDeviceSerialStored();
  if (stored) return stored;

  const generated = generateFallbackSerial();
  await saveDeviceSerialStored(generated);
  return generated;
}

function generateFallbackSerial(): string {
  // UUID v4 simplificado (suficiente para dev/web; produção POS usa Android ID).
  const hex = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return `ZOOL-${hex()}${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`.toUpperCase();
}
