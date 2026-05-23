// @ts-nocheck
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { AuthProvider, useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth';

jest.mock('../../services/auth', () => ({
  __esModule: true,
  default: {
    isAuthenticated: jest.fn(),
    getStoredUser: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

beforeEach(() => jest.clearAllMocks());

describe('AuthContext', () => {
  it('inicializa como não-autenticado após verificação', async () => {
    (AuthService.isAuthenticated as jest.Mock).mockResolvedValue(false);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('carrega user quando isAuthenticated=true', async () => {
    const u = { id: '1', login: 'admin', name: 'A', email: 'x', active: 'Y' };
    (AuthService.isAuthenticated as jest.Mock).mockResolvedValue(true);
    (AuthService.getStoredUser as jest.Mock).mockResolvedValue(u);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(u);
  });

  it('login bem-sucedido atualiza estado', async () => {
    (AuthService.isAuthenticated as jest.Mock).mockResolvedValue(false);
    const u = { id: '1', login: 'admin', name: 'A', email: 'x', active: 'Y' };
    (AuthService.login as jest.Mock).mockResolvedValue({ success: true, message: 'ok', user: u });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.login({ login: 'admin', password: 'x' });
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(u);
  });

  it('login falho mantém deslogado e propaga erro', async () => {
    (AuthService.isAuthenticated as jest.Mock).mockResolvedValue(false);
    (AuthService.login as jest.Mock).mockRejectedValue(new Error('bad creds'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await expect(
      act(async () => {
        await result.current.login({ login: 'x', password: 'y' });
      }),
    ).rejects.toThrow('bad creds');
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logout limpa estado mesmo se serviço falhar', async () => {
    (AuthService.isAuthenticated as jest.Mock).mockResolvedValue(true);
    (AuthService.getStoredUser as jest.Mock).mockResolvedValue({ id: '1', login: 'a', name: '', email: '', active: 'Y' });
    (AuthService.logout as jest.Mock).mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    await act(async () => {
      await result.current.logout();
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('useAuth lança fora do AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
  });
});
