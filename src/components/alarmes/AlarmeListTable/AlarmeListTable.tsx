import { motion } from 'framer-motion';
import { CheckCheck, ExternalLink, Eye, FilePlus2, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AlarmeResponse, AlarmesPermissions } from '../../../types';
import { formatAlarmeDate } from '../alarmes.utils';
import { AlarmeSeverityBadge } from '../AlarmeSeverityBadge';
import { AlarmeStatusBadge } from '../AlarmeStatusBadge';
import styles from './AlarmeListTable.module.scss';

type AlarmeListTableProps = {
  alarmes: AlarmeResponse[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  selectedId?: number;
  generatingReportId: number | null;
  acknowledgingId: number | null;
  permissions: AlarmesPermissions;
  onSelect: (idAlarme: number) => void;
  onAcknowledge: (alarme: AlarmeResponse) => void;
  onResolve: (alarme: AlarmeResponse) => void;
  onGenerateReport: (alarme: AlarmeResponse) => void;
  onPageChange: (page: number) => void;
};

export function AlarmeListTable({
  alarmes,
  total,
  page,
  limit,
  isLoading,
  selectedId,
  generatingReportId,
  acknowledgingId,
  permissions,
  onSelect,
  onAcknowledge,
  onResolve,
  onGenerateReport,
  onPageChange,
}: AlarmeListTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Listagem</p>
          <h2>Alarmes operacionais</h2>
        </div>
        <span>{isLoading ? 'Carregando' : `${total} registro(s)`}</span>
      </header>

      {alarmes.length > 0 ? (
        <div className={styles.tableWrap}>
          <table>
            <colgroup>
              <col className={styles.alarmColumn} />
              <col className={styles.severityColumn} />
              <col className={styles.statusColumn} />
              <col className={styles.ackColumn} />
              <col className={styles.originColumn} />
              <col className={styles.processColumn} />
              <col className={styles.flagsColumn} />
              <col className={styles.recoveryColumn} />
              <col className={styles.datesColumn} />
              <col className={styles.actionsColumn} />
            </colgroup>
            <thead>
              <tr>
                <th>Alarme</th>
                <th>Severidade</th>
                <th>Status</th>
                <th>Reconhecimento</th>
                <th>Origem</th>
                <th>Processo</th>
                <th>Flags</th>
                <th>Recuperacao</th>
                <th>Datas</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {alarmes.map((alarme, index) => (
                <motion.tr
                  key={alarme.id_alarme}
                  className={`${alarme.severidade === 'CRITICO' && alarme.status_alarme === 'ATIVO' ? styles.criticalRow : ''} ${
                    selectedId === alarme.id_alarme ? styles.activeRow : ''
                  }`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.025, duration: 0.18 }}
                  whileHover={{ backgroundColor: 'rgba(83, 197, 255, 0.075)' }}
                >
                  <td>
                    <strong>{alarme.titulo ?? alarme.tipo_alarme ?? `Alarme #${alarme.id_alarme}`}</strong>
                    <span>{alarme.descricao ?? alarme.mensagem ?? 'Sem mensagem'}</span>
                  </td>
                  <td>
                    <AlarmeSeverityBadge severity={alarme.severidade} />
                  </td>
                  <td>
                    <AlarmeStatusBadge status={alarme.status_alarme} />
                  </td>
                  <td>
                    <strong>{alarme.reconhecido ? 'Sim' : 'Nao'}</strong>
                    <span>{formatAlarmeDate(alarme.ultimo_reconhecimento_em)}</span>
                  </td>
                  <td>{alarme.origem_alarme ?? 'Nao informado'}</td>
                  <td>{typeof alarme.id_processo === 'number' ? `#${alarme.id_processo}` : 'Nao informado'}</td>
                  <td>
                    <span>Bloq.: {alarme.bloqueante ? 'sim' : 'nao'}</span>
                    <span>Interv.: {alarme.requer_intervencao ? 'sim' : 'nao'}</span>
                  </td>
                  <td>
                    <span>Auto: {alarme.recuperacao_automatica ? 'sim' : 'nao'}</span>
                    <span>Tent.: {alarme.tentativas_recuperacao ?? 0}</span>
                  </td>
                  <td>
                    <span>Ocorreu: {formatAlarmeDate(alarme.ocorrido_em ?? alarme.criado_em)}</span>
                    <span>Normal.: {formatAlarmeDate(alarme.normalizado_em)}</span>
                    <span>Resol.: {formatAlarmeDate(alarme.resolvido_em)}</span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        onClick={() => onSelect(alarme.id_alarme)}
                        aria-label={`Ver detalhes do alarme ${alarme.id_alarme}`}
                        title="Ver detalhes"
                      >
                        <Eye size={15} aria-hidden="true" />
                      </button>
                      {typeof alarme.id_processo === 'number' ? (
                        <Link
                          to="/processos"
                          aria-label={`Ver processo relacionado ao alarme ${alarme.id_alarme}`}
                          title="Ver processo relacionado"
                        >
                          <ExternalLink size={15} aria-hidden="true" />
                        </Link>
                      ) : null}
                      {permissions.canAcknowledgeAlarme ? (
                        <button
                          type="button"
                          onClick={() => onAcknowledge(alarme)}
                          disabled={acknowledgingId === alarme.id_alarme}
                          aria-label={`Reconhecer alarme ${alarme.id_alarme}`}
                          title={acknowledgingId === alarme.id_alarme ? 'Registrando reconhecimento' : 'Reconhecer'}
                        >
                          <CheckCheck size={15} aria-hidden="true" />
                        </button>
                      ) : null}
                      {permissions.canResolveAlarme(alarme.status_alarme) ? (
                        <button
                          type="button"
                          onClick={() => onResolve(alarme)}
                          aria-label={`Resolver alarme ${alarme.id_alarme}`}
                          title="Resolver"
                        >
                          <Wrench size={15} aria-hidden="true" />
                        </button>
                      ) : null}
                      {permissions.canGenerateAlarmeReport ? (
                        <button
                          type="button"
                          onClick={() => onGenerateReport(alarme)}
                          disabled={generatingReportId === alarme.id_alarme}
                          aria-label={`Gerar relatorio do alarme ${alarme.id_alarme}`}
                          title={generatingReportId === alarme.id_alarme ? 'Gerando relatorio' : 'Gerar relatorio'}
                        >
                          <FilePlus2 size={15} aria-hidden="true" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.empty}>
          {isLoading ? 'Carregando alarmes...' : 'Nenhum alarme encontrado para os filtros atuais.'}
        </p>
      )}

      <footer className={styles.pagination}>
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || isLoading}>
          Anterior
        </button>
        <span>
          Pagina {page} de {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
        >
          Proxima
        </button>
      </footer>
    </section>
  );
}
