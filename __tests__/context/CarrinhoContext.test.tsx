import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { CarrinhoProvider, useCarrinho } from '../../context/CarrinhoContext';

describe('CarrinhoContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CarrinhoProvider>{children}</CarrinhoProvider>
  );

  const mockItem = {
    modalidade: { id: 2, nome: 'MILHAR', sigla: 'M', digitos: 4 },
    palpites: ['1234'],
    colocacao_inicial: 1,
    colocacao_final: 5,
    valor_palpite: 5.0,
    total_item: 25.0,
    bitT_rateado: false,
  };

  it('deve inicializar com carrinho vazio', () => {
    const { result } = renderHook(() => useCarrinho(), { wrapper });
    
    expect(result.current.itens).toEqual([]);
    expect(result.current.itensQuantidade).toBe(0);
    expect(result.current.getTotalEstimado()).toBe(0);
  });

  it('deve adicionar um item ao carrinho', () => {
    const { result } = renderHook(() => useCarrinho(), { wrapper });
    
    act(() => {
      result.current.adicionarItem(mockItem);
    });

    expect(result.current.itens.length).toBe(1);
    expect(result.current.itens[0].modalidade.nome).toBe('MILHAR');
    expect(result.current.itens[0].id_interno).toBeDefined();
    expect(result.current.itensQuantidade).toBe(1);
    expect(result.current.getTotalEstimado()).toBe(25.0);
  });

  it('deve remover um item do carrinho', () => {
    const { result } = renderHook(() => useCarrinho(), { wrapper });
    
    act(() => {
      result.current.adicionarItem(mockItem);
    });
    
    const id_interno = result.current.itens[0].id_interno;
    
    act(() => {
      result.current.removerItem(id_interno);
    });

    expect(result.current.itens.length).toBe(0);
  });

  it('deve limpar o carrinho', () => {
    const { result } = renderHook(() => useCarrinho(), { wrapper });
    
    act(() => {
      result.current.adicionarItem(mockItem);
      result.current.adicionarItem({ ...mockItem, total_item: 10.0 });
    });
    
    expect(result.current.itens.length).toBe(2);
    
    act(() => {
      result.current.limparCarrinho();
    });

    expect(result.current.itens.length).toBe(0);
    expect(result.current.getTotalEstimado()).toBe(0);
  });

  it('deve respeitar o limite de 150 itens', () => {
    const { result } = renderHook(() => useCarrinho(), { wrapper });
    
    act(() => {
      for (let i = 0; i < 150; i++) {
        result.current.adicionarItem(mockItem);
      }
    });

    expect(result.current.itens.length).toBe(150);

    // Tentando adicionar o 151º
    expect(() => {
      act(() => {
        result.current.adicionarItem(mockItem);
      });
    }).toThrow('Limite máximo de 150 apostas atingido.');
  });
});
