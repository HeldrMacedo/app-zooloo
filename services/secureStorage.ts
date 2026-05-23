import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'zooloo.auth.token';
const REFRESH_TOKEN_KEY = 'zooloo.auth.refresh';
const USER_KEY = 'zooloo.auth.user';
const LEGACY_TOKEN_KEY = 'userToken';
const LEGACY_USER_KEY = 'userData';

const secureAvailable = Platform.OS === 'ios' || Platform.OS === 'android';

async function setSecure(key: string, value: string): Promise<void> {
  if (secureAvailable) {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  } else {
    await AsyncStorage.setItem(key, value);
  }
}

async function getSecure(key: string): Promise<string | null> {
  if (secureAvailable) {
    return SecureStore.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
}

async function deleteSecure(key: string): Promise<void> {
  if (secureAvailable) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
}

export async function saveToken(token: string): Promise<void> {
  await setSecure(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  let token = await getSecure(TOKEN_KEY);
  if (token) return token;
  const legacy = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);
  if (legacy) {
    await setSecure(TOKEN_KEY, legacy);
    await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
    token = legacy;
  }
  return token;
}

export async function clearToken(): Promise<void> {
  await deleteSecure(TOKEN_KEY);
  await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
}

export async function saveRefreshToken(token: string): Promise<void> {
  await setSecure(REFRESH_TOKEN_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return getSecure(REFRESH_TOKEN_KEY);
}

export async function clearRefreshToken(): Promise<void> {
  await deleteSecure(REFRESH_TOKEN_KEY);
}

export async function saveUser<T>(user: T): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser<T>(): Promise<T | null> {
  const raw =
    (await AsyncStorage.getItem(USER_KEY)) ??
    (await AsyncStorage.getItem(LEGACY_USER_KEY));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
  await AsyncStorage.removeItem(LEGACY_USER_KEY);
}
