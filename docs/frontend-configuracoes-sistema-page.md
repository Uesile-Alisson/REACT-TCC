# Tela de Configuracoes do Sistema - TSEA Frontend

## 1. Resumo

A tela `/configuracoes/sistema` consome a API real de Configuracoes do Sistema.
Ela carrega a configuracao atual com `GET /api/configuracoes/sistema` e salva
alteracoes com `PATCH /api/configuracoes/sistema`.

Nao ha dados simulados, sucesso local artificial ou bloqueio visual por ausencia
de endpoint.

## 2. Rota

- `/configuracoes/sistema`
- Perfis permitidos no front: `TECNICO`, `ADMINISTRADOR`
- `OPERADOR` nao acessa pelo menu e e bloqueado pelo `RoleGuard` ao tentar abrir a rota diretamente.

## 3. Dados consumidos

| Bloco | Service | Endpoint |
|---|---|---|
| Parametros de vacuo | `getConfiguracoesSistema` | `GET /configuracoes/sistema` |
| Seguranca | `getConfiguracoesSistema` | `GET /configuracoes/sistema` |
| Status geral | `getConfiguracoesSistema` | `GET /configuracoes/sistema` |
| Salvamento | `updateConfiguracoesSistema` | `PATCH /configuracoes/sistema` |

O `api` do Axios ja possui `baseURL` com `/api`, entao o service nao adiciona o
prefixo manualmente.

## 4. Campos

| Campo | Editavel | Validacao no front |
|---|---|---|
| `vacuo_padrao` | Sim | Numero valido, sem impor sinal |
| `limite_seguranca_vacuo` | Sim | Numero valido, sem impor sinal |
| `tolerancia_vacuo_percentual` | Sim | Numero entre 0 e 100 |
| `status_geral_sistema` | Sim | Enum real do backend |
| `id_configuracao_sistema` | Nao | Nao enviado |
| `id_usuario_alteracao` | Nao | Nao enviado |
| `criado_em` | Nao | Nao enviado |
| `atualizado_em` | Nao | Nao enviado |

## 5. Formulario

- Inicia com os dados reais carregados pela API.
- Mantem `dirty state`.
- Monta payload apenas com campos alterados.
- Nao envia id, datas ou usuario de alteracao.
- Botao Salvar chama PATCH real.
- Botao Restaurar volta ao ultimo estado carregado.
- Botao Atualizar refaz GET real.

## 6. Estados

- `loading`: leitura inicial ou atualizacao.
- `saving`: PATCH em andamento.
- `success`: PATCH concluido com resposta real.
- `error`: erro retornado pela API ou falha de comunicacao.
- `dirty`: formulario diferente do ultimo estado carregado.
- `forbidden`: mensagem especifica para 403.
- `not found`: mensagem especifica para 404.

## 7. Permissoes

| Perfil | Visualizar | Editar |
|---|---|---|
| `OPERADOR` | Nao | Nao |
| `TECNICO` | Sim | Sim |
| `ADMINISTRADOR` | Sim | Sim |

O backend continua sendo a fonte final de autorizacao. Se a API retornar 403, a
tela exibe `Sem permissao para alterar configuracoes.`

## 8. Tratamento de erro

- `400`: exibe mensagem de payload invalido retornada pela API.
- `401`: tratado pela camada Axios/Auth.
- `403`: `Sem permissao para alterar configuracoes.`
- `404`: `Configuracao do sistema nao cadastrada no backend.`
- `500`: erro inesperado ao processar configuracoes.
- API offline: mensagem de comunicacao da camada Axios.

## 9. O que nao foi alterado

- Auth, login e `/auth/me`.
- Usuarios.
- MQTT/Hardware.
- Processos.
- Alarmes.
- Historico.
- Relatorios.
- Prisma schema, migrations ou seed.

## 10. Documento relacionado

Tanques e Bombas estao documentados em `docs/frontend-tanques-bombas-page.md`.
O resumo consolidado das rotas de Configuracoes esta em `docs/frontend-configuracoes-api-integration.md`.
