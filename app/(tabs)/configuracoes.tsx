import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/assets/styles/colors';
import { PreferredPrinter, PrinterService } from '@/services/PrinterService';
import { BluetoothDevice } from '../../modules/zooloo-printer';

export default function ConfiguracoesScreen() {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [preferred, setPreferred] = useState<PreferredPrinter | null>(null);
  const [printing, setPrinting] = useState(false);
  const [internalAvailable, setInternalAvailable] = useState(false);

  const loadDevices = useCallback(async () => {
    setLoading(true);
    try {
      const internal = await PrinterService.isInternalPrinterAvailable();
      setInternalAvailable(internal);

      const ok = await PrinterService.ensureBluetoothPermissions();
      if (!ok) {
        Alert.alert(
          'Permissão necessária',
          'Ative a permissão de Bluetooth para listar e conectar impressoras.',
        );
        setDevices([]);
        return;
      }

      const preferredPrinter = await PrinterService.getPreferredPrinter();
      setPreferred(preferredPrinter);

      const pairedDevices = await PrinterService.getPairedDevices();
      setDevices(pairedDevices);

      const alreadyConnected = await PrinterService.isConnected();
      if (alreadyConnected && preferredPrinter) {
        setConnectedDevice(preferredPrinter.macAddress);
      } else if (preferredPrinter) {
        const reconnected = await PrinterService.ensureConnected();
        if (reconnected) {
          setConnectedDevice(preferredPrinter.macAddress);
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível buscar as impressoras pareadas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const handleConnect = async (device: BluetoothDevice) => {
    setConnectingTo(device.macAddress);
    try {
      if (connectedDevice) {
        await PrinterService.disconnect();
      }

      const success = await PrinterService.connect(device.macAddress, device.name);

      if (success) {
        setConnectedDevice(device.macAddress);
        setPreferred({ name: device.name, macAddress: device.macAddress });
        Alert.alert('Sucesso', `Conectado à impressora: ${device.name}`);
      } else {
        Alert.alert(
          'Erro',
          'Falha ao conectar na impressora. Verifique se ela está ligada e pareada corretamente.',
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar conectar.');
    } finally {
      setConnectingTo(null);
    }
  };

  const handleDisconnect = async () => {
    await PrinterService.disconnect();
    setConnectedDevice(null);
    Alert.alert('Desconectado', 'Impressora desconectada.');
  };

  const handleClearPreferred = async () => {
    await PrinterService.disconnect();
    await PrinterService.clearPreferredPrinter();
    setConnectedDevice(null);
    setPreferred(null);
  };

  const handleTestPrint = async () => {
    setPrinting(true);
    try {
      const connected = await PrinterService.ensureConnected();
      if (!connected) {
        Alert.alert('Atenção', 'Conecte-se a uma impressora primeiro.');
        return;
      }

      if (preferred) {
        setConnectedDevice(preferred.macAddress);
      }

      const success = await PrinterService.printReceipt([
        'ZOOLOO BET - TESTE DE IMPRESSÃO',
        '===============================',
        'Data: ' + new Date().toLocaleString(),
        'Terminal: CAIXA-01',
        '',
        'A conexão Bluetooth e os',
        'comandos nativos ESC/POS',
        'estão funcionando perfeitamente!',
        '===============================',
        'Obrigado por utilizar o Zooloo',
      ]);

      if (success) {
        Alert.alert('Sucesso', 'Cupom de teste enviado para a impressora.');
      } else {
        Alert.alert('Erro', 'Falha ao imprimir o teste. Verifique a conexão e tente novamente.');
      }
    } finally {
      setPrinting(false);
    }
  };

  const renderItem = ({ item }: { item: BluetoothDevice }) => {
    const isConnected = connectedDevice === item.macAddress;
    const isConnecting = connectingTo === item.macAddress;
    const isPreferred = preferred?.macAddress === item.macAddress;

    return (
      <TouchableOpacity
        style={[styles.deviceCard, isConnected && styles.deviceCardConnected]}
        onPress={() => handleConnect(item)}
        disabled={isConnecting}
      >
        <View style={styles.deviceInfo}>
          <Ionicons
            name="print-outline"
            size={24}
            color={isConnected ? '#fff' : colors.gray[700]}
          />
          <View style={styles.deviceTextContainer}>
            <Text style={[styles.deviceName, isConnected && styles.textWhite]}>
              {item.name}
              {isPreferred && !isConnected ? ' (preferida)' : ''}
            </Text>
            <Text style={[styles.deviceMac, isConnected && styles.textWhite]}>
              {item.macAddress}
            </Text>
          </View>
        </View>

        {isConnecting ? (
          <ActivityIndicator color={isConnected ? '#fff' : colors.blue[500]} />
        ) : (
          <Ionicons
            name={isConnected ? 'checkmark-circle' : 'chevron-forward'}
            size={24}
            color={isConnected ? '#fff' : colors.gray[400]}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Impressoras Bluetooth</Text>
        <TouchableOpacity onPress={loadDevices} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color={colors.blue[600]} />
          <Text style={styles.refreshText}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      {preferred && (
        <View style={styles.preferredBanner}>
          <Ionicons name="star" size={16} color={colors.blue[600]} />
          <Text style={styles.preferredText}>
            Preferida: {preferred.name} ({preferred.macAddress})
          </Text>
          <TouchableOpacity onPress={handleClearPreferred} hitSlop={8}>
            <Text style={styles.clearPreferred}>Limpar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.internalBanner}>
        <Ionicons
          name={internalAvailable ? 'hardware-chip-outline' : 'information-circle-outline'}
          size={16}
          color={internalAvailable ? colors.green[600] : colors.gray[500]}
        />
        <Text style={styles.internalBannerText}>
          {internalAvailable
            ? 'Impressora interna da maquininha disponível neste dispositivo.'
            : 'Impressora interna (CloudPOS) indisponível neste build. Use Bluetooth.'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.blue[500]} />
          <Text style={styles.loadingText}>Buscando dispositivos...</Text>
        </View>
      ) : devices.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="bluetooth-outline" size={48} color={colors.gray[400]} />
          <Text style={styles.emptyText}>Nenhuma impressora pareada encontrada.</Text>
          <Text style={styles.emptySubText}>
            1. Conceda permissão de Bluetooth ao app.{'\n'}
            2. Pareie a impressora nas configurações do Android.{'\n'}
            3. Toque em Atualizar.
          </Text>
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.macAddress}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {(connectedDevice || preferred) && (
        <View style={styles.footer}>
          {connectedDevice && (
            <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
              <Ionicons name="close-circle-outline" size={20} color={colors.gray[700]} />
              <Text style={styles.disconnectButtonText}>Desconectar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.testButton, printing && styles.testButtonDisabled]}
            onPress={handleTestPrint}
            disabled={printing}
          >
            {printing ? (
              <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons
                name="receipt-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={styles.testButtonText}>
              {printing ? 'Imprimindo...' : 'Imprimir Cupom de Teste'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.screen,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.blue[50],
    borderRadius: 8,
  },
  refreshText: {
    marginLeft: 4,
    color: colors.blue[600],
    fontWeight: '600',
  },
  preferredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.blue[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  preferredText: {
    flex: 1,
    fontSize: 13,
    color: colors.gray[700],
  },
  clearPreferred: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.blue[600],
  },
  internalBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.gray[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  internalBannerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.gray[600],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: colors.gray[600],
    fontSize: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[700],
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  listContainer: {
    padding: 16,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  deviceCardConnected: {
    backgroundColor: colors.blue[500],
    borderColor: colors.blue[600],
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceTextContainer: {
    marginLeft: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  deviceMac: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  textWhite: {
    color: '#fff',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: 10,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.gray[50],
  },
  disconnectButtonText: {
    color: colors.gray[700],
    fontSize: 15,
    fontWeight: '600',
  },
  testButton: {
    flexDirection: 'row',
    backgroundColor: colors.green[600],
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonDisabled: {
    opacity: 0.7,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
