import type {
  DateString,
  Id,
  PaginatedResponse,
  QueryParams,
  StatusProcesso,
} from './common.types';
import type { TipoValvulaHardware, TanqueHardwareCodigo } from './mqtt-hardware.types';

export type ModoOperacaoAuxiliar = 'AUTOMATICO' | 'ASSISTIDO' | 'MANUAL';

export type CreateProcessoSensorRequest = {
  id_sensor: Id;
  observacoes?: string;
};

export type CreateProcessoTanqueRequest = {
  id_tanque: Id;
  prioridade?: number;
  vacuo_alvo?: number;
  sensores: CreateProcessoSensorRequest[];
};

export type CreateProcessoRequest = {
  nome_processo?: string;
  tempo_maximo: number;
  vacuo_alvo?: number;
  modo_operacao_auxiliar: ModoOperacaoAuxiliar;
  encerramento_automatico: boolean;
  tanques: CreateProcessoTanqueRequest[];
};

export type UpdateProcessoConfigRequest = Partial<CreateProcessoRequest>;

export type ListProcessosQuery = QueryParams & {
  status_processo?: StatusProcesso;
  busca?: string;
  data_inicio?: DateString;
  data_fim?: DateString;
  page?: number;
  limit?: number;
};

export type ProcessoResponse = {
  id_processo: Id;
  nome_processo?: string;
  status_processo: StatusProcesso;
  tempo_maximo?: number;
  vacuo_alvo?: number;
  modo_operacao_auxiliar?: ModoOperacaoAuxiliar;
  encerramento_automatico?: boolean;
  criado_em?: DateString;
  atualizado_em?: DateString;
  iniciado_em?: DateString;
  finalizado_em?: DateString;
  [key: string]: unknown;
};

export type ProcessoActionResult<TData = ProcessoResponse> = {
  success: boolean;
  message: string;
  id_processo: Id;
  status_processo: StatusProcesso;
  data?: TData;
};

export type ProcessoGeneralClosureState = {
  status: string;
  etapa: string;
  automatico: boolean;
  pronto_para_iniciar: boolean;
  aguardando_acao_manual: boolean;
  hardware_confirmado: boolean;
  iniciado_em: DateString | null;
  finalizado_em: DateString | null;
  confirmacao_iniciada_em: DateString | null;
  proxima_tentativa_em: DateString | null;
  tentativa: number;
  comando_tentativas: number;
  ultimo_erro: string | null;
  versao: number;
};

export type ProcessoGeneralClosureStartResponse = {
  success: true;
  message: string;
  id_processo: Id;
  encerramento: ProcessoGeneralClosureState;
};

export type ProcessoTankClosureState = {
  status: string;
  etapa: string;
  automatico: boolean;
  pronto_para_encerrar: boolean;
  aguardando_acao_manual: boolean;
  pode_desacoplar: boolean;
  mangueira_acoplada: boolean | null;
  iniciado_em: DateString | null;
  isolado_em: DateString | null;
  retencao_iniciada_em: DateString | null;
  retencao_finalizada_em: DateString | null;
  vacuo_isolamento: number | null;
  perda_vacuo_retencao: number | null;
  motivo_bloqueio: string | null;
  versao: number;
  tentativa: number;
  comando_tentativas: number;
  proxima_tentativa_em: DateString | null;
  estabilizacao: {
    tempo_necessario_segundos: number;
    cobertura_minima_percentual: number;
    leituras_esperadas: number;
    leituras_observadas: number;
    cobertura_atual_percentual: number;
    maior_intervalo_ms: number;
    timeout_leitura_ms: number;
    continuidade_aprovada: boolean;
  };
  retencao: {
    tempo_necessario_segundos: number;
    perda_maxima_permitida: number;
  };
  seguranca: {
    limite_vacuo: number;
    limite_excedido: boolean;
  };
};

export type ProcessoTankClosureStartResponse = {
  success: true;
  message: string;
  id_processo: Id;
  id_processo_tanque: Id;
  encerramento: ProcessoTankClosureState;
};

export type ProcessoAuxiliarControlHolder = {
  id_usuario: Id;
  nome: string;
  login: string;
  assumido_em: DateString | null;
  expira_em: DateString | null;
};

export type ProcessoAuxiliarPumpState = {
  id_bomba: Id;
  nome: string;
  codigo_hardware: string | null;
  status_configuracao: string;
  ligada_hardware: boolean | null;
  disponivel_hardware: boolean | null;
  ultimo_status_hardware_em: DateString | null;
  controle: ProcessoAuxiliarControlHolder | null;
};

export type ProcessoAuxiliarValveState = {
  id_valvula: Id;
  nome: string;
  codigo_hardware: string | null;
  status_valvula: string;
  ativa: boolean;
  ultimo_acionamento: DateString | null;
  controle: ProcessoAuxiliarControlHolder | null;
};

export type ProcessoAuxiliarEvidence = {
  avaliacao_iniciada_em: DateString | null;
  avaliacao_finalizada_em: DateString | null;
  vacuo_antes: number | null;
  tendencia_antes: number | null;
  vacuo_durante: number | null;
  tendencia_durante: number | null;
  vacuo_apos: number | null;
  tendencia_apos: number | null;
  melhoria_observada: number | null;
  melhoria_minima_esperada: number | null;
  eficacia_confirmada: boolean | null;
  motivo: string | null;
};

export type ProcessoAuxiliarTankState = {
  id_processo_tanque_auxiliar: Id;
  id_processo_tanque: Id;
  id_tanque: Id;
  nome_tanque: string;
  status_auxilio: string;
  prioridade: number;
  posicao_fila: number | null;
  solicitado_em: DateString | null;
  iniciado_em: DateString | null;
  finalizado_em: DateString | null;
  versao: number;
  motivo_bloqueio: string | null;
  ultimo_erro: string | null;
  evidencias: ProcessoAuxiliarEvidence;
  status_acoplamento: string | null;
  quantidade_valvulas_auxiliares: number;
  valvula_auxiliar: ProcessoAuxiliarValveState | null;
};

export type ProcessoAuxiliarState = {
  id_processo: Id;
  modo_operacao_auxiliar: ModoOperacaoAuxiliar;
  status_subsistema: string;
  versao: number;
  tanque_em_atendimento: {
    id_processo_tanque: Id;
    id_tanque: Id;
    nome_tanque: string;
  } | null;
  bomba_auxiliar: ProcessoAuxiliarPumpState | null;
  tanques: ProcessoAuxiliarTankState[];
  motivo_bloqueio: string | null;
  ultimo_erro: string | null;
  atualizado_em: DateString;
  snapshot_at: DateString;
};

export type ProcessoAuxiliarMutationResponse = {
  success: true;
  message: string;
  resource?: string;
  operation?: string;
  action?: string;
  id_processo?: Id | null;
  id_processo_tanque?: Id | null;
  lease?: Record<string, unknown>;
  command?: Record<string, unknown>;
  auxiliary_state: ProcessoAuxiliarState | null;
  auxiliary_state_warning?: string;
};

export type ProcessoAuxiliarLeaseRequest = {
  expected_version: number;
  duration_seconds?: number;
  motivo: string;
};

export type ProcessoAuxiliarReleaseRequest = {
  expected_version: number;
  motivo: string;
};

export type ProcessoAuxiliarCommandRequest = {
  expected_subsystem_version: number;
  expected_tank_version?: number;
  correlation_id?: string;
  motivo: string;
};

export type ProcessoClosureRequest = {
  expected_version: number;
  motivo: string;
};

export type ProcessoEmergencyState = {
  ativa: boolean;
  status: string;
  etapa: string;
  hardware_confirmado: boolean;
  nivel_confirmacao: string;
  latch_emergencia_confirmado: boolean;
  saidas_controlador_confirmadas: boolean;
  feedback_mecanico_disponivel: boolean;
  requer_intervencao: boolean;
  solicitada_em: DateString | null;
  confirmada_em: DateString | null;
  proxima_tentativa_em: DateString | null;
  tentativa: number;
  comando_tentativas: number;
  ultimo_erro: string | null;
  versao: number;
};

export type ProcessoEmergencyActionData = {
  processo: ProcessoResponse;
  parada_emergencia: ProcessoEmergencyState;
  command_results: Record<string, unknown>[];
  command_failures: Record<string, unknown>[];
  idempotent: boolean;
};

export type ProcessoEmergencyActionResponse = ProcessoActionResult<ProcessoEmergencyActionData>;

export type ProcessoListResponse = PaginatedResponse<ProcessoResponse> | ProcessoResponse[];

export type ProcessoDashboardReadingPoint = {
  id_leitura_sensor: Id;
  id_processo_tanque_sensor: Id;
  id_tanque: Id;
  id_sensor: Id;
  valor_vacuo: number;
  leitura_em: DateString;
  recebido_em: DateString;
};

export type ProcessoTankStagnationState = {
  status: string;
  suspeita: boolean;
  detectada: boolean;
  iniciada_em: DateString | null;
  detectada_em: DateString | null;
  ultima_avaliacao_em: DateString | null;
  duracao_segundos: number;
  variacao_vacuo: number | null;
  janela_segundos: number;
  variacao_minima_esperada: number;
  variacao_minima_base: number;
  leituras_janela: number;
  leituras_minimas: number;
  janelas_sem_progresso: number;
  janelas_consecutivas_necessarias: number;
  id_alarme_ativo: Id | null;
  mensagem: string;
  evidencias: {
    fator_volume: number | null;
    fator_tanques_ativos: number | null;
    fator_proximidade_alvo: number | null;
    volume_tanque: number | null;
    volume_medio_tanques_ativos: number | null;
    tanques_ativos: number;
    vacuo_atual: number | null;
    distancia_alvo: number | null;
    tempo_bomba_principal_segundos: number;
    motivo_decisao: string | null;
  };
};

export type ProcessoDashboardTank = {
  id_processo_tanque: Id;
  id_tanque: Id;
  nome_tanque: string;
  status_tanque_processo: string;
  vacuo_atingido: boolean;
  vacuo_estabilizado: boolean;
  vacuo_alvo: number;
  vacuo_atual: number | null;
  vacuo_inicial: number | null;
  vacuo_final: number | null;
  vacuo_medio: number | null;
  eficiencia: number | null;
  iniciado_em: DateString | null;
  finalizado_em: DateString | null;
  ultima_leitura_em: DateString | null;
  ultima_leitura_recebida_em: DateString | null;
  total_sensores: number;
  total_leituras: number;
  encerramento: ProcessoTankClosureState;
  estagnacao: ProcessoTankStagnationState;
  leituras: ProcessoDashboardReadingPoint[];
};

export type ProcessoDashboardClosureState = {
  habilitado: boolean;
  fase_processo: string;
  pode_desacoplar: boolean;
  geral: ProcessoGeneralClosureState;
  total_tanques: number;
  tanques_concluidos: number;
  tanques_prontos: number;
  tanques_aguardando_acao_manual: number;
  tanques_pendentes: number;
  versao: number;
  parametros: {
    tolerancia_vacuo_percentual: number;
    limite_seguranca_vacuo: number;
    tempo_estabilizacao_segundos: number;
    cobertura_minima_percentual: number;
    intervalo_leitura_esperado_ms: number;
    timeout_leitura_sensor_ms: number;
    tempo_retencao_segundos: number;
    perda_vacuo_maxima_retencao: number;
  };
};

export type ProcessoDashboardResponse = {
  id_processo: Id;
  snapshot_at: DateString;
  nome_processo: string | null;
  status_processo: StatusProcesso;
  vacuo_alvo: number;
  vacuo_atual: number | null;
  tempo_maximo: number;
  tempo_execucao: number | null;
  iniciado_em: DateString | null;
  finalizado_em: DateString | null;
  progresso_percentual: number;
  parada_emergencia: ProcessoEmergencyState;
  encerramento: ProcessoDashboardClosureState;
  subsistema_auxiliar: ProcessoAuxiliarState;
  tanques: ProcessoDashboardTank[];
  alarmes: {
    total: number;
    criticos: number;
    medios: number;
    infos: number;
    ultima_severidade: string | null;
  };
};

export type FinalizarProcessoRequest = {
  observacao?: string;
};

export type InterromperProcessoRequest = {
  motivo: string;
  observacao?: string;
};

export type ParadaEmergenciaProcessoRequest = {
  motivo: string;
  detalhes?: string;
};

export type ProcessoReadingQuery = QueryParams & {
  data_inicio?: DateString;
  data_fim?: DateString;
  page?: number;
  limit?: number;
};

export type ProcessoReadingResponse = {
  id_leitura_sensor?: Id;
  id_processo?: Id;
  id_tanque?: Id;
  id_sensor?: Id;
  valor_vacuo?: number;
  unidade_medida?: string | null;
  leitura_em?: DateString;
  registrado_em?: DateString;
  [key: string]: unknown;
};

export type ProcessoReadingListResponse =
  | PaginatedResponse<ProcessoReadingResponse>
  | ProcessoReadingResponse[];

export type ProcessoEventResponse = {
  id_evento?: Id;
  id_processo?: Id;
  tipo_evento?: string;
  descricao?: string;
  registrado_em?: DateString;
  [key: string]: unknown;
};

export type ProcessoEventListResponse =
  | PaginatedResponse<ProcessoEventResponse>
  | ProcessoEventResponse[];

export type ProcessoPrecheckStatus =
  | 'APROVADO'
  | 'REPROVADO'
  | 'PENDENTE'
  | 'FALHA'
  | 'NAO_SUPORTADO'
  | 'NAO_CONFIRMADO'
  | 'IGNORADO';

export type ProcessoPrecheckGrupo =
  | 'USUARIO'
  | 'PROCESSO'
  | 'TANQUES'
  | 'ACOPLAMENTO'
  | 'SENSORES'
  | 'VALVULAS'
  | 'BOMBAS'
  | 'MQTT'
  | 'ESP32'
  | 'SOCKET'
  | 'LOGS';

export type ProcessoPrecheckCorrectiveActionCode =
  | 'CALIBRAR_SENSOR'
  | 'CONTINUAR_CALIBRACAO_SENSOR'
  | 'LIBERAR_SENSOR'
  | 'ATIVAR_SENSOR'
  | 'AGUARDAR_TELEMETRIA_SENSOR'
  | 'DIAGNOSTICAR_SENSOR'
  | 'TESTAR_ESTADO_SEGURO_VALVULA'
  | 'REVISAR_CONFIGURACAO_VALVULA';

export type ProcessoPrecheckCorrectiveAction = {
  codigo: ProcessoPrecheckCorrectiveActionCode;
  titulo: string;
  metodo: 'GET' | 'POST' | 'PATCH' | null;
  endpoint: string | null;
  disponivel: boolean;
  requer_confirmacao: boolean;
  reexecutar_prechecagem: boolean;
  motivo_indisponibilidade: string | null;
};

export type ProcessoPrecheckGroupResult = {
  grupo: ProcessoPrecheckGrupo;
  status: 'APROVADO' | 'REPROVADO';
  aprovado: boolean;
  total_itens: number;
  total_bloqueantes: number;
};

export type ProcessoPrecheckItem = {
  codigo?: string;
  titulo: string;
  grupo: ProcessoPrecheckGrupo;
  status: ProcessoPrecheckStatus;
  obrigatorio?: boolean;
  bloqueante?: boolean;
  mensagem?: string;
  evidencia?: string | null;
  detalhes?: Record<string, unknown> | string | null;
  id_recurso?: Id | null;
  tipo_recurso?: string | null;
  acao_corretiva?: ProcessoPrecheckCorrectiveAction | null;
  timestamp?: DateString | null;
};

export type ProcessoPrecheckResponse = {
  id_processo: Id;
  status_geral: ProcessoPrecheckStatus;
  aprovado: boolean;
  bloqueado: boolean;
  executado_em?: DateString | null;
  validade_segundos?: number | null;
  grupos?: ProcessoPrecheckGroupResult[];
  itens: ProcessoPrecheckItem[];
  falhas_bloqueantes?: string[];
  avisos?: string[];
  recomendacoes?: string[];
};

export type ProcessoValvulaResumo = {
  id_valvula: Id;
  id?: Id;
  codigo_hardware?: string;
  nome?: string;
  nome_valvula?: string;
  id_tanque?: Id | null;
  tanque_codigo_hardware?: TanqueHardwareCodigo | string | null;
  tanque?: unknown;
  id_bomba?: Id | null;
  bomba_codigo_hardware?: string | null;
  bomba?: unknown;
  tipo?: TipoValvulaHardware | string | null;
  aberta?: boolean | null;
  disponivel?: boolean | null;
  status_atual?: string | null;
  status_valvula?: string | null;
  ultimo_acionamento?: DateString | null;
  pode_validar?: boolean;
  pode_abrir_fechar?: boolean;
  [key: string]: unknown;
};

export type ProcessoCommandResult = {
  comando: string;
  topic: string;
  qos: number;
  retain: boolean;
  correlation_id: string;
  published_at: DateString;
  acknowledged?: boolean;
  ack_status?: 'EXECUTADO';
  ack_received_at?: DateString;
  ack_message?: string | null;
  reused_ack?: boolean;
};

export type ProcessoValvulaTesteSeguroDetalhes = {
  command_results?: ProcessoCommandResult[];
  command_failures?: Array<{ comando: string; message: string }>;
  estado_controlador_confirmado?: boolean;
  feedback_mecanico_disponivel?: boolean;
  snapshot_recebido?: boolean;
  motivo_nao_confirmacao?: string | null;
};

export type ProcessoValvulaAcaoResponse = {
  id_processo: Id;
  id_valvula: Id;
  acao: 'VALIDAR' | 'ABRIR' | 'FECHAR';
  status: ProcessoPrecheckStatus;
  aprovado: boolean;
  mensagem: string;
  evidencia: string | null;
  detalhes: ProcessoValvulaTesteSeguroDetalhes | Record<string, unknown> | null;
  executado_em: DateString;
};
