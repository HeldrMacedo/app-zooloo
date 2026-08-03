import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/assets/styles/colors';
import { PrinterService } from '@/services/PrinterService';
import { BluetoothDevice } from '../../modules/zooloo-printer';

export default function ConfiguracoesScreen() {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const pairedDevices = await PrinterService.getPairedDevices();
      setDevices(pairedDevices);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível buscar as impressoras pareadas.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (device: BluetoothDevice) => {
    setConnectingTo(device.macAddress);
    try {
      // Se houver uma conectada, desconecta primeiro
      if (connectedDevice) {
        await PrinterService.disconnect();
      }

      const success = await PrinterService.connect(device.macAddress);
      
      if (success) {
        setConnectedDevice(device.macAddress);
        Alert.alert('Sucesso', `Conectado à impressora: ${device.name}`);
      } else {
        Alert.alert('Erro', 'Falha ao conectar na impressora. Verifique se ela está ligada e pareada corretamente.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar conectar.');
    } finally {
      setConnectingTo(null);
    }
  };

  const handleTestPrint = async () => {
    if (!connectedDevice) {
      Alert.alert('Atenção', 'Conecte-se a uma impressora primeiro.');
      return;
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
      'Obrigado por utilizar o Zooloo'
    ]);
    if (!success) {
      Alert.alert('Erro', 'Falha ao imprimir o teste.');
    }
  };

  const renderItem = ({ item }: { item: BluetoothDevice }) => {
    const isConnected = connectedDevice === item.macAddress;
    const isConnecting = connectingTo === item.macAddress;

    return (
      <TouchableOpacity 
        style={[styles.deviceCard, isConnected && styles.deviceCardConnected]}
        onPress={() => handleConnect(item)}
        disabled={isConnecting}
      >
        <View style={styles.deviceInfo}>
          <Ionicons name="print-outline" size={24} color={isConnected ? '#fff' : colors.gray[700]} />
          <View style={styles.deviceTextContainer}>
            <Text style={[styles.deviceName, isConnected && styles.textWhite]}>{item.name}</Text>
            <Text style={[styles.deviceMac, isConnected && styles.textWhite]}>{item.macAddress}</Text>
          </View>
        </View>
        
        {isConnecting ? (
          <ActivityIndicator color={isConnected ? '#fff' : colors.blue[500]} />
        ) : (
          <Ionicons 
            name={isConnected ? "checkmark-circle" : "chevron-forward"} 
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

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.blue[500]} />
          <Text style={styles.loadingText}>Buscando dispositivos...</Text>
        </View>
      ) : devices.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="bluetooth-outline" size={48} color={colors.gray[400]} />
          <Text style={styles.emptyText}>Nenhuma impressora pareada encontrada.</Text>
          <Text style={styles.emptySubText}>Pareie o dispositivo nas configurações do Android e tente novamente.</Text>
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.macAddress}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {connectedDevice && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.testButton} onPress={handleTestPrint}>
            <Ionicons name="receipt-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.testButtonText}>Imprimir Cupom de Teste</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
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
  },
  testButton: {
    flexDirection: 'row',
    backgroundColor: colors.green[500],
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
