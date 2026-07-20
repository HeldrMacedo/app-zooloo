import { colors } from '@/assets/styles/colors';
import { BilheteRegistroResponse } from '@/types/aposta';
import { Ionicons } from '@expo/vector-icons';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PuleTermicaProps {
  data: BilheteRegistroResponse;
  onFechar: () => void;
}

const mono = Platform.OS === 'ios' ? 'Courier' : 'monospace';

export default function PuleTermica({ data, onFechar }: PuleTermicaProps) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recibo Emitido</Text>
        <TouchableOpacity onPress={onFechar} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.gray[700]} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.ticket}>
          <Text style={[styles.mono, styles.ticketTitle]}>*** JOGO DO BICHO ***</Text>
          <Text style={[styles.mono, styles.ticketSubtitle]}>Via do Cliente</Text>

          <Text style={[styles.mono, styles.line]}>DATA/HORA: {data.data_hora}</Text>
          <Text style={[styles.mono, styles.line]}>VENDEDOR: {data.vendedor_nome}</Text>
          <Text style={[styles.mono, styles.line]}>BILHETE : {data.bilhete_numero}</Text>
          <Text style={[styles.mono, styles.lineSpaced]}>NSU     : {data.jb_id}</Text>

          <Text style={[styles.mono, styles.divider]}>--------------------------------</Text>

          <Text style={[styles.mono, styles.sectionLabel]}>APOSTAS REGISTRADAS</Text>
          <Text style={[styles.mono, styles.lineSpaced]}>
            Consulte os detalhes no histórico.
          </Text>

          <Text style={[styles.mono, styles.divider]}>--------------------------------</Text>

          <View style={styles.totalRow}>
            <Text style={[styles.mono, styles.totalText]}>TOTAL R$</Text>
            <Text style={[styles.mono, styles.totalText]}>
              {data.total_bilhete.toFixed(2).replace('.', ',')}
            </Text>
          </View>

          <Text style={[styles.mono, styles.hashTitle]}>HASH DE SEGURANÇA</Text>
          <Text style={[styles.mono, styles.hashValue]}>{data.string_autorizacao}</Text>

          <Text style={[styles.mono, styles.footer]}>Boa sorte!</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  ticket: {
    backgroundColor: colors.yellow[50],
    padding: 16,
    width: '100%',
    maxWidth: 350,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  mono: {
    fontFamily: mono,
  },
  ticketTitle: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8,
  },
  ticketSubtitle: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 16,
  },
  line: {
    fontSize: 14,
    marginBottom: 4,
  },
  lineSpaced: {
    fontSize: 14,
    marginBottom: 16,
  },
  divider: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 8,
  },
  sectionLabel: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalText: {
    fontWeight: '700',
    fontSize: 18,
  },
  hashTitle: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
    marginTop: 16,
    marginBottom: 8,
  },
  hashValue: {
    textAlign: 'center',
    fontSize: 12,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
    color: colors.gray[500],
  },
});
