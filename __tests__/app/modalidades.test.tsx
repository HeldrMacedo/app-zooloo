// @ts-nocheck
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router, useNavigation } from 'expo-router';
import ModalidadesScreen from '../../app/aposta/modalidades';
import { ApostaService } from '@/services/apostaService';
import { CarrinhoProvider } from '@/context/CarrinhoContext';

jest.mock('@/services/apostaService', () => ({
  ApostaService: {
    listarModalidades: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useNavigation: jest.fn(() => ({
    setOptions: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: (props: { name: string; testID?: string }) =>
      React.createElement(Text, { testID: props.testID || `icon-${props.name}` }, props.name),
  };
});

const mockModalidades = [
  { id: 2, nome: 'MILHAR', sigla: 'M', digitos: 4, ativa: true, filtro_banca: 1 },
  { id: 4, nome: 'CENTENA', sigla: 'C', digitos: 3, ativa: false, filtro_banca: 1 },
  { id: 6, nome: 'GRUPO', sigla: 'G', digitos: 2, ativa: true, filtro_banca: 1 },
];

describe('ModalidadesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    return render(
      <CarrinhoProvider>
        <ModalidadesScreen />
      </CarrinhoProvider>,
    );
  };

  it('exibe indicador de loading inicialmente', async () => {
    (ApostaService.listarModalidades as jest.Mock).mockReturnValue(new Promise(() => {}));

    const { getByTestId } = renderScreen();

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('lista as modalidades retornadas do backend com filtro_banca = 1', async () => {
    (ApostaService.listarModalidades as jest.Mock).mockResolvedValueOnce(mockModalidades);

    const { getByText, queryByTestId } = renderScreen();

    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
    });

    expect(ApostaService.listarModalidades).toHaveBeenCalledWith(1);
    expect(getByText('MILHAR')).toBeTruthy();
    expect(getByText('4 dígitos')).toBeTruthy();
    expect(getByText('CENTENA')).toBeTruthy();
    expect(getByText('3 dígitos')).toBeTruthy();
    expect(getByText('GRUPO')).toBeTruthy();
    expect(getByText('2 dígitos')).toBeTruthy();
  });

  it('navega para /aposta/milhar com parametros ao clicar em modalidade ativa', async () => {
    (ApostaService.listarModalidades as jest.Mock).mockResolvedValueOnce(mockModalidades);

    const { getByTestId } = renderScreen();

    await waitFor(() => {
      expect(getByTestId('modalidade-card-2')).toBeTruthy();
    });

    fireEvent.press(getByTestId('modalidade-card-2'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/aposta/milhar',
      params: {
        modalidadeId: '2',
        modalidadeNome: 'MILHAR',
        modalidadeSigla: 'M',
        digitos: '4',
      },
    });
  });

  it('nao navega ao clicar em modalidade inativa', async () => {
    (ApostaService.listarModalidades as jest.Mock).mockResolvedValueOnce(mockModalidades);

    const { getByTestId } = renderScreen();

    await waitFor(() => {
      expect(getByTestId('modalidade-card-4')).toBeTruthy();
    });

    fireEvent.press(getByTestId('modalidade-card-4'));

    expect(router.push).not.toHaveBeenCalled();
  });

  it('exibe mensagem de erro e botao de tentar novamente em caso de falha', async () => {
    (ApostaService.listarModalidades as jest.Mock).mockRejectedValueOnce(
      new Error('Erro de conexao'),
    );

    const { getByTestId, getByText } = renderScreen();

    await waitFor(() => {
      expect(getByTestId('error-container')).toBeTruthy();
    });

    expect(getByText('Erro de conexao')).toBeTruthy();

    // Simula retry com sucesso
    (ApostaService.listarModalidades as jest.Mock).mockResolvedValueOnce(mockModalidades);
    fireEvent.press(getByTestId('retry-button'));

    await waitFor(() => {
      expect(getByText('MILHAR')).toBeTruthy();
    });
  });

  it('configura o botao do carrinho no header com navegacao para preview', async () => {
    let setOptionsCallback: any;
    (useNavigation as jest.Mock).mockReturnValue({
      setOptions: jest.fn((options) => {
        setOptionsCallback = options;
      }),
    });

    (ApostaService.listarModalidades as jest.Mock).mockResolvedValueOnce(mockModalidades);

    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('MILHAR')).toBeTruthy();
    });

    expect(setOptionsCallback).toBeDefined();
    expect(setOptionsCallback.headerRight).toBeDefined();

    const HeaderRight = setOptionsCallback.headerRight;
    const { getByTestId } = render(<HeaderRight />);

    fireEvent.press(getByTestId('cart-button'));
    expect(router.push).toHaveBeenCalledWith('/aposta/preview');
  });
});
