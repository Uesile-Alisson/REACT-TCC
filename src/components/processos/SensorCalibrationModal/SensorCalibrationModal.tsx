import { AlertTriangle, CheckCircle2, RefreshCw, Search, ShieldCheck, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  activateSensorConfiguracao,
  deactivateSensorConfiguracao,
  finishSensorCalibration,
  getSensorConfiguracao,
  listSensoresConfiguracao,
  startSensorCalibration,
  updateSensorConfiguracao,
} from '../../../services/configuracoes-sensores.service';
import type {
  CalibrarSensorRequest,
  ProcessoPrecheckCorrectiveActionCode,
  SensorConfiguracaoResponse,
  SensoresConfiguracaoListResponse,
  SensorProtocolo,
  SensorTipo,
  UpdateSensorConfiguracaoRequest,
} from '../../../types';
import { getAuthErrorMessage } from '../../../utils/authErrors';
import { formatProcessDate, formatProcessNumber } from '../processos.utils';
import { ProcessStatusBadge } from '../ProcessStatusBadge';
import styles from './SensorCalibrationModal.module.scss';

type SensorCalibrationModalProps = {
  isOpen: boolean;
  initialSensorId: number | null;
  correctiveActionCode?: ProcessoPrecheckCorrectiveActionCode | null;
  correctiveActionTitle?: string | null;
  onClose: () => void;
  onSensorMutated: () => Promise<void>;
};

type EditForm = {
  nome: string;
  modelo: string;
  protocolo: SensorProtocolo;
  tipo_sensor: SensorTipo;
  unidade_medida: string;
  precisao: string;
  limite_minimo_operacional: string;
  limite_maximo_operacional: string;
  variacao_maxima_por_segundo: string;
  oscilacao_maxima: string;
  tempo_travado_segundos: string;
};

type CalibrationForm = {
  valor_referencia: string;
  valor_observado: string;
  offset_calibracao: string;
  referencia: string;
  incerteza: string;
  valida_ate: string;
  observacoes: string;
};

type PendingConfirmation = {
  title: string;
  description: string;
  confirmLabel: string;
  execute: () => Promise<void>;
};

const PROTOCOLS: SensorProtocolo[] = ['I2C', 'ANALOGICO', 'DIGITAL', 'SPI', 'UART'];
const SENSOR_TYPES: SensorTipo[] = ['VACUO', 'VAZAO', 'NIVEL', 'ACOPLAMENTO', 'GENERICO'];

function createEditForm(sensor: SensorConfiguracaoResponse): EditForm {
  return {
    nome: sensor.nome,
    modelo: sensor.modelo,
    protocolo: sensor.protocolo,
    tipo_sensor: sensor.tipo_sensor,
    unidade_medida: sensor.unidade_medida,
    precisao: sensor.precisao?.toString() ?? '',
    limite_minimo_operacional: sensor.limite_minimo_operacional?.toString() ?? '',
    limite_maximo_operacional: sensor.limite_maximo_operacional?.toString() ?? '',
    variacao_maxima_por_segundo: sensor.variacao_maxima_por_segundo?.toString() ?? '',
    oscilacao_maxima: sensor.oscilacao_maxima?.toString() ?? '',
    tempo_travado_segundos: sensor.tempo_travado_segundos.toString(),
  };
}

function createCalibrationForm(sensor: SensorConfiguracaoResponse): CalibrationForm {
  return {
    valor_referencia: '',
    valor_observado: sensor.ultimo_valor_bruto?.toString() ?? '',
    offset_calibracao: sensor.offset_calibracao.toString(),
    referencia: sensor.calibracao_referencia ?? '',
    incerteza: sensor.calibracao_incerteza?.toString() ?? '',
    valida_ate: '',
    observacoes: sensor.calibracao_observacoes ?? '',
  };
}

function toOptionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function getIntegrityTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'VALIDO') {
    return 'success';
  }

  if (status === 'PENDENTE_CALIBRACAO') {
    return 'warning';
  }

  return status ? 'danger' : 'neutral';
}

function getCorrectiveDescription(code?: ProcessoPrecheckCorrectiveActionCode | null): string {
  const descriptions: Partial<Record<ProcessoPrecheckCorrectiveActionCode, string>> = {
    CALIBRAR_SENSOR: 'A pre-checagem exige que o modo de calibracao seja iniciado para este sensor.',
    CONTINUAR_CALIBRACAO_SENSOR: 'O sensor ja esta em modo de calibracao e precisa ser finalizado com referencia rastreavel.',
    LIBERAR_SENSOR: 'A calibracao esta valida, mas falta a liberacao tecnica que ativa o sensor.',
    ATIVAR_SENSOR: 'O sensor esta inativo e deve ser ativado pelo fluxo tecnico.',
    DIAGNOSTICAR_SENSOR: 'Revise integridade, limites e o ultimo erro antes de decidir a proxima acao.',
    AGUARDAR_TELEMETRIA_SENSOR: 'O sensor esta desconectado. Consulte o diagnostico e aguarde telemetria nova.',
  };

  return code ? descriptions[code] ?? 'Revise o sensor indicado pela pre-checagem.' : 'Gerenciamento tecnico do sensor.';
}

export function SensorCalibrationModal({
  isOpen,
  initialSensorId,
  correctiveActionCode,
  correctiveActionTitle,
  onClose,
  onSensorMutated,
}: SensorCalibrationModalProps) {
  const [sensors, setSensors] = useState<SensorConfiguracaoResponse[]>([]);
  const [sensorListMeta, setSensorListMeta] = useState<SensoresConfiguracaoListResponse['meta']>({
    page: 1,
    limit: 100,
    total: 0,
    total_pages: 0,
  });
  const [selectedSensorId, setSelectedSensorId] = useState<number | null>(initialSensorId);
  const [sensor, setSensor] = useState<SensorConfiguracaoResponse | null>(null);
  const [search, setSearch] = useState<string>('');
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [calibrationForm, setCalibrationForm] = useState<CalibrationForm | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);

  const applySensor = useCallback((nextSensor: SensorConfiguracaoResponse): void => {
    setSensor(nextSensor);
    setSelectedSensorId(nextSensor.id_sensor);
    setEditForm(createEditForm(nextSensor));
    setCalibrationForm(createCalibrationForm(nextSensor));
    setSensors((current) => {
      const exists = current.some((item) => item.id_sensor === nextSensor.id_sensor);

      return exists
        ? current.map((item) => item.id_sensor === nextSensor.id_sensor ? nextSensor : item)
        : [nextSensor, ...current];
    });
  }, []);

  const loadSensor = useCallback(async (idSensor: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      applySensor(await getSensorConfiguracao(idSensor));
    } catch (loadError: unknown) {
      setError(getAuthErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [applySensor]);

  const loadSensors = useCallback(async (searchTerm = '', page = 1): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listSensoresConfiguracao({
        page,
        limit: 100,
        busca: searchTerm.trim() || undefined,
        order_by: 'nome',
        order_direction: 'asc',
      });
      setSensors(response.data);
      setSensorListMeta(response.meta);
    } catch (loadError: unknown) {
      setError(getAuthErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let active = true;
    const timeoutId = window.setTimeout(() => {
      if (!active) {
        return;
      }

      setSelectedSensorId(initialSensorId);
      setError(null);
      setFeedback(null);
      void Promise.all([
        loadSensors(),
        initialSensorId ? loadSensor(initialSensorId) : Promise.resolve(),
      ]);
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [initialSensorId, isOpen, loadSensor, loadSensors]);

  const calibrationError = useMemo(() => {
    if (!calibrationForm || !sensor?.modo_calibracao_ativo) {
      return null;
    }

    if (!calibrationForm.valor_referencia.trim() || !Number.isFinite(Number(calibrationForm.valor_referencia))) {
      return 'Informe um valor de referencia numerico.';
    }

    if (!calibrationForm.referencia.trim()) {
      return 'Informe a identificacao rastreavel do padrao de referencia.';
    }

    if (!calibrationForm.valor_observado.trim() && sensor.ultimo_valor_bruto === null) {
      return 'Informe o valor observado, pois a API nao possui ultimo valor bruto para usar como diagnostico.';
    }

    const observed = calibrationForm.valor_observado.trim()
      ? Number(calibrationForm.valor_observado)
      : sensor.ultimo_valor_bruto;
    if (observed === null || !Number.isFinite(observed) || observed === 0) {
      return 'O valor observado deve ser numerico e diferente de zero.';
    }

    const offset = calibrationForm.offset_calibracao.trim()
      ? Number(calibrationForm.offset_calibracao)
      : 0;
    if (!Number.isFinite(offset)) {
      return 'Informe um offset numerico valido.';
    }

    const factor = (Number(calibrationForm.valor_referencia) - offset) / observed;
    if (!Number.isFinite(factor) || factor <= 0) {
      return 'Referencia, offset e valor observado devem resultar em fator de calibracao positivo.';
    }

    if (
      calibrationForm.incerteza.trim() &&
      (!Number.isFinite(Number(calibrationForm.incerteza)) || Number(calibrationForm.incerteza) < 0)
    ) {
      return 'A incerteza deve ser um numero maior ou igual a zero.';
    }

    if (calibrationForm.valida_ate) {
      const validUntil = new Date(calibrationForm.valida_ate).getTime();

      if (!Number.isFinite(validUntil)) {
        return 'Informe uma data de validade valida.';
      }
    }

    return null;
  }, [calibrationForm, sensor]);

  const editError = useMemo(() => {
    if (!editForm) {
      return null;
    }

    if (!editForm.nome.trim() || !editForm.modelo.trim() || !editForm.unidade_medida.trim()) {
      return 'Nome, modelo e unidade de medida sao obrigatorios.';
    }

    const numericFields: Array<{
      label: string;
      value: string;
      minimum?: number;
    }> = [
      { label: 'Precisao', value: editForm.precisao, minimum: 0 },
      { label: 'Limite minimo', value: editForm.limite_minimo_operacional },
      { label: 'Limite maximo', value: editForm.limite_maximo_operacional },
      { label: 'Variacao maxima', value: editForm.variacao_maxima_por_segundo, minimum: 0.001 },
      { label: 'Oscilacao maxima', value: editForm.oscilacao_maxima, minimum: 0.001 },
    ];

    for (const field of numericFields) {
      if (!field.value.trim()) {
        continue;
      }

      const parsed = Number(field.value);
      if (!Number.isFinite(parsed) || (field.minimum !== undefined && parsed < field.minimum)) {
        return `${field.label} possui valor invalido.`;
      }
    }

    const minimum = toOptionalNumber(editForm.limite_minimo_operacional);
    const maximum = toOptionalNumber(editForm.limite_maximo_operacional);
    if (minimum !== undefined && maximum !== undefined && minimum >= maximum) {
      return 'O limite minimo deve ser menor que o limite maximo.';
    }

    const stuckTimeout = Number(editForm.tempo_travado_segundos);
    if (!Number.isInteger(stuckTimeout) || stuckTimeout < 5 || stuckTimeout > 86400) {
      return 'O timeout de travamento deve ser um inteiro entre 5 e 86400 segundos.';
    }

    return null;
  }, [editForm]);

  if (!isOpen) {
    return null;
  }

  async function runMutation(
    action: string,
    operation: () => Promise<SensorConfiguracaoResponse>,
    successMessage: string,
  ): Promise<void> {
    setLoadingAction(action);
    setError(null);
    setFeedback(null);

    try {
      const nextSensor = await operation();
      applySensor(nextSensor);
      setFeedback(successMessage);
      await onSensorMutated();
    } catch (mutationError: unknown) {
      setError(getAuthErrorMessage(mutationError));
    } finally {
      setLoadingAction(null);
    }
  }

  function requestConfirmation(
    title: string,
    description: string,
    confirmLabel: string,
    execute: () => Promise<void>,
  ): void {
    setPendingConfirmation({ title, description, confirmLabel, execute });
  }

  function handleSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void loadSensors(search, 1);
  }

  function handleSaveConfiguration(): void {
    if (!sensor || !editForm) {
      return;
    }

    if (editError) {
      setError(editError);
      return;
    }

    const payload: UpdateSensorConfiguracaoRequest = {
      nome: editForm.nome.trim(),
      modelo: editForm.modelo.trim(),
      protocolo: editForm.protocolo,
      tipo_sensor: editForm.tipo_sensor,
      unidade_medida: editForm.unidade_medida.trim(),
      precisao: toOptionalNumber(editForm.precisao),
      limite_minimo_operacional: toOptionalNumber(editForm.limite_minimo_operacional),
      limite_maximo_operacional: toOptionalNumber(editForm.limite_maximo_operacional),
      variacao_maxima_por_segundo: toOptionalNumber(editForm.variacao_maxima_por_segundo),
      oscilacao_maxima: toOptionalNumber(editForm.oscilacao_maxima),
      tempo_travado_segundos: toOptionalNumber(editForm.tempo_travado_segundos),
    };

    requestConfirmation(
      'Salvar configuracao do sensor?',
      'Limites operacionais afetam o diagnostico de integridade. A API bloqueara alteracoes durante estado operacional incompatível.',
      'Salvar configuracao',
      () => runMutation(
        'update',
        () => updateSensorConfiguracao(sensor.id_sensor, payload),
        'Configuracao do sensor atualizada e pre-checagem reexecutada.',
      ),
    );
  }

  function handleFinishCalibration(): void {
    if (!sensor || !calibrationForm) {
      return;
    }

    if (calibrationError) {
      setError(calibrationError);
      return;
    }

    if (
      calibrationForm.valida_ate &&
      new Date(calibrationForm.valida_ate).getTime() <= Date.now()
    ) {
      setError('A validade da calibracao deve estar no futuro.');
      return;
    }

    const payload: CalibrarSensorRequest = {
      valor_referencia: Number(calibrationForm.valor_referencia),
      valor_observado: toOptionalNumber(calibrationForm.valor_observado),
      offset_calibracao: toOptionalNumber(calibrationForm.offset_calibracao),
      referencia: calibrationForm.referencia.trim(),
      incerteza: toOptionalNumber(calibrationForm.incerteza),
      valida_ate: calibrationForm.valida_ate
        ? new Date(calibrationForm.valida_ate).toISOString()
        : undefined,
      observacoes: calibrationForm.observacoes.trim() || undefined,
    };

    requestConfirmation(
      'Finalizar a calibracao?',
      'A API calculara o fator a partir da referencia e do valor observado. A liberacao tecnica permanecera separada.',
      'Finalizar calibracao',
      () => runMutation(
        'finish-calibration',
        () => finishSensorCalibration(sensor.id_sensor, payload),
        'Calibracao registrada. O sensor ainda precisa de liberacao tecnica.',
      ),
    );
  }

  return (
    <div className={styles.overlay} role="presentation">
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="sensor-calibration-title">
        <header className={styles.header}>
          <div>
            <p className={styles.overline}>Acao corretiva / Metrologia</p>
            <h2 id="sensor-calibration-title">Sensores e calibracao tecnica</h2>
          </div>
          <button type="button" onClick={onClose} disabled={Boolean(loadingAction)} aria-label="Fechar">
            <X size={17} aria-hidden="true" />
          </button>
        </header>

        <section className={styles.correctiveCallout}>
          <ShieldCheck size={18} aria-hidden="true" />
          <div>
            <strong>{correctiveActionTitle ?? 'Diagnostico de sensor'}</strong>
            <span>{getCorrectiveDescription(correctiveActionCode)}</span>
          </div>
        </section>

        {error ? <p className={styles.errorState} role="alert">{error}</p> : null}
        {feedback ? <p className={styles.successState} role="status">{feedback}</p> : null}

        <div className={styles.workspace}>
          <aside className={styles.sensorList}>
            <form onSubmit={handleSearch}>
              <label htmlFor="sensor-search">Lista global de sensores</label>
              <div>
                <input
                  id="sensor-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nome ou modelo"
                />
                <button type="submit" disabled={isLoading} aria-label="Buscar sensores">
                  <Search size={15} aria-hidden="true" />
                </button>
              </div>
            </form>
            <button
              type="button"
              className={styles.reloadButton}
              onClick={() => void loadSensors(search, sensorListMeta.page)}
              disabled={isLoading}
            >
              <RefreshCw size={14} aria-hidden="true" />
              Atualizar lista
            </button>
            <div className={styles.sensorOptions}>
              {sensors.map((item) => (
                <button
                  type="button"
                  key={item.id_sensor}
                  className={item.id_sensor === selectedSensorId ? styles.selectedSensor : ''}
                  onClick={() => void loadSensor(item.id_sensor)}
                  disabled={isLoading || Boolean(loadingAction)}
                >
                  <strong>{item.nome}</strong>
                  <span>#{item.id_sensor} · {item.tipo_sensor} · {item.status_sensor}</span>
                  <small>Integridade: {item.status_integridade}</small>
                </button>
              ))}
              {!isLoading && sensors.length === 0 ? <p>Nenhum sensor encontrado.</p> : null}
            </div>
            {sensorListMeta.total_pages > 0 ? (
              <nav className={styles.pagination} aria-label="Paginacao da lista de sensores">
                <span>
                  Pagina {sensorListMeta.page} de {sensorListMeta.total_pages} ({sensorListMeta.total} sensores)
                </span>
                <div>
                  <button
                    type="button"
                    disabled={isLoading || sensorListMeta.page <= 1}
                    onClick={() => void loadSensors(search, sensorListMeta.page - 1)}
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    disabled={isLoading || sensorListMeta.page >= sensorListMeta.total_pages}
                    onClick={() => void loadSensors(search, sensorListMeta.page + 1)}
                  >
                    Proxima
                  </button>
                </div>
              </nav>
            ) : null}
          </aside>

          <main className={styles.sensorDetail}>
            {isLoading && !sensor ? <p>Carregando sensor...</p> : null}
            {!sensor && !isLoading ? <p>Selecione um sensor para consultar o diagnostico.</p> : null}

            {sensor ? (
              <>
                <header className={styles.sensorHeader}>
                  <div>
                    <span>Sensor #{sensor.id_sensor}</span>
                    <h3>{sensor.nome}</h3>
                    <p>{sensor.modelo} · {sensor.tipo_sensor} · {sensor.protocolo}</p>
                  </div>
                  <div>
                    <ProcessStatusBadge label={sensor.status_sensor} tone={sensor.status_sensor === 'ATIVO' ? 'success' : 'warning'} />
                    <ProcessStatusBadge label={sensor.status_integridade} tone={getIntegrityTone(sensor.status_integridade)} />
                  </div>
                </header>

                <section className={styles.metricGrid}>
                  <article><span>Fator</span><strong>{formatProcessNumber(sensor.fator_calibracao)}</strong></article>
                  <article><span>Offset</span><strong>{formatProcessNumber(sensor.offset_calibracao, sensor.unidade_medida)}</strong></article>
                  <article><span>Valor bruto</span><strong>{formatProcessNumber(sensor.ultimo_valor_bruto, sensor.unidade_medida)}</strong></article>
                  <article><span>Modo calibracao</span><strong>{sensor.modo_calibracao_ativo ? 'Ativo' : 'Inativo'}</strong></article>
                </section>

                <section className={styles.diagnosticGrid}>
                  <article>
                    <h4>Rastreabilidade</h4>
                    <dl>
                      <div><dt>Calibrado em</dt><dd>{formatProcessDate(sensor.calibrado_em)}</dd></div>
                      <div><dt>Valido ate</dt><dd>{formatProcessDate(sensor.calibracao_valida_ate)}</dd></div>
                      <div><dt>Referencia</dt><dd>{sensor.calibracao_referencia ?? 'Nao informada'}</dd></div>
                      <div><dt>Incerteza</dt><dd>{formatProcessNumber(sensor.calibracao_incerteza, sensor.unidade_medida)}</dd></div>
                      <div><dt>Responsavel</dt><dd>{sensor.id_usuario_calibracao ? `Usuario #${sensor.id_usuario_calibracao}` : 'Nao informado'}</dd></div>
                      <div><dt>Liberado em</dt><dd>{formatProcessDate(sensor.liberado_em)}</dd></div>
                      <div><dt>Liberado por</dt><dd>{sensor.id_usuario_liberacao ? `Usuario #${sensor.id_usuario_liberacao}` : 'Nao informado'}</dd></div>
                    </dl>
                  </article>
                  <article>
                    <h4>Integridade e limites</h4>
                    <dl>
                      <div><dt>Faixa</dt><dd>{formatProcessNumber(sensor.limite_minimo_operacional, sensor.unidade_medida)} a {formatProcessNumber(sensor.limite_maximo_operacional, sensor.unidade_medida)}</dd></div>
                      <div><dt>Variacao maxima</dt><dd>{formatProcessNumber(sensor.variacao_maxima_por_segundo, `${sensor.unidade_medida}/s`)}</dd></div>
                      <div><dt>Oscilacao maxima</dt><dd>{formatProcessNumber(sensor.oscilacao_maxima, sensor.unidade_medida)}</dd></div>
                      <div><dt>Timeout travamento</dt><dd>{sensor.tempo_travado_segundos}s</dd></div>
                      <div><dt>Integridade validada</dt><dd>{formatProcessDate(sensor.integridade_validada_em)}</dd></div>
                    </dl>
                    {sensor.integridade_ultimo_erro ? (
                      <p className={styles.integrityError}><AlertTriangle size={15} aria-hidden="true" />{sensor.integridade_ultimo_erro}</p>
                    ) : (
                      <p className={styles.integrityOk}><CheckCircle2 size={15} aria-hidden="true" />Sem erro de integridade registrado.</p>
                    )}
                  </article>
                </section>

                <section className={styles.lifecycleActions}>
                  <button
                    type="button"
                    disabled={sensor.tipo_sensor !== 'VACUO' || sensor.modo_calibracao_ativo || Boolean(loadingAction)}
                    onClick={() => requestConfirmation(
                      'Iniciar modo de calibracao?',
                      'A API exige ausencia de processo ativo e manterá o sensor inativo ate calibracao e liberacao tecnica.',
                      'Iniciar calibracao',
                      () => runMutation(
                        'start-calibration',
                        () => startSensorCalibration(sensor.id_sensor),
                        'Modo de calibracao iniciado e pre-checagem reexecutada.',
                      ),
                    )}
                  >
                    Iniciar calibracao
                  </button>
                  <button
                    type="button"
                    disabled={sensor.status_sensor === 'ATIVO' || Boolean(loadingAction)}
                    onClick={() => requestConfirmation(
                      'Ativar e liberar tecnicamente o sensor?',
                      'Sensores de vacuo exigem calibracao valida. A API registrara o usuario responsavel pela liberacao.',
                      'Ativar sensor',
                      () => runMutation(
                        'activate',
                        () => activateSensorConfiguracao(sensor.id_sensor),
                        'Sensor ativado/liberado e pre-checagem reexecutada.',
                      ),
                    )}
                  >
                    Ativar / liberar
                  </button>
                  <button
                    type="button"
                    className={styles.dangerButton}
                    disabled={sensor.status_sensor === 'INATIVO' || Boolean(loadingAction)}
                    onClick={() => requestConfirmation(
                      'Desativar este sensor?',
                      'O sensor deixara de ficar disponivel para processos e a pre-checagem podera permanecer bloqueada.',
                      'Desativar sensor',
                      () => runMutation(
                        'deactivate',
                        () => deactivateSensorConfiguracao(sensor.id_sensor),
                        'Sensor desativado e pre-checagem reexecutada.',
                      ),
                    )}
                  >
                    Desativar
                  </button>
                </section>

                {sensor.modo_calibracao_ativo && calibrationForm ? (
                  <section className={styles.formSection}>
                    <header>
                      <div>
                        <p className={styles.overline}>Calibracao ativa desde {formatProcessDate(sensor.calibracao_iniciada_em)}</p>
                        <h4>Finalizar com referencia rastreavel</h4>
                      </div>
                    </header>
                    <div className={styles.formGrid}>
                      <label>Valor de referencia<input type="number" step="0.0001" value={calibrationForm.valor_referencia} onChange={(event) => setCalibrationForm({ ...calibrationForm, valor_referencia: event.target.value })} /></label>
                      <label>Valor observado<input type="number" step="0.0001" value={calibrationForm.valor_observado} onChange={(event) => setCalibrationForm({ ...calibrationForm, valor_observado: event.target.value })} placeholder="Usa ultimo bruto se vazio" /></label>
                      <label>Offset<input type="number" step="0.0001" value={calibrationForm.offset_calibracao} onChange={(event) => setCalibrationForm({ ...calibrationForm, offset_calibracao: event.target.value })} /></label>
                      <label>Incerteza<input type="number" min="0" step="0.0001" value={calibrationForm.incerteza} onChange={(event) => setCalibrationForm({ ...calibrationForm, incerteza: event.target.value })} /></label>
                      <label className={styles.fullField}>Referencia rastreavel<input maxLength={500} value={calibrationForm.referencia} onChange={(event) => setCalibrationForm({ ...calibrationForm, referencia: event.target.value })} placeholder="Ex.: Padrao LAB-2026-014" /></label>
                      <label>Valida ate<input type="datetime-local" value={calibrationForm.valida_ate} onChange={(event) => setCalibrationForm({ ...calibrationForm, valida_ate: event.target.value })} /></label>
                      <label className={styles.fullField}>Observacoes<textarea maxLength={1000} value={calibrationForm.observacoes} onChange={(event) => setCalibrationForm({ ...calibrationForm, observacoes: event.target.value })} /></label>
                    </div>
                    {calibrationError ? <p className={styles.formError}>{calibrationError}</p> : null}
                    <button type="button" className={styles.primaryButton} onClick={handleFinishCalibration} disabled={Boolean(calibrationError) || Boolean(loadingAction)}>
                      Finalizar calibracao
                    </button>
                  </section>
                ) : null}

                {editForm ? (
                  <details className={styles.formSection}>
                    <summary>Editar configuracao e limites operacionais</summary>
                    <p>Fator, offset, integridade e ativacao nao sao alterados aqui; use o fluxo tecnico dedicado.</p>
                    <div className={styles.formGrid}>
                      <label>Nome<input maxLength={80} value={editForm.nome} onChange={(event) => setEditForm({ ...editForm, nome: event.target.value })} /></label>
                      <label>Modelo<input maxLength={100} value={editForm.modelo} onChange={(event) => setEditForm({ ...editForm, modelo: event.target.value })} /></label>
                      <label>Protocolo<select value={editForm.protocolo} onChange={(event) => setEditForm({ ...editForm, protocolo: event.target.value as SensorProtocolo })}>{PROTOCOLS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                      <label>Tipo<select value={editForm.tipo_sensor} onChange={(event) => setEditForm({ ...editForm, tipo_sensor: event.target.value as SensorTipo })}>{SENSOR_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                      <label>Unidade<input maxLength={20} value={editForm.unidade_medida} onChange={(event) => setEditForm({ ...editForm, unidade_medida: event.target.value })} /></label>
                      <label>Precisao<input type="number" min="0" step="0.001" value={editForm.precisao} onChange={(event) => setEditForm({ ...editForm, precisao: event.target.value })} /></label>
                      <label>Limite minimo<input type="number" step="0.001" value={editForm.limite_minimo_operacional} onChange={(event) => setEditForm({ ...editForm, limite_minimo_operacional: event.target.value })} /></label>
                      <label>Limite maximo<input type="number" step="0.001" value={editForm.limite_maximo_operacional} onChange={(event) => setEditForm({ ...editForm, limite_maximo_operacional: event.target.value })} /></label>
                      <label>Variacao maxima/s<input type="number" min="0.001" step="0.001" value={editForm.variacao_maxima_por_segundo} onChange={(event) => setEditForm({ ...editForm, variacao_maxima_por_segundo: event.target.value })} /></label>
                      <label>Oscilacao maxima<input type="number" min="0.001" step="0.001" value={editForm.oscilacao_maxima} onChange={(event) => setEditForm({ ...editForm, oscilacao_maxima: event.target.value })} /></label>
                      <label>Timeout travado (s)<input type="number" min="5" max="86400" step="1" value={editForm.tempo_travado_segundos} onChange={(event) => setEditForm({ ...editForm, tempo_travado_segundos: event.target.value })} /></label>
                    </div>
                    {editError ? <p className={styles.formError}>{editError}</p> : null}
                    <button
                      type="button"
                      onClick={handleSaveConfiguration}
                      disabled={Boolean(editError) || Boolean(loadingAction)}
                    >
                      Salvar configuracao
                    </button>
                  </details>
                ) : null}
              </>
            ) : null}
          </main>
        </div>
      </section>

      {pendingConfirmation ? (
        <div className={styles.confirmOverlay} role="presentation">
          <section className={styles.confirmDialog} role="alertdialog" aria-modal="true" aria-labelledby="sensor-confirm-title">
            <p className={styles.overline}>Confirmacao tecnica</p>
            <h3 id="sensor-confirm-title">{pendingConfirmation.title}</h3>
            <p>{pendingConfirmation.description}</p>
            <div>
              <button type="button" onClick={() => setPendingConfirmation(null)}>Cancelar</button>
              <button
                type="button"
                onClick={() => {
                  const execute = pendingConfirmation.execute;
                  setPendingConfirmation(null);
                  void execute();
                }}
              >
                {pendingConfirmation.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
