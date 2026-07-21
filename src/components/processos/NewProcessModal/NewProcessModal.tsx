import { useMemo, useState } from 'react';
import { useProcessoConfiguracaoOptions } from '../../../hooks/useProcessoConfiguracaoOptions';
import type {
  ProcessoFormErrors,
  ProcessoFormState,
  ProcessoTanqueFormState,
  ProcessoTanqueOption,
  TanqueHardwareCodigo,
  ValvulaHardware,
  ValvulasPorTanque,
} from '../../../types';
import {
  getExpectedValveCode,
  getTanqueHardwareCodeFromId,
  getTanqueHardwareComValvulas,
  getTanqueHardwareLabel,
  normalizeTanqueHardwareCode,
} from '../../../utils/hardwareValvulas';
import styles from './NewProcessModal.module.scss';

type NewProcessModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (form: ProcessoFormState) => Promise<void>;
};

function createEmptyTankForm(): ProcessoTanqueFormState {
  return {
    id_tanque: '',
    prioridade: '',
    vacuo_alvo_tanque: '',
    id_sensor: '',
    observacoes_sensor: '',
  };
}

const initialForm: ProcessoFormState = {
  nome_processo: '',
  tempo_maximo: '',
  quantidade_tanques: '1',
  modo_operacao_auxiliar: 'AUTOMATICO',
  encerramento_automatico: true,
  tanques: [createEmptyTankForm()],
};

function getTanqueHardwareCode(
  tanque: ProcessoTanqueFormState,
  tanqueOptions: ProcessoTanqueOption[],
): TanqueHardwareCodigo | null {
  const idTanque = Number(tanque.id_tanque);
  const selectedOption = tanqueOptions.find((option) => option.id_tanque === idTanque);

  return normalizeTanqueHardwareCode(selectedOption?.codigo_hardware) ??
    getTanqueHardwareCodeFromId(Number.isInteger(idTanque) ? idTanque : null);
}

function getValveDisplayName(valvula: ValvulaHardware | undefined, fallbackCode: string): string {
  return valvula?.nome ?? valvula?.descricao ?? fallbackCode;
}

function formatValveOpenState(valvula?: ValvulaHardware): string {
  if (valvula?.aberta === true) {
    return 'Aberta';
  }

  if (valvula?.aberta === false) {
    return 'Fechada';
  }

  return 'Sem status';
}

function formatValveAvailability(valvula?: ValvulaHardware): string {
  if (valvula?.disponivel === true) {
    return 'Disponivel';
  }

  if (valvula?.disponivel === false) {
    return 'Indisponivel';
  }

  return 'Sem status';
}

function validateForm(
  form: ProcessoFormState,
  tanqueOptions: ProcessoTanqueOption[],
  valvulasByTanque: ValvulasPorTanque,
  maxTanksPerProcess: number,
): ProcessoFormErrors {
  const errors: ProcessoFormErrors = {};
  const quantidadeTanques = Number(form.quantidade_tanques);

  if (
    !form.tempo_maximo.trim() ||
    !Number.isInteger(Number(form.tempo_maximo)) ||
    Number(form.tempo_maximo) <= 0
  ) {
    errors.tempo_maximo = 'Informe o tempo maximo em segundos inteiros positivos.';
  }

  if (!['AUTOMATICO', 'ASSISTIDO', 'MANUAL'].includes(form.modo_operacao_auxiliar)) {
    errors.modo_operacao_auxiliar = 'Selecione um modo de operacao auxiliar valido.';
  }

  if (
    !Number.isInteger(quantidadeTanques) ||
    quantidadeTanques < 1 ||
    quantidadeTanques > maxTanksPerProcess
  ) {
    errors.quantidade_tanques = `Informe entre 1 e ${maxTanksPerProcess} tanques.`;
  }

  const tankErrors = form.tanques.map((tanque) => {
    const currentErrors: NonNullable<ProcessoFormErrors['tanques']>[number] = {};

    if (!tanque.id_tanque.trim() || Number(tanque.id_tanque) <= 0) {
      currentErrors.id_tanque = 'Selecione um tanque configurado.';
    }

    if (tanque.id_tanque.trim()) {
      const tanqueHardwareCode = getTanqueHardwareCode(tanque, tanqueOptions);

      if (!tanqueHardwareCode) {
        currentErrors.codigo_hardware = 'Tanque sem codigo de hardware no formato TANQUE_N.';
      } else if (!valvulasByTanque[tanqueHardwareCode]?.principal) {
        currentErrors.valvula_principal =
          `Nao foi possivel iniciar o processo: a valvula principal do ${getTanqueHardwareLabel(tanqueHardwareCode)} nao foi encontrada no hardware cadastrado.`;
      }
    }

    if (!tanque.id_sensor.trim() || Number(tanque.id_sensor) <= 0) {
      currentErrors.id_sensor = 'Selecione um sensor de vacuo.';
    }

    if (tanque.vacuo_alvo_tanque.trim()) {
      const vacuoAlvo = Number(tanque.vacuo_alvo_tanque);

      if (!Number.isFinite(vacuoAlvo) || vacuoAlvo >= 0) {
        currentErrors.vacuo_alvo_tanque = 'Use pressao manometrica negativa em kPa.';
      }
    }

    return currentErrors;
  });

  if (form.modo_operacao_auxiliar !== 'MANUAL' && quantidadeTanques > 1) {
    const priorities = form.tanques.map((tanque) => Number(tanque.prioridade));
    const expectedPriorities = Array.from({ length: quantidadeTanques }, (_, index) => index + 1);
    const hasCompleteOrder =
      priorities.every((priority) => Number.isInteger(priority)) &&
      new Set(priorities).size === quantidadeTanques &&
      expectedPriorities.every((priority) => priorities.includes(priority));

    if (!hasCompleteOrder) {
      tankErrors.forEach((tankError) => {
        tankError.prioridade = `Defina uma ordem unica de 1 a ${quantidadeTanques}.`;
      });
    }
  }

  if (tankErrors.some((tankError) => Object.keys(tankError).length > 0)) {
    errors.tanques = tankErrors;
  }

  return errors;
}

function resizeTankForms(currentTanks: ProcessoTanqueFormState[], quantity: number): ProcessoTanqueFormState[] {
  return Array.from({ length: quantity }, (_, index) => ({
    ...(currentTanks[index] ?? createEmptyTankForm()),
    prioridade: String(quantity - index),
  }));
}

type TankHardwarePreviewProps = {
  tanqueHardwareCode: TanqueHardwareCodigo | null;
  valvulasByTanque: ValvulasPorTanque;
  isLoading: boolean;
  error: string | null;
  principalError?: string;
};

function TankHardwarePreview({
  tanqueHardwareCode,
  valvulasByTanque,
  isLoading,
  error,
  principalError,
}: TankHardwarePreviewProps) {
  if (!tanqueHardwareCode) {
    return (
      <section className={styles.hardwareBox} aria-label="Hardware vinculado ao tanque">
        <strong>Hardware vinculado</strong>
        <p>Selecione um tanque com codigo TANQUE_N para visualizar as valvulas vinculadas.</p>
      </section>
    );
  }

  const hardware = getTanqueHardwareComValvulas(tanqueHardwareCode, valvulasByTanque);
  const principalCode = getExpectedValveCode(tanqueHardwareCode, 'PRINCIPAL');
  const auxiliarCode = getExpectedValveCode(tanqueHardwareCode, 'AUXILIAR');

  return (
    <section className={styles.hardwareBox} aria-label="Hardware vinculado ao tanque">
      <div className={styles.hardwareHeader}>
        <strong>Hardware vinculado ao tanque</strong>
        <span>{getTanqueHardwareLabel(tanqueHardwareCode)}</span>
      </div>

      {isLoading ? <p>Carregando valvulas fixas do tanque...</p> : null}
      {error ? <p className={styles.hardwareWarning}>{error}</p> : null}

      <div className={styles.hardwareLines}>
        <article className={principalError ? styles.hardwareLineError : undefined}>
          <span>Linha principal</span>
          <strong>{getValveDisplayName(hardware.valvulaPrincipal, `Principal ${tanqueHardwareCode.replace('TANQUE_', 'T')}`)}</strong>
          <small>Codigo: {hardware.valvulaPrincipal?.codigo_hardware ?? principalCode}</small>
          <small>Bomba: {hardware.valvulaPrincipal?.bomba_codigo_hardware ?? 'BOMBA_VACUO_PRINCIPAL'}</small>
          <small>Status: {formatValveOpenState(hardware.valvulaPrincipal)} / {formatValveAvailability(hardware.valvulaPrincipal)}</small>
        </article>

        <article>
          <span>Linha auxiliar</span>
          <strong>{getValveDisplayName(hardware.valvulaAuxiliar, `Auxiliar ${tanqueHardwareCode.replace('TANQUE_', 'T')}`)}</strong>
          <small>Codigo: {hardware.valvulaAuxiliar?.codigo_hardware ?? auxiliarCode}</small>
          <small>Bomba: {hardware.valvulaAuxiliar?.bomba_codigo_hardware ?? 'BOMBA_VACUO_AUXILIAR'}</small>
          <small>Status: {formatValveOpenState(hardware.valvulaAuxiliar)} / {formatValveAvailability(hardware.valvulaAuxiliar)}</small>
        </article>
      </div>

      {principalError ? <p className={styles.hardwareError}>{principalError}</p> : null}
      {!hardware.valvulaAuxiliar && !isLoading ? (
        <p className={styles.hardwareWarning}>Valvula auxiliar nao informada pela API.</p>
      ) : null}
    </section>
  );
}

export function NewProcessModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: NewProcessModalProps) {
  const [form, setForm] = useState<ProcessoFormState>(initialForm);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const {
    tanqueOptions,
    sensorOptionsByTanque,
    loadingTanques,
    loadingSensores,
    loadingHardware,
    loadingSystemConfig,
    loadingSensoresByTanque,
    errorTanques,
    errorSensores,
    errorHardware,
    errorSystemConfig,
    errorSensoresByTanque,
    valvulasByTanque,
    maxTanksPerProcess,
    setSelectedTanqueId,
    loadSensoresForTanque,
  } = useProcessoConfiguracaoOptions(isOpen);
  const availableMaxTanks = Math.max(
    1,
    Math.min(maxTanksPerProcess ?? 1, tanqueOptions.length || maxTanksPerProcess || 1),
  );
  const errors = useMemo(
    () => validateForm(form, tanqueOptions, valvulasByTanque, availableMaxTanks),
    [availableMaxTanks, form, tanqueOptions, valvulasByTanque],
  );
  const hasErrors = Object.keys(errors).length > 0;
  const canSubmit =
    !isSubmitting &&
    !loadingTanques &&
    !loadingSensores &&
    !loadingHardware &&
    !loadingSystemConfig &&
    !errorTanques &&
    !errorSensores &&
    !errorHardware &&
    !errorSystemConfig &&
    !hasErrors &&
    form.tanques.every((tanque) => tanque.id_tanque.trim().length > 0 && tanque.id_sensor.trim().length > 0);

  if (!isOpen) {
    return null;
  }

  function updateField(
    field: 'nome_processo' | 'tempo_maximo' | 'quantidade_tanques' | 'modo_operacao_auxiliar',
    value: string,
  ): void {
    if (field === 'quantidade_tanques') {
      const quantity = Math.min(Math.max(Number(value) || 1, 1), availableMaxTanks);

      setForm((currentForm) => ({
        ...currentForm,
        quantidade_tanques: String(quantity),
        tanques: resizeTankForms(currentForm.tanques, quantity),
      }));
      return;
    }

    if (field === 'modo_operacao_auxiliar') {
      setForm((currentForm) => ({
        ...currentForm,
        modo_operacao_auxiliar: value as ProcessoFormState['modo_operacao_auxiliar'],
        tanques:
          value === 'MANUAL'
            ? currentForm.tanques
            : resizeTankForms(currentForm.tanques, currentForm.tanques.length),
      }));
      return;
    }

    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function updateTankField(
    index: number,
    field: keyof ProcessoTanqueFormState,
    value: string,
  ): void {
    setForm((currentForm) => ({
      ...currentForm,
      tanques: currentForm.tanques.map((tanque, tanqueIndex) =>
        tanqueIndex === index ? { ...tanque, [field]: value } : tanque,
      ),
    }));
  }

  function updateTankPriority(index: number, value: string): void {
    setForm((currentForm) => {
      const previousPriority = currentForm.tanques[index]?.prioridade ?? '';

      return {
        ...currentForm,
        tanques: currentForm.tanques.map((tanque, tanqueIndex) => {
          if (tanqueIndex === index) {
            return { ...tanque, prioridade: value };
          }

          if (tanque.prioridade === value) {
            return { ...tanque, prioridade: previousPriority };
          }

          return tanque;
        }),
      };
    });
  }

  function handleTanqueChange(index: number, value: string): void {
    setForm((currentForm) => ({
      ...currentForm,
      tanques: currentForm.tanques.map((tanque, tanqueIndex) =>
        tanqueIndex === index
          ? {
              ...tanque,
              id_tanque: value,
              id_sensor: '',
            }
          : tanque,
      ),
    }));

    const idTanque = Number(value);
    setSelectedTanqueId(Number.isInteger(idTanque) && idTanque > 0 ? idTanque : null);

    if (Number.isInteger(idTanque) && idTanque > 0) {
      void loadSensoresForTanque(idTanque);
    }
  }

  async function handleSubmit(): Promise<void> {
    setSubmitted(true);

    if (hasErrors) {
      return;
    }

    await onSubmit(form);
    setForm(initialForm);
    setSubmitted(false);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="new-process-title">
      <section className={styles.modal}>
        <header>
          <div>
            <p>Novo processo</p>
            <h2 id="new-process-title">Configurar processo de vacuo</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Fechar
          </button>
        </header>

        <div className={styles.grid}>
          <label>
            Nome
            <input
              value={form.nome_processo}
              onChange={(event) => updateField('nome_processo', event.target.value)}
              placeholder="Ex.: Ciclo tanque A"
            />
          </label>
          <label>
            Tempo maximo (segundos)
            <input
              type="number"
              min="1"
              step="1"
              value={form.tempo_maximo}
              onChange={(event) => updateField('tempo_maximo', event.target.value)}
              placeholder="Ex.: 900"
            />
            {submitted && errors.tempo_maximo ? <span>{errors.tempo_maximo}</span> : null}
          </label>
          <label>
            Modo de operacao auxiliar
            <select
              value={form.modo_operacao_auxiliar}
              onChange={(event) => updateField('modo_operacao_auxiliar', event.target.value)}
              disabled={isSubmitting}
            >
              <option value="AUTOMATICO">Automatico</option>
              <option value="ASSISTIDO">Assistido</option>
              <option value="MANUAL">Manual</option>
            </select>
            {submitted && errors.modo_operacao_auxiliar ? (
              <span>{errors.modo_operacao_auxiliar}</span>
            ) : null}
            <small className={styles.fieldHelp}>
              {form.modo_operacao_auxiliar === 'AUTOMATICO'
                ? 'A automacao gerencia a bomba auxiliar, as valvulas e a fila.'
                : form.modo_operacao_auxiliar === 'ASSISTIDO'
                  ? 'A automacao opera ate um tecnico assumir um lease temporario.'
                  : 'A automacao apenas monitora e recomenda; o acionamento auxiliar e humano.'}
            </small>
          </label>
          <label>
            Encerramento do processo
            <select
              value={form.encerramento_automatico ? 'automatico' : 'manual'}
              onChange={(event) => setForm((currentForm) => ({
                ...currentForm,
                encerramento_automatico: event.target.value === 'automatico',
              }))}
              disabled={isSubmitting}
            >
              <option value="automatico">Automatico</option>
              <option value="manual">Com autorizacao manual</option>
            </select>
          </label>
          <label>
            Quantidade de tanques
            <select
              value={form.quantidade_tanques}
              onChange={(event) => updateField('quantidade_tanques', event.target.value)}
              disabled={isSubmitting || loadingSystemConfig || Boolean(errorSystemConfig)}
            >
              {Array.from({ length: availableMaxTanks }, (_, index) => index + 1).map((quantity) => (
                <option key={quantity} value={quantity}>
                  {quantity} tanque{quantity > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            {submitted && errors.quantidade_tanques ? <span>{errors.quantidade_tanques}</span> : null}
            {loadingSystemConfig ? <small>Carregando limite global...</small> : null}
            {errorSystemConfig ? <span>{errorSystemConfig}</span> : null}
            {!loadingSystemConfig && !errorSystemConfig ? (
              <small>Limite global atual: {maxTanksPerProcess} tanque(s).</small>
            ) : null}
          </label>
        </div>

        <section className={styles.tankList} aria-label="Tanques do processo">
          {form.tanques.map((tanqueForm, index) => {
            const idTanque = Number(tanqueForm.id_tanque);
            const sensorsForTank =
              Number.isInteger(idTanque) && idTanque > 0
                ? sensorOptionsByTanque[idTanque] ?? []
                : [];
            const loadingSensorsForTank = Number.isInteger(idTanque) && idTanque > 0
              ? loadingSensoresByTanque[idTanque] ?? false
              : false;
            const sensorErrorForTank = Number.isInteger(idTanque) && idTanque > 0
              ? errorSensoresByTanque[idTanque] ?? null
              : null;
            const tankError = errors.tanques?.[index];
            const tanqueHardwareCode = getTanqueHardwareCode(tanqueForm, tanqueOptions);
            const selectedTankIds = form.tanques
              .map((item, itemIndex) => (itemIndex === index ? null : item.id_tanque))
              .filter((value): value is string => Boolean(value));

            return (
              <article key={`tanque-${index + 1}`} className={styles.tankCard}>
                <header>
                  <div>
                    <p>Tanque {index + 1}</p>
                    <h3>Configuracao individual</h3>
                  </div>
                </header>

                <div className={styles.grid}>
                  <label>
                    Tanque
                    <select
                      value={tanqueForm.id_tanque}
                      onChange={(event) => handleTanqueChange(index, event.target.value)}
                      disabled={isSubmitting || loadingTanques || Boolean(errorTanques)}
                    >
                      <option value="">
                        {loadingTanques ? 'Carregando tanques...' : 'Selecione um tanque configurado'}
                      </option>
                      {tanqueOptions.map((tanque) => (
                        <option
                          key={tanque.id_tanque}
                          value={tanque.id_tanque}
                          disabled={selectedTankIds.includes(String(tanque.id_tanque))}
                        >
                          {tanque.label}
                        </option>
                      ))}
                    </select>
                    {submitted && tankError?.id_tanque ? <span>{tankError.id_tanque}</span> : null}
                    {submitted && tankError?.codigo_hardware ? <span>{tankError.codigo_hardware}</span> : null}
                    {errorTanques ? <span>{errorTanques}</span> : null}
                  </label>

                  <label>
                    Vacuo alvo do tanque
                    <input
                      type="number"
                      max="-0.001"
                      step="0.001"
                      value={tanqueForm.vacuo_alvo_tanque}
                      onChange={(event) => updateTankField(index, 'vacuo_alvo_tanque', event.target.value)}
                      placeholder="Ex.: -80.000 kPa"
                    />
                    {submitted && tankError?.vacuo_alvo_tanque ? <span>{tankError.vacuo_alvo_tanque}</span> : null}
                  </label>

                  {form.modo_operacao_auxiliar !== 'MANUAL' && form.tanques.length > 1 ? (
                    <label>
                      Prioridade auxiliar
                      <select
                        value={tanqueForm.prioridade}
                        onChange={(event) => updateTankPriority(index, event.target.value)}
                        disabled={isSubmitting}
                      >
                        {Array.from({ length: form.tanques.length }, (_, priorityIndex) => priorityIndex + 1).map(
                          (priority) => (
                            <option key={priority} value={priority}>
                              {priority}{priority === form.tanques.length ? ' (maior)' : ''}
                            </option>
                          ),
                        )}
                      </select>
                      {submitted && tankError?.prioridade ? <span>{tankError.prioridade}</span> : null}
                    </label>
                  ) : null}

                  <label>
                    Sensor de vacuo
                    <select
                      value={tanqueForm.id_sensor}
                      onChange={(event) => updateTankField(index, 'id_sensor', event.target.value)}
                      disabled={
                        isSubmitting ||
                        !tanqueForm.id_tanque.trim() ||
                        loadingSensorsForTank ||
                        Boolean(sensorErrorForTank) ||
                        sensorsForTank.length === 0
                      }
                    >
                      <option value="">
                        {!tanqueForm.id_tanque.trim()
                          ? 'Selecione um tanque primeiro'
                          : loadingSensorsForTank
                            ? 'Carregando sensores de vacuo...'
                            : sensorsForTank.length === 0
                              ? 'Nenhum sensor de vacuo ativo disponivel'
                              : 'Selecione um sensor de vacuo'}
                      </option>
                      {sensorsForTank.map((sensor) => (
                        <option key={sensor.id_sensor} value={sensor.id_sensor}>
                          {sensor.label}
                        </option>
                      ))}
                    </select>
                    {submitted && tankError?.id_sensor ? <span>{tankError.id_sensor}</span> : null}
                    {sensorErrorForTank ? <span>{sensorErrorForTank}</span> : null}
                    {!loadingSensorsForTank &&
                    tanqueForm.id_tanque.trim() &&
                    !sensorErrorForTank &&
                    sensorsForTank.length === 0 ? (
                      <span>Nenhum sensor de vacuo ativo encontrado para este tanque.</span>
                    ) : null}
                  </label>

                  <label>
                    Observacoes do sensor
                    <textarea
                      value={tanqueForm.observacoes_sensor}
                      onChange={(event) => updateTankField(index, 'observacoes_sensor', event.target.value)}
                      placeholder="Opcional"
                    />
                  </label>
                </div>

                <TankHardwarePreview
                  tanqueHardwareCode={tanqueHardwareCode}
                  valvulasByTanque={valvulasByTanque}
                  isLoading={loadingHardware}
                  error={errorHardware}
                  principalError={tankError?.valvula_principal}
                />
              </article>
            );
          })}
        </section>

        {!loadingTanques && !errorTanques && tanqueOptions.length === 0 ? (
          <p className={styles.note}>Nenhum tanque configurado. Cadastre um tanque em Configuracoes &gt; Tanques.</p>
        ) : null}

        <p className={styles.note}>
          Cada tanque possui seu proprio vacuo alvo e sensor de vacuo. O processo nao usa vacuo
          alvo geral. As valvulas sao fixas por tanque e carregadas automaticamente do hardware.
        </p>
        <p className={styles.note}>
          O modo selecionado controla apenas o subsistema auxiliar. O encerramento e configurado
          separadamente, conforme o contrato da API. Em processos automaticos ou assistidos, o
          maior numero de prioridade e atendido primeiro.
        </p>

        <footer>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="button" onClick={() => void handleSubmit()} disabled={!canSubmit}>
            {isSubmitting ? 'Configurando' : 'Configurar processo'}
          </button>
        </footer>
      </section>
    </div>
  );
}
