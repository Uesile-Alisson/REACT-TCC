# Tela de Configuracoes do Sistema - TSEA Frontend

## 1. Resumo da fase

A Fase Front 13 substituiu o placeholder de `/configuracoes/sistema` por uma tela dedicada para configuracoes gerais do sistema. A tela respeita o contrato real encontrado: ha tabela interna `configuracoessistema` no backend, mas nao existe controller HTTP exposto para leitura ou atualizacao dessas configuracoes gerais.

Por isso, a tela foi implementada em modo leitura/pendencia de endpoint, sem criar service falso e sem enviar payload para rota inexistente.

## 2. Rota

- `/configuracoes/sistema`
- Perfis permitidos: `TECNICO`, `ADMINISTRADOR`
- `OPERADOR` nao acessa pelo menu e e bloqueado pelo `RoleGuard` se tentar acessar diretamente.

## 3. Dados consumidos

| Bloco | Service | Endpoint | Observacoes |
|---|---|---|---|
| Parametros de vacuo | Nao disponivel | Nao disponivel | Backend possui campos internos, mas nao possui controller HTTP dedicado. |
| Seguranca | Nao disponivel | Nao disponivel | Sem leitura/update por API nesta fase. |
| Status geral | Nao disponivel | Nao disponivel | `status_geral_sistema` existe internamente e e atualizado por fluxos do backend/hardware. |

## 4. Componentes criados

| Componente | Responsabilidade |
|---|---|
| `ConfiguracoesSistemaForm` | Organiza os blocos da tela e repassa estado de formulario. |
| `ConfiguracoesSistemaStatusCard` | Exibe status geral, ultima atualizacao e responsavel quando houver dados. |
| `ConfiguracoesSistemaVacuoCard` | Exibe campos de vacuo geral em modo leitura. |
| `ConfiguracoesSistemaSecurityCard` | Exibe limite de seguranca de vacuo e nota operacional. |

## 5. Campos exibidos

| Campo | Editavel | Validacao | Observacoes |
|---|---|---|---|
| `vacuo_padrao` | Nao nesta fase | Numero valido, nao negativo quando update existir | Campo confirmado no schema da API. Nao enviado por ausencia de endpoint. |
| `limite_seguranca_vacuo` | Nao nesta fase | Numero valido, nao negativo quando update existir | Campo confirmado no schema da API. Nao enviado por ausencia de endpoint. |
| `tolerancia_vacuo_percentual` | Nao nesta fase | Numero entre 0 e 100 quando update existir | Campo confirmado no schema da API. Nao enviado por ausencia de endpoint. |
| `status_geral_sistema` | Somente leitura | Backend define estado final | Campo confirmado no schema da API. |
| `atualizado_em` | Somente leitura | Nao aplicavel | Campo confirmado no schema da API. |
| `id_usuario_alteracao` | Somente leitura | Nao aplicavel | Campo confirmado no schema da API. |

## 6. Formulario

- Carregamento: nao chama endpoint porque nao ha service/rota real.
- Edicao: bloqueada visualmente.
- Estado dirty: preparado no hook `useConfiguracoesSistemaForm`.
- Salvar: botao existe, mas permanece desabilitado enquanto o endpoint de update nao existir.
- Cancelar/restaurar: preparado para retornar ao ultimo estado carregado.
- Modo leitura: ativo nesta fase.

API atual nao expoe update de Configuracoes do Sistema; tela implementada em modo leitura.

## 7. Validacoes

Frontend preparado:

- valores numericos validos;
- valores nao negativos para vacuo e limite;
- tolerancia percentual entre 0 e 100.

Backend:

- continua sendo a fonte final de regra de negocio;
- deve validar DTOs futuros quando o endpoint existir.

Limitacao:

- validacoes nao bloqueiam envio nesta fase porque nao ha envio para backend.

## 8. Permissoes visuais

| Perfil | Visualizar | Editar |
|---|---|---|
| `OPERADOR` | Nao | Nao |
| `TECNICO` | Sim | Nao nesta fase, por ausencia de endpoint |
| `ADMINISTRADOR` | Sim | Nao nesta fase, por ausencia de endpoint |

## 9. Tratamento de erro

- `400`: sera exibido por `ApiError` quando endpoint existir.
- `401`: tratado pela camada Axios/Auth.
- `403`: devera aparecer como sem permissao para alterar configuracoes.
- `404`: devera indicar configuracao nao encontrada.
- `409`: reservado para conflito/regra de negocio.
- `500`: devera indicar falha inesperada ao salvar/carregar.

Nesta fase, a tela exibe erro/aviso local informando ausencia de endpoint HTTP.

## 10. O que NAO foi implementado nesta fase

- MQTT/Hardware.
- Tanques.
- Bombas.
- Usuarios.
- Backup.
- Import/export.
- CSV.
- Oleo/vazao/nivel/volume.
- Endpoint novo.
- Service falso.
- Salvamento em rota inexistente.

## 11. Pendencias para Fase Front 14

- Criar tela dedicada de Configuracoes MQTT/Hardware.
- Broker MQTT.
- Status MQTT.
- Status ESP32.
- Sensor principal.
- Ultima leitura.
- Heartbeat.
- Reiniciar comunicacao.
- Sincronizar hardware.
- Consumo de realtime, se disponivel.

## 12. Bloqueios desta fase

- Endpoint de leitura de Configuracoes do Sistema ausente.
- Endpoint de update de Configuracoes do Sistema ausente.
- Service HTTP real ausente porque nao ha rota documentada/exposta.
- API real nao foi executada; contrato foi verificado por documentos e leitura estatica dos controllers/schema.
