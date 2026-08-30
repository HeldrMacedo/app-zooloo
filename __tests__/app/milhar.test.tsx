// @ts-nocheck
import { fireEvent, render } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import MilharScreen from '../../app/aposta/milhar';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
}));

const setParams = (params: Record<string, unknown>) =>
  (useLocalSearchParams as jest.Mock).mockReturnValue(params);

describe('MilharScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('repassa digitos para a tela de premios', () => {
    // Regressao: digitos nao era repassado e premios gravava 4 fixo no carrinho.
    setParams({
      modalidadeId: '6',
      modalidadeNome: 'GRUPO',
      modalidadeSigla: 'G',
      digitos: '2',
    });

    const { getByPlaceholderText, getByText } = render(<MilharScreen />);

    fireEvent.changeText(getByPlaceholderText('00'), '12');
    fireEvent.press(getByText('Próximo'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/aposta/premios',
      params: expect.objectContaining({
        modalidadeId: '6',
        modalidadeNome: 'GRUPO',
        modalidadeSigla: 'G',
        digitos: '2',
        palpites: JSON.stringify(['12']),
      }),
    });
  });

  it('valida o palpite conforme os digitos da modalidade, nao 4 fixo', () => {
    setParams({
      modalidadeId: '6',
      modalidadeNome: 'GRUPO',
      modalidadeSigla: 'G',
      digitos: '2',
    });

    const { getByPlaceholderText, getByText, queryByText } = render(<MilharScreen />);

    // 2 digitos ja e um palpite completo para GRUPO
    fireEvent.changeText(getByPlaceholderText('00'), '12');
    expect(queryByText(/deve ter exatamente/)).toBeNull();
    fireEvent.press(getByText('Próximo'));
    expect(router.push).toHaveBeenCalled();
  });

  it('normaliza params repetidos na URL sem virar NaN', () => {
    setParams({
      modalidadeId: ['6', '9'],
      modalidadeNome: ['GRUPO'],
      modalidadeSigla: ['G'],
      digitos: ['2', '4'],
    });

    const { getByPlaceholderText } = render(<MilharScreen />);

    // digitos=2 vindo do primeiro item do array define o placeholder
    expect(getByPlaceholderText('00')).toBeTruthy();
  });
});
