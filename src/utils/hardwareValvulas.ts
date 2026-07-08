import type {
  TanqueHardwareCodigo,
  TanqueHardwareComValvulas,
  TipoValvulaHardware,
  ValvulaHardware,
  ValvulasPorTanque,
} from '../types';

export const TANQUES_HARDWARE: TanqueHardwareCodigo[] = ['TANQUE_1', 'TANQUE_2', 'TANQUE_3'];

const VALVULAS_OFICIAIS: Record<TanqueHardwareCodigo, { principal: string; auxiliar: string }> = {
  TANQUE_1: { principal: 'VP_T1', auxiliar: 'VA_T1' },
  TANQUE_2: { principal: 'VP_T2', auxiliar: 'VA_T2' },
  TANQUE_3: { principal: 'VP_T3', auxiliar: 'VA_T3' },
};

const BOMBAS_POR_TIPO: Record<Extract<TipoValvulaHardware, 'PRINCIPAL' | 'AUXILIAR'>, string> = {
  PRINCIPAL: 'BOMBA_VACUO_PRINCIPAL',
  AUXILIAR: 'BOMBA_VACUO_AUXILIAR',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, keys: string[]): string | undefined {
  const value = keys.map((key) => record[key]).find((item) => typeof item === 'string');

  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readNumber(record: Record<string, unknown>, keys: string[]): number | undefined {
  const value = keys.map((key) => record[key]).find((item) => typeof item === 'number');

  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function readBoolean(record: Record<string, unknown>, keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toUpperCase();

      if (['ABERTA', 'OPEN', 'TRUE', 'DISPONIVEL', 'ONLINE'].includes(normalized)) {
        return true;
      }

      if (['FECHADA', 'CLOSED', 'FALSE', 'INDISPONIVEL', 'OFFLINE'].includes(normalized)) {
        return false;
      }
    }
  }

  return undefined;
}

function normalizeTipo(value: unknown, codigoHardware?: string): TipoValvulaHardware {
  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase();

    if (normalized === 'PRINCIPAL' || normalized === 'AUXILIAR') {
      return normalized;
    }
  }

  if (codigoHardware?.startsWith('VP_')) {
    return 'PRINCIPAL';
  }

  if (codigoHardware?.startsWith('VA_')) {
    return 'AUXILIAR';
  }

  return 'OUTRA';
}

export function getTanqueHardwareCodeFromId(idTanque?: number | null): TanqueHardwareCodigo | null {
  if (idTanque === 1) {
    return 'TANQUE_1';
  }

  if (idTanque === 2) {
    return 'TANQUE_2';
  }

  if (idTanque === 3) {
    return 'TANQUE_3';
  }

  return null;
}

export function normalizeTanqueHardwareCode(value: unknown): TanqueHardwareCodigo | null {
  if (typeof value === 'number') {
    return getTanqueHardwareCodeFromId(value);
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_');
  const direct = TANQUES_HARDWARE.find((tanque) => tanque === normalized);

  if (direct) {
    return direct;
  }

  const match = normalized.match(/(?:TANQUE_?|T)([123])$/);

  return match ? getTanqueHardwareCodeFromId(Number(match[1])) : null;
}

function inferTanqueFromValveCode(codigoHardware?: string): TanqueHardwareCodigo | null {
  return normalizeTanqueHardwareCode(codigoHardware);
}

function getNestedRecord(record: Record<string, unknown>, key: string): Record<string, unknown> | null {
  const value = record[key];

  return isRecord(value) ? value : null;
}

function normalizeValvulaRecord(
  value: Record<string, unknown>,
  fallbackCode?: string,
): ValvulaHardware | null {
  const tanqueRecord = getNestedRecord(value, 'tanque');
  const bombaRecord = getNestedRecord(value, 'bomba');
  const codigoHardware = readString(value, [
    'codigo_hardware',
    'codigoHardware',
    'codigo',
    'hardware_code',
  ]) ?? fallbackCode;

  if (!codigoHardware) {
    return null;
  }

  const tipo = normalizeTipo(value.tipo, codigoHardware);
  const idTanque = readNumber(value, ['id_tanque', 'idTanque']) ??
    (tanqueRecord ? readNumber(tanqueRecord, ['id_tanque', 'id', 'idTanque']) : undefined);
  const tanqueCodigo = normalizeTanqueHardwareCode(
    readString(value, ['tanque_codigo_hardware', 'tanqueCodigoHardware']) ??
      (tanqueRecord ? readString(tanqueRecord, ['codigo_hardware', 'codigoHardware', 'codigo']) : undefined),
  ) ?? getTanqueHardwareCodeFromId(idTanque) ?? inferTanqueFromValveCode(codigoHardware);
  const bombaCodigo = readString(value, ['bomba_codigo_hardware', 'bombaCodigoHardware']) ??
    (bombaRecord ? readString(bombaRecord, ['codigo_hardware', 'codigoHardware', 'codigo']) : undefined) ??
    (tipo === 'PRINCIPAL' || tipo === 'AUXILIAR' ? BOMBAS_POR_TIPO[tipo] : undefined);

  return {
    id_valvula: readNumber(value, ['id_valvula', 'idValvula']),
    id: readNumber(value, ['id']),
    codigo_hardware: codigoHardware,
    id_tanque: idTanque,
    tanque_codigo_hardware: tanqueCodigo ?? undefined,
    id_bomba: readNumber(value, ['id_bomba', 'idBomba']) ??
      (bombaRecord ? readNumber(bombaRecord, ['id_bomba', 'id', 'idBomba']) : undefined),
    bomba_codigo_hardware: bombaCodigo,
    tipo,
    aberta: readBoolean(value, ['aberta', 'open', 'isOpen', 'estado_abertura', 'status_abertura']),
    disponivel: readBoolean(value, ['disponivel', 'available', 'online', 'status_disponibilidade']),
    nome: readString(value, ['nome', 'nome_valvula', 'label']),
    descricao: readString(value, ['descricao', 'description']),
  };
}

function extractFromUnknown(value: unknown): ValvulaHardware[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(extractFromUnknown);
  }

  if (!isRecord(value)) {
    return [];
  }

  const nestedSources = [
    value.valvulas,
    value.valves,
    getNestedRecord(value, 'hardware')?.valvulas,
    getNestedRecord(value, 'hardware')?.valves,
  ];
  const nestedValvulas = nestedSources.flatMap(extractFromUnknown);

  if (nestedValvulas.length > 0) {
    return nestedValvulas;
  }

  const directValve = normalizeValvulaRecord(value);

  if (directValve) {
    return [directValve];
  }

  return Object.entries(value).flatMap(([key, item]) => {
    if (!key.startsWith('VP_') && !key.startsWith('VA_')) {
      return [];
    }

    if (isRecord(item)) {
      const normalized = normalizeValvulaRecord(item, key);

      return normalized ? [normalized] : [];
    }

    if (typeof item === 'boolean') {
      return [
        {
          codigo_hardware: key,
          tipo: normalizeTipo(undefined, key),
          tanque_codigo_hardware: inferTanqueFromValveCode(key) ?? undefined,
          bomba_codigo_hardware: key.startsWith('VP_')
            ? BOMBAS_POR_TIPO.PRINCIPAL
            : BOMBAS_POR_TIPO.AUXILIAR,
          aberta: item,
        },
      ];
    }

    return [];
  });
}

export function extractValvulasHardware(...sources: unknown[]): ValvulaHardware[] {
  const valvulas = sources.flatMap(extractFromUnknown);
  const seen = new Set<string>();

  return valvulas.filter((valvula) => {
    const key = valvula.codigo_hardware || String(valvula.id_valvula ?? valvula.id);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function groupValvulasByTanque(input: unknown): ValvulasPorTanque {
  const initial: ValvulasPorTanque = {
    TANQUE_1: {},
    TANQUE_2: {},
    TANQUE_3: {},
  };

  return extractValvulasHardware(input).reduce<ValvulasPorTanque>((grouped, valvula) => {
    const tanque = normalizeTanqueHardwareCode(valvula.tanque_codigo_hardware) ??
      getTanqueHardwareCodeFromId(valvula.id_tanque) ??
      inferTanqueFromValveCode(valvula.codigo_hardware);

    if (!tanque) {
      return grouped;
    }

    const tipo = normalizeTipo(valvula.tipo, valvula.codigo_hardware);

    if (tipo === 'PRINCIPAL') {
      grouped[tanque].principal = valvula;
    }

    if (tipo === 'AUXILIAR') {
      grouped[tanque].auxiliar = valvula;
    }

    return grouped;
  }, initial);
}

export function getTanqueHardwareComValvulas(
  tanque: TanqueHardwareCodigo,
  grouped: ValvulasPorTanque,
): TanqueHardwareComValvulas {
  return {
    tanque,
    valvulaPrincipal: grouped[tanque].principal,
    valvulaAuxiliar: grouped[tanque].auxiliar,
  };
}

export function getExpectedValveCode(
  tanque: TanqueHardwareCodigo,
  tipo: Extract<TipoValvulaHardware, 'PRINCIPAL' | 'AUXILIAR'>,
): string {
  return VALVULAS_OFICIAIS[tanque][tipo === 'PRINCIPAL' ? 'principal' : 'auxiliar'];
}

export function getTanqueHardwareLabel(tanque: TanqueHardwareCodigo): string {
  return `Tanque ${tanque.replace('TANQUE_', '')}`;
}
