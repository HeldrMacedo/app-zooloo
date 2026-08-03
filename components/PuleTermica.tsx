import { colors } from '@/assets/styles/colors';
import { BilheteRegistroResponse } from '@/types/aposta';
import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface PuleTermicaProps {
  data: BilheteRegistroResponse;
  onFechar: () => void;
}

const mono = Platform.OS === 'ios' ? 'Courier' : 'monospace';

function getSiglaModalidade(nome: string): string {
  const n = (nome || '').toUpperCase();
  if (n.includes('MILHAR')) return 'M';
  if (n.includes('CENTENA')) return 'C';
  if (n.includes('DEZENA')) return 'D';
  if (n.includes('GRUPO')) return 'G';
  if (n.includes('PASSE')) return 'PS';
  if (n.includes('DUQUE')) return 'DD';
  if (n.includes('TERNO')) return 'TD';
  if (n.includes('SENINHA')) return 'SEN';
  if (n.includes('QUININHA')) return 'QUI';
  if (n.includes('LOTINHA')) return 'LOT';
  return 'J';
}

function gerarTextoComprovante(data: BilheteRegistroResponse): string {
  const dataHora = data.data_hora || new Date().toLocaleString('pt-BR');
  const vendedor = (data.vendedor_nome || 'OPERADOR').toUpperCase();
  const ponto = (data.area_descricao || 'PRJ').toUpperCase();
  const autorizacao = data.string_autorizacao || '00000000';
  const bilheteNo = String(data.bilhete_numero || data.jb_id || 0).padStart(6, '0');
  const terminal = data.terminal_id || 'POS-MOBILE';

  const extracaoDesc =
    data.sorteios && data.sorteios.length > 0
      ? data.sorteios[0].extracao_descricao.toUpperCase()
      : 'JOGO DO BICHO';

  const sorteioNo =
    data.sorteios && data.sorteios[0]?.sorteio_numero
      ? String(data.sorteios[0].sorteio_numero).padStart(6, '0')
      : '000001';

  const lines: string[] = [];

  lines.push('ZOOLOO - COMPROVANTE');
  lines.push(`Aut: ${autorizacao}`);
  lines.push(`Data: ${dataHora.split(' ')[0] || dataHora}`);
  lines.push('Pule - Sorteio');
  lines.push(`${sorteioNo} ${extracaoDesc}`);
  lines.push(`Ponto: ${ponto}`);
  lines.push(`Data: ${dataHora}`);
  lines.push(`Terminal: ${terminal}`);
  lines.push(`Operador: ${vendedor}`);
  lines.push('---------------------APOSTAS-------------------');

  if (data.sorteios && data.sorteios.length > 0) {
    data.sorteios.forEach((s) => {
      lines.push((s.modalidade_apresentacao || 'APOSTA').toUpperCase());
      const palpitesStr = Array.isArray(s.palpites) ? s.palpites.join(', ') : String(s.palpites);
      const dots = '.'.repeat(Math.max(2, 45 - palpitesStr.length));
      lines.push(`${palpitesStr}${dots}`);

      const sigla = getSiglaModalidade(s.modalidade_apresentacao);
      const coloc =
        s.colocao_inicial === s.colocao_final
          ? `${sigla} ${s.colocao_inicial}`
          : `${sigla} ${s.colocao_inicial} ao ${s.colocao_final}`;

      const valor = `R$ ${s.valor_palpites.toFixed(2).replace('.', ',')}`;
      lines.push(coloc);
      lines.push(valor);
    });
  } else {
    lines.push('APOSTA REGISTRADA');
    lines.push(`R$ ${(data.total_bilhete || 0).toFixed(2).replace('.', ',')}`);
  }

  lines.push('-----------------------------------------------');
  lines.push('Total:');
  lines.push(`R$ ${(data.total_bilhete || 0).toFixed(2).replace('.', ',')}`);
  lines.push('-----------------------------------------------');
  lines.push('ATENÇÃO, TODAS AS APOSTAS A PARTIR DE 5,00 TERÃO');
  lines.push('DIREITO A MILHAR BRINDE, QUE SERÁ PREMIADA NO');
  lines.push('VALOR DE 300,00.');
  lines.push('-- BILHETE VÁLIDO PARA RECLAMAÇÃO --');
  lines.push('-----------------------------------------------');
  lines.push('Reclamações: 6 dia(s)');
  lines.push('-----------------------------------------------');
  lines.push(`${autorizacao}`);
  lines.push(`Bilhete: ${bilheteNo}`);
  lines.push('-----------------------------------------------');
  lines.push('Pagamento:');
  lines.push('Dinheiro');

  return lines.join('\n');
}

export default function PuleTermica({ data, onFechar }: PuleTermicaProps) {
  const handleImprimir = async () => {
    const texto = gerarTextoComprovante(data);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).print) {
      (window as any).print();
      return;
    }

    try {
      await Share.share({
        title: 'Imprimir Comprovante Zooloo',
        message: texto,
      });
    } catch {
      Alert.alert('Impressão', 'Comando de impressão enviado para a impressora térmica.');
    }
  };

  const handleWhatsApp = async () => {
    const texto = gerarTextoComprovante(data);
    const url = `whatsapp://send?text=${encodeURIComponent(texto)}`;
    const webUrl = `https://wa.me/?text=${encodeURIComponent(texto)}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        const canOpenWeb = await Linking.canOpenURL(webUrl);
        if (canOpenWeb) {
          await Linking.openURL(webUrl);
        } else {
          await Share.share({
            message: texto,
          });
        }
      }
    } catch {
      try {
        await Share.share({
          message: texto,
        });
      } catch {
        Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
      }
    }
  };

  const dataHora = data.data_hora || new Date().toLocaleString('pt-BR');
  const vendedor = (data.vendedor_nome || 'OPERADOR').toUpperCase();
  const ponto = (data.area_descricao || 'PRJ').toUpperCase();
  const autorizacao = data.string_autorizacao || '00000000';
  const bilheteNo = String(data.bilhete_numero || data.jb_id || 0).padStart(6, '0');
  const terminal = data.terminal_id || 'POS-MOBILE';

  const primeiroSorteio = data.sorteios && data.sorteios.length > 0 ? data.sorteios[0] : null;
  const extracaoDesc = primeiroSorteio ? primeiroSorteio.extracao_descricao.toUpperCase() : 'JOGO DO BICHO';
  const sorteioNo = primeiroSorteio?.sorteio_numero ? String(primeiroSorteio.sorteio_numero).padStart(6, '0') : '000001';

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comprovante de Aposta</Text>
        <TouchableOpacity onPress={onFechar} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.gray[700]} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.ticket}>
          <Text style={[styles.mono, styles.ticketTitle]}>ZOOLOO - COMPROVANTE</Text>

          <Text style={[styles.mono, styles.line]}>Aut: {autorizacao}</Text>
          <Text style={[styles.mono, styles.line]}>Data: {dataHora.split(' ')[0] || dataHora}</Text>
          <Text style={[styles.mono, styles.line]}>Pule - Sorteio</Text>
          <Text style={[styles.mono, styles.lineBold]}>{sorteioNo} {extracaoDesc}</Text>
          <Text style={[styles.mono, styles.line]}>Ponto: {ponto}</Text>
          <Text style={[styles.mono, styles.line]}>Data: {dataHora}</Text>
          <Text style={[styles.mono, styles.line]}>Terminal: {terminal}</Text>
          <Text style={[styles.mono, styles.line]}>Operador: {vendedor}</Text>

          <Text style={[styles.mono, styles.divider]}>---------------------APOSTAS-------------------</Text>

          {data.sorteios && data.sorteios.length > 0 ? (
            data.sorteios.map((s, index) => {
              const palpitesStr = Array.isArray(s.palpites) ? s.palpites.join(', ') : String(s.palpites);
              const sigla = getSiglaModalidade(s.modalidade_apresentacao);
              const coloc =
                s.colocao_inicial === s.colocao_final
                  ? `${sigla} ${s.colocao_inicial}`
                  : `${sigla} ${s.colocao_inicial} ao ${s.colocao_final}`;

              return (
                <View key={s.jb_sorteio_id || index} style={styles.apostaGroup}>
                  <Text style={[styles.mono, styles.modTitle]}>{(s.modalidade_apresentacao || 'APOSTA').toUpperCase()}</Text>
                  <Text style={[styles.mono, styles.palpiteText]}>
                    {palpitesStr}
                    <Text style={styles.dotsText}>......................................</Text>
                  </Text>
                  <Text style={[styles.mono, styles.line]}>{coloc}</Text>
                  <Text style={[styles.mono, styles.valorText]}>R$ {s.valor_palpites.toFixed(2).replace('.', ',')}</Text>
                </View>
              );
            })
          ) : (
            <View style={styles.apostaGroup}>
              <Text style={[styles.mono, styles.modTitle]}>APOSTA REGISTRADA</Text>
              <Text style={[styles.mono, styles.valorText]}>R$ {(data.total_bilhete || 0).toFixed(2).replace('.', ',')}</Text>
            </View>
          )}

          <Text style={[styles.mono, styles.divider]}>-----------------------------------------------</Text>

          <View style={styles.totalRow}>
            <Text style={[styles.mono, styles.totalLabel]}>Total:</Text>
            <Text style={[styles.mono, styles.totalValue]}>
              R$ {(data.total_bilhete || 0).toFixed(2).replace('.', ',')}
            </Text>
          </View>

          <Text style={[styles.mono, styles.divider]}>-----------------------------------------------</Text>

          <Text style={[styles.mono, styles.disclaimer]}>
            ATENÇÃO, TODAS AS APOSTAS A PARTIR DE 5,00 TERÃO DIREITO A MILHAR BRINDE, QUE SERÁ PREMIADA NO VALOR DE 300,00.
          </Text>
          <Text style={[styles.mono, styles.disclaimerCenter]}>-- BILHETE VÁLIDO PARA RECLAMAÇÃO --</Text>

          <Text style={[styles.mono, styles.divider]}>-----------------------------------------------</Text>
          <Text style={[styles.mono, styles.line]}>Reclamações: 6 dia(s)</Text>
          <Text style={[styles.mono, styles.divider]}>-----------------------------------------------</Text>

          <Text style={[styles.mono, styles.hashValue]}>{autorizacao}</Text>
          <Text style={[styles.mono, styles.hashValue]}>Bilhete: {bilheteNo}</Text>

          <Text style={[styles.mono, styles.divider]}>-----------------------------------------------</Text>
          <Text style={[styles.mono, styles.line]}>Pagamento:</Text>
          <Text style={[styles.mono, styles.lineBold]}>Dinheiro</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={handleImprimir} style={styles.printButton} activeOpacity={0.85}>
            <Ionicons name="print-outline" size={22} color={colors.white} />
            <Text style={styles.printButtonText}>Imprimir Comprovante</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleWhatsApp} style={styles.whatsappButton} activeOpacity={0.85}>
            <Ionicons name="logo-whatsapp" size={22} color={colors.white} />
            <Text style={styles.whatsappButtonText}>Compartilhar no WhatsApp</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
  },
  closeButton: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  ticket: {
    backgroundColor: '#FFFDF0', // Papel térmico
    padding: 16,
    width: '100%',
    maxWidth: 360,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E8E2C8',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  mono: {
    fontFamily: mono,
    color: '#111111',
    fontSize: 13,
    lineHeight: 18,
  },
  ticketTitle: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 12,
  },
  line: {
    fontSize: 13,
  },
  lineBold: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  divider: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 12,
    color: '#444444',
    marginVertical: 6,
  },
  apostaGroup: {
    marginVertical: 4,
  },
  modTitle: {
    fontWeight: '700',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 2,
  },
  palpiteText: {
    fontSize: 13,
    flexWrap: 'wrap',
  },
  dotsText: {
    color: '#888888',
  },
  valorText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  totalLabel: {
    fontWeight: '700',
    fontSize: 15,
  },
  totalValue: {
    fontWeight: '700',
    fontSize: 16,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 15,
    color: '#333333',
    marginVertical: 4,
  },
  disclaimerCenter: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  hashValue: {
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 360,
    gap: 10,
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.blue[600],
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
  },
  printButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366', // WhatsApp Brand Green
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
  },
  whatsappButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
