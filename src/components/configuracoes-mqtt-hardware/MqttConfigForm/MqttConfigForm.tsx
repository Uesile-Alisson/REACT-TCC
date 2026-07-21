import type { MqttConfigFormErrors, MqttConfigFormState, MqttHardwarePermissions } from '../../../types';
import styles from './MqttConfigForm.module.scss';

type MqttConfigFormProps = {
  formState: MqttConfigFormState;
  errors: MqttConfigFormErrors;
  permissions: MqttHardwarePermissions;
  isSaving: boolean;
  credentialsConfigured: boolean;
  credentialsVerified: boolean;
  onChange: (field: keyof MqttConfigFormState, value: string | boolean) => void;
};

type TextField = {
  field: keyof MqttConfigFormState;
  label: string;
  type?: 'text' | 'number' | 'password';
  placeholder?: string;
};

const connectionFields: TextField[] = [
  { field: 'broker_url', label: 'Broker MQTT' },
  { field: 'porta', label: 'Porta', type: 'number' },
  { field: 'timeout_comunicacao', label: 'Timeout comunicacao', type: 'number' },
];

const credentialFields: TextField[] = [
  { field: 'usuario_mqtt', label: 'Novo usuario MQTT', placeholder: 'Informe para alterar' },
  { field: 'senha_mqtt', label: 'Nova senha MQTT', type: 'password', placeholder: 'Informe para alterar' },
];

const topicFields: TextField[] = [
  { field: 'topico_leituras', label: 'Topico leituras' },
  { field: 'topico_comandos', label: 'Topico comandos' },
  { field: 'topico_status', label: 'Topico status' },
  { field: 'topico_alarmes', label: 'Topico alarmes' },
  { field: 'topico_heartbeat', label: 'Topico heartbeat' },
  { field: 'topico_acoplamentos', label: 'Topico acoplamentos' },
  { field: 'topico_configuracoes', label: 'Topico configuracoes' },
  { field: 'topico_acks', label: 'Topico ACKs' },
];

function getFieldValue(formState: MqttConfigFormState, field: keyof MqttConfigFormState): string {
  const value = formState[field];

  return typeof value === 'string' ? value : '';
}

export function MqttConfigForm({
  formState,
  errors,
  permissions,
  isSaving,
  credentialsConfigured,
  credentialsVerified,
  onChange,
}: MqttConfigFormProps) {
  const readOnly = !permissions.canEditMqttHardwareConfig;

  return (
    <section className={styles.form} aria-label="Configuracao MQTT">
      <header>
        <p>Configuracao ativa</p>
        <h2>Parametros MQTT</h2>
        <span>{readOnly ? 'Somente leitura' : 'Edicao administrativa'}</span>
      </header>

      <div className={styles.grid}>
        {connectionFields.map((item) => (
          <label key={item.field}>
            {item.label}
            <input
              type={item.type ?? 'text'}
              value={getFieldValue(formState, item.field)}
              placeholder={item.placeholder ?? 'Indisponivel'}
              onChange={(event) => onChange(item.field, event.target.value)}
              disabled={readOnly || isSaving}
              autoComplete={item.field === 'senha_mqtt' ? 'new-password' : 'off'}
            />
            {errors[item.field] ? <strong>{errors[item.field]}</strong> : null}
          </label>
        ))}
      </div>

      <div className={styles.switches}>
        <label>
          <input
            type="checkbox"
            checked={formState.reconexao_automatica}
            onChange={(event) => onChange('reconexao_automatica', event.target.checked)}
            disabled={readOnly || isSaving}
          />
          Reconexao automatica
        </label>
        <label>
          <input
            type="checkbox"
            checked={formState.ativo}
            onChange={(event) => onChange('ativo', event.target.checked)}
            disabled={readOnly || isSaving}
          />
          Configuracao ativa
        </label>
      </div>

      <p className={styles.note}>
        O retain padrao nao e editavel com seguranca nesta versao: a API aceita o campo no DTO,
        mas ainda nao o persiste nem o devolve na configuracao ativa.
      </p>

      <section className={styles.topics} aria-label="Credenciais MQTT">
        <h3>
          Credenciais externas — {credentialsConfigured
            ? credentialsVerified ? 'configuradas e verificadas' : 'configuradas'
            : 'nao configuradas'}
        </h3>
        <p className={styles.note}>
          Usuario e senha nao sao retornados pela API. Para altera-los, informe ambos; eles serao
          enviados somente pela rota segura de credenciais.
        </p>
        <div className={styles.grid}>
          {credentialFields.map((item) => (
            <label key={item.field}>
              {item.label}
              <input
                type={item.type ?? 'text'}
                value={getFieldValue(formState, item.field)}
                placeholder={item.placeholder}
                onChange={(event) => onChange(item.field, event.target.value)}
                disabled={readOnly || isSaving}
                autoComplete={item.field === 'senha_mqtt' ? 'new-password' : 'off'}
              />
              {errors[item.field] ? <strong>{errors[item.field]}</strong> : null}
            </label>
          ))}
        </div>
      </section>

      <section className={styles.topics}>
        <h3>Topicos editaveis</h3>
        <div className={styles.grid}>
          {topicFields.map((item) => (
            <label key={item.field}>
              {item.label}
              <input
                type="text"
                value={getFieldValue(formState, item.field)}
                placeholder="Indisponivel"
                onChange={(event) => onChange(item.field, event.target.value)}
                disabled={readOnly || isSaving}
                autoComplete="off"
              />
              {errors[item.field] ? <strong>{errors[item.field]}</strong> : null}
            </label>
          ))}
        </div>
      </section>
    </section>
  );
}
