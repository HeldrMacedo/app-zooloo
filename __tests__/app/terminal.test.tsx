// @ts-nocheck
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';

import TerminalScreen from '../../app/terminal';
import { getDeviceSerial } from '@/services/deviceSerial';

jest.mock('@/services/deviceSerial', () => ({
  getDeviceSerial: jest.fn(async () => 'SERIAL-TEST-999'),
}));

// Screen puxa system bars / safe area — já mockados em setup; evita flakiness de ícones.
jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function MaterialIconsMock(props) {
    return React.createElement(Text, { testID: `icon-${props.name}` }, props.name);
  };
});

describe('TerminalScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDeviceSerial as jest.Mock).mockResolvedValue('SERIAL-TEST-999');
  });

  it('exibe o serial do dispositivo', async () => {
    const { getByTestId } = render(<TerminalScreen />);
    await waitFor(
      () => {
        expect(getByTestId('terminal-serial-value').props.children).toBe('SERIAL-TEST-999');
      },
      { timeout: 10000 },
    );
  });

  it('copia o serial ao pressionar o botão', async () => {
    const { getByTestId } = render(<TerminalScreen />);
    await waitFor(() => getByTestId('terminal-serial-value'), { timeout: 10000 });
    fireEvent.press(getByTestId('terminal-copy-button'));
    await waitFor(() => {
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('SERIAL-TEST-999');
    });
  });

  it('volta ao login', async () => {
    const { getByText } = render(<TerminalScreen />);
    await waitFor(() => getByText('Voltar ao login'), { timeout: 10000 });
    fireEvent.press(getByText('Voltar ao login'));
    expect(router.replace).toHaveBeenCalledWith('/login');
  });

  describe('botão voltar do header', () => {
    it('usa o histórico quando existe', async () => {
      (router.canGoBack as jest.Mock).mockReturnValue(true);

      const { getByTestId } = render(<TerminalScreen />);
      await waitFor(() => getByTestId('terminal-back-button'), { timeout: 10000 });
      fireEvent.press(getByTestId('terminal-back-button'));

      expect(router.back).toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
    });

    it('cai para /login em cold start, quando não há histórico', async () => {
      // `terminal` é rota pública: pode ser aberta direto, sem tela anterior.
      (router.canGoBack as jest.Mock).mockReturnValue(false);

      const { getByTestId } = render(<TerminalScreen />);
      await waitFor(() => getByTestId('terminal-back-button'), { timeout: 10000 });
      fireEvent.press(getByTestId('terminal-back-button'));

      expect(router.back).not.toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith('/login');
    });
  });
});
