// @ts-nocheck
import { fireEvent, render } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import PremiosScreen from '../../app/aposta/premios';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    dismissAll: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({})),
}));

const adicionarItem = jest.fn();
jest.mock('@/context/CarrinhoContext', () => ({
  useCarrinho: () => ({ adicionarItem: mockAdicionarItem() }),
}));
// indireção para o mock enxergar a fn declarada acima
function mockAdicionarItem() {
  return adicionarItem;
}

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: (props: { name: string; testID?: string }) =>
      React.createElement(Text, { testID: props.testID || `icon-${props.name}` }, props.name),
  };
});

const baseParams = {
  modalidadeId: '6',
  modalidadeNome: 'GRUPO',
  modalidadeSigla: 'G',
  digitos: '2',
  palpites: JSON.stringify(['12']),
};

const setParams = (params: Record<string, unknown>) =>
  (useLocalSearchParams as jest.Mock).mockReturnValue(params);

describe('PremiosScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('usa os digitos recebidos por param, nao 4 fixo', () => {
    // Regressao: o item ia para o carrinho sempre com digitos: 4.
    setParams(baseParams);

    const { getByText, getByPlaceholderText } = render(<PremiosScreen />);

    // O botao so habilita com valor > 0.
    fireEvent.changeText(getByPlaceholderText('0,00'), '2,00');
    fireEvent.press(getByText('Adicionar ao Carrinho'));

    expect(adicionarItem).toHaveBeenCalledWith(
      expect.objectContaining({
        palpites: ['12'],
        modalidade: expect.objectContaining({
          id: 6,
          sigla: 'G',
          nome: 'GRUPO',
          digitos: 2,
        }),
      }),
    );
  });

  it('nao quebra com palpites malformado e mostra estado de erro', () => {
    // Regressao: JSON.parse sem guarda derrubava a tela durante o render.
    setParams({ ...baseParams, palpites: '{{{' });

    expect(() => render(<PremiosScreen />)).not.toThrow();
    const { getByTestId } = render(<PremiosScreen />);
    expect(getByTestId('premios-sem-palpites')).toBeTruthy();
  });

  it('nao quebra quando palpites vem repetido como array na URL', () => {
    setParams({ ...baseParams, palpites: [JSON.stringify(['12']), 'lixo'] });

    expect(() => render(<PremiosScreen />)).not.toThrow();
  });

  it('chama apenas dismissAll ao adicionar, sem push duplicado', () => {
    // Regressao: dismissAll + push empilhava uma segunda copia de modalidades.
    setParams(baseParams);

    const { getByText, getByPlaceholderText } = render(<PremiosScreen />);
    fireEvent.changeText(getByPlaceholderText('0,00'), '2,00');
    fireEvent.press(getByText('Adicionar ao Carrinho'));

    expect(router.dismissAll).toHaveBeenCalledTimes(1);
    expect(router.push).not.toHaveBeenCalled();
  });
});
