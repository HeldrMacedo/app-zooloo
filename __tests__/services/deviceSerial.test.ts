// @ts-nocheck
import * as Application from 'expo-application';
import { Platform } from 'react-native';

import { getDeviceSerial } from '../../services/deviceSerial';
import { getDeviceSerialStored, saveDeviceSerialStored } from '../../services/secureStorage';

jest.mock('../../services/secureStorage', () => {
  const actual = jest.requireActual('../../services/secureStorage');
  return {
    ...actual,
    getDeviceSerialStored: jest.fn(),
    saveDeviceSerialStored: jest.fn(),
  };
});

describe('getDeviceSerial', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    jest.clearAllMocks();
  });

  it('usa Android ID no Android', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    (Application.getAndroidId as jest.Mock).mockReturnValue('  and-id-123  ');
    await expect(getDeviceSerial()).resolves.toBe('and-id-123');
  });

  it('usa identifierForVendor no iOS', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    (Application.getIosIdForVendorAsync as jest.Mock).mockResolvedValue('ios-vendor-9');
    await expect(getDeviceSerial()).resolves.toBe('ios-vendor-9');
  });

  it('fallback: reutiliza serial já persistido', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    (getDeviceSerialStored as jest.Mock).mockResolvedValue('ZOOL-CACHED');
    await expect(getDeviceSerial()).resolves.toBe('ZOOL-CACHED');
    expect(saveDeviceSerialStored).not.toHaveBeenCalled();
  });

  it('fallback: gera e persiste quando não há ID nativo', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    (getDeviceSerialStored as jest.Mock).mockResolvedValue(null);
    (saveDeviceSerialStored as jest.Mock).mockResolvedValue(undefined);
    const serial = await getDeviceSerial();
    expect(serial).toMatch(/^ZOOL-/);
    expect(saveDeviceSerialStored).toHaveBeenCalledWith(serial);
  });
});
