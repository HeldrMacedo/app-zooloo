// @ts-nocheck
// Mocks globais. Carregado via "setupFiles" do Jest (antes do framework de teste).
// Tipos de jest passam a resolver após `npm install`.

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
    setItemAsync: jest.fn(async (k: string, v: string) => { store.set(k, v); }),
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    deleteItemAsync: jest.fn(async (k: string) => { store.delete(k); }),
    __reset: () => store.clear(),
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { hostUri: '192.168.1.10:8081', extra: {} },
  },
}));

// Safe area estável em testes (sem depender de metrics nativas).
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 390, height: 844 };
  const passthrough = function Passthrough(props) {
    return props.children ?? null;
  };

  return {
    SafeAreaProvider: passthrough,
    SafeAreaConsumer: function SafeAreaConsumer(props) {
      return props.children(inset);
    },
    SafeAreaView: passthrough,
    useSafeAreaInsets: function useSafeAreaInsets() {
      return inset;
    },
    useSafeAreaFrame: function useSafeAreaFrame() {
      return frame;
    },
    initialWindowMetrics: { insets: inset, frame },
  };
});

jest.mock('expo-system-ui', () => ({
  setBackgroundColorAsync: jest.fn(async () => {}),
  getBackgroundColorAsync: jest.fn(async () => null),
}));

jest.mock('expo-navigation-bar', () => ({
  setBackgroundColorAsync: jest.fn(async () => {}),
  setButtonStyleAsync: jest.fn(async () => {}),
  setPositionAsync: jest.fn(async () => {}),
  setVisibilityAsync: jest.fn(async () => {}),
}));
