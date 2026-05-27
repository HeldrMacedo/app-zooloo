import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ApostaItem } from '@/types/aposta';

interface CarrinhoContextData {
  itens: ApostaItem[];
  adicionarItem: (item: Omit<ApostaItem, 'id_interno'>) => void;
  removerItem: (id_interno: string) => void;
  limparCarrinho: () => void;
  getTotalEstimado: () => number;
  itensQuantidade: number;
}

const CarrinhoContext = createContext<CarrinhoContextData | undefined>(undefined);

export const CarrinhoProvider = ({ children }: { children: ReactNode }) => {
  const [itens, setItens] = useState<ApostaItem[]>([]);

  const adicionarItem = (item: Omit<ApostaItem, 'id_interno'>) => {
    if (itens.length >= 150) {
      throw new Error('Limite máximo de 150 apostas atingido.');
    }
    const novoItem: ApostaItem = {
      ...item,
      id_interno: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
    };
    setItens((prev) => [...prev, novoItem]);
  };

  const removerItem = (id_interno: string) => {
    setItens((prev) => prev.filter((item) => item.id_interno !== id_interno));
  };

  const limparCarrinho = () => {
    setItens([]);
  };

  const getTotalEstimado = () => {
    return itens.reduce((total, item) => total + item.total_item, 0);
  };

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        adicionarItem,
        removerItem,
        limparCarrinho,
        getTotalEstimado,
        itensQuantidade: itens.length,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
};

export const useCarrinho = () => {
  const context = useContext(CarrinhoContext);
  if (context === undefined) {
    throw new Error('useCarrinho deve ser usado dentro de um CarrinhoProvider');
  }
  return context;
};
