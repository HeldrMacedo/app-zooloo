// @ts-nocheck
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { router } from 'expo-router';

import LoginScreen from '../../app/login';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

describe('LoginScreen', () => {
  it('renderiza campos de login vazios (sem defaults admin/admin)', () => {
    (useAuth as jest.Mock).mockReturnValue({ login: jest.fn() });
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText('Digite seu login').props.value).toBe('');
    expect(getByPlaceholderText('Digite sua senha').props.value).toBe('');
  });

  it('exibe ícone de engrenagem e navega para /terminal', () => {
    (useAuth as jest.Mock).mockReturnValue({ login: jest.fn() });
    const { getByTestId } = render(<LoginScreen />);
    fireEvent.press(getByTestId('login-gear-button'));
    expect(router.push).toHaveBeenCalledWith('/terminal');
  });

  it('alerta quando campos vazios e não chama login', () => {
    const login = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ login });
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Entrar'));
    expect(Alert.alert).toHaveBeenCalledWith('Erro', expect.stringMatching(/preencha/i));
    expect(login).not.toHaveBeenCalled();
  });

  it('chama login com credenciais trimadas em sucesso', async () => {
    const login = jest.fn().mockResolvedValue(undefined);
    (useAuth as jest.Mock).mockReturnValue({ login });
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('Digite seu login'), '  admin  ');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha'), '  secret  ');
    fireEvent.press(getByText('Entrar'));
    await waitFor(() =>
      expect(login).toHaveBeenCalledWith({ login: 'admin', password: 'secret' }),
    );
  });

  it('mostra Alert com mensagem de erro quando login rejeita', async () => {
    const login = jest.fn().mockRejectedValue(new Error('credenciais inválidas'));
    (useAuth as jest.Mock).mockReturnValue({ login });
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('Digite seu login'), 'u');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha'), 'p');
    fireEvent.press(getByText('Entrar'));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Erro no Login', 'credenciais inválidas'),
    );
  });
});
