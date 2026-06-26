# Revisao Final de Navegacao e Permissoes - TSEA Frontend

## 1. Resumo da fase

A Fase Front 17 revisou rotas, menu lateral, guards, permissoes visuais e tratamento basico de
`401`/`403` do frontend TSEA. A revisao foi feita por codigo, rotas, guards e services; a API real
nao foi executada nesta fase.

## 2. Perfis oficiais

- `OPERADOR`
- `TECNICO`
- `ADMINISTRADOR`

## 3. Matriz de rotas

| Rota | OPERADOR | TECNICO | ADMINISTRADOR | Guard aplicado | Observacoes |
|---|---|---|---|---|---|
| `/dashboard` | Sim | Sim | Sim | `PrivateRoute` | Area autenticada geral. |
| `/processos` | Sim | Sim | Sim | `PrivateRoute` + `RoleGuard(ALL_ROLES)` | Acoes tecnicas filtradas por hook. |
| `/alarmes` | Sim | Sim | Sim | `PrivateRoute` + `RoleGuard(ALL_ROLES)` | Resolver apenas para tecnico/admin. |
| `/historico` | Sim | Sim | Sim | `PrivateRoute` + `RoleGuard(ALL_ROLES)` | Gerar relatorio apenas tecnico/admin. |
| `/relatorios` | Sim | Sim | Sim | `PrivateRoute` + `RoleGuard(ALL_ROLES)` | Operador sem gerar/download. |
| `/configuracoes/sistema` | Nao | Sim | Sim | `PrivateRoute` + `RoleGuard(TECHNICAL_ROLES)` | Edicao via API real. |
| `/configuracoes/mqtt-hardware` | Nao | Sim | Sim | `PrivateRoute` + `RoleGuard(TECHNICAL_ROLES)` | Edicao restrita a admin no hook/backend. |
| `/configuracoes/tanques` | Nao | Sim | Sim | `PrivateRoute` + `RoleGuard(TECHNICAL_ROLES)` | CRUD tecnico via API real. |
| `/configuracoes/bombas` | Nao | Sim | Sim | `PrivateRoute` + `RoleGuard(TECHNICAL_ROLES)` | Sem acionamento direto de hardware. |
| `/usuarios` | Nao | Nao | Sim | `PrivateRoute` + `RoleGuard(ADMIN_ROLES)` | CRUD administrativo via `/user`. |
| `/access-denied` | Sim | Sim | Sim | `PrivateRoute` | Pagina clara para falta de permissao. |
| rota privada inexistente | Sim | Sim | Sim | `PrivateRoute` | Renderiza `NotFoundPage`. |

## 4. Matriz de menu lateral

| Item | Rota | OPERADOR | TECNICO | ADMINISTRADOR |
|---|---|---|---|---|
| Dashboard TSEA | `/dashboard` | Sim | Sim | Sim |
| Processos | `/processos` | Sim | Sim | Sim |
| Alarmes | `/alarmes` | Sim | Sim | Sim |
| Historico | `/historico` | Sim | Sim | Sim |
| Relatorios | `/relatorios` | Sim | Sim | Sim |
| Configuracoes do Sistema | `/configuracoes/sistema` | Nao | Sim | Sim |
| Configuracoes MQTT/Hardware | `/configuracoes/mqtt-hardware` | Nao | Sim | Sim |
| Tanques | `/configuracoes/tanques` | Nao | Sim | Sim |
| Bombas | `/configuracoes/bombas` | Nao | Sim | Sim |
| Usuarios | `/usuarios` | Nao | Nao | Sim |

## 5. Matriz de acoes por modulo

### Dashboard

- Todos os perfis autenticados visualizam.
- Nao foram encontrados botoes de iniciar/parar/finalizar no dashboard.

### Processos

- Todos os perfis acessam.
- Acoes de criar/iniciar/pausar/retomar/finalizar/interromper seguem `useProcessPermissions`.
- A API/backend permanece como validacao final.

### Alarmes

- Todos os perfis acessam.
- Resolver alarme aparece somente para `TECNICO` e `ADMINISTRADOR`.
- Nao foi encontrada acao de criar/editar/excluir alarme.

### Historico

- Todos os perfis acessam.
- Gerar relatorio historico aparece somente para `TECNICO` e `ADMINISTRADOR`.
- Nao foram encontradas acoes operacionais de processo ativo no historico.

### Relatorios

- `OPERADOR`: lista, detalhe e preview PDF; sem gerar/download.
- `TECNICO`: lista, detalhe, preview, gera e baixa.
- `ADMINISTRADOR`: lista, detalhe, preview, gera e baixa.
- Nao foi encontrado CSV, editar, regenerar ou excluir relatorio.

### Configuracoes do Sistema

- Apenas `TECNICO` e `ADMINISTRADOR` acessam.
- Edicao permanece bloqueada enquanto endpoint dedicado nao estiver disponivel.

### Configuracoes MQTT/Hardware

- Apenas `TECNICO` e `ADMINISTRADOR` acessam.
- Edicao de configuracao e restrita a `ADMINISTRADOR`.
- Senha MQTT fica em campo de entrada e nao e exibida como valor retornado.
- Nao ha conexao direta MQTT/ESP32 fora dos services existentes.

### Tanques

- Apenas `TECNICO` e `ADMINISTRADOR` acessam.
- Telas de configuracao tecnica usam API dedicada.
- Nao ha acao operacional de processo.

### Bombas

- Apenas `TECNICO` e `ADMINISTRADOR` acessam.
- Nao ha botao de ligar/desligar bomba nem abrir/fechar valvula diretamente.

### Usuarios

- Apenas `ADMINISTRADOR` acessa.
- Criar, editar, alterar nivel e excluir usam service real `/user`.
- Credenciais temporarias aparecem apenas apos criacao e nao sao persistidas.

## 6. ProtectedRoute

- Sem login: redireciona para `/login`, preservando `location.state.from`.
- Com login: renderiza `children` ou `Outlet`.
- Enquanto carrega: mostra fallback simples `Carregando...`.

## 7. RoleGuard

- Autorizado: renderiza `children` ou `Outlet`.
- Sem permissao: redireciona para `/access-denied`.
- A pagina `AccessDeniedPage` permite voltar ao dashboard.

## 8. Tratamento 401/403

- `401`: interceptor Axios dispara evento de sessao nao autorizada; `AuthProvider` limpa token e usuario.
- `403`: permanece como erro de API para a tela exibir mensagem de sem permissao.
- Limitacao: ainda nao existe endpoint `/me`, entao usuario salvo por token antigo nao e hidratado ao recarregar.

## 9. Correcoes aplicadas

| Arquivo | Correcao | Motivo |
|---|---|---|
| `src/api/auth-events.ts` | Criado evento global de sessao nao autorizada. | Permitir limpeza centralizada em `401`. |
| `src/api/axios.ts` | Interceptor de response dispara evento em `401`. | Encaminhar sessao expirada ao AuthProvider. |
| `src/contexts/AuthContext.tsx` | Listener limpa sessao no evento de `401`. | Evitar token ativo apos erro de autenticacao. |
| `src/routes/RoleGuard.tsx` | Redireciona para `/access-denied`. | Evitar redirect silencioso para dashboard. |
| `src/routes/AppRoutes.tsx` | Adicionadas rotas `access-denied` e wildcard privado. | Tratamento claro de acesso negado e rota inexistente. |
| `src/pages/AccessDenied/*` | Pagina simples criada. | Feedback claro para perfil sem permissao. |
| `src/pages/NotFound/*` | Pagina simples criada. | Tratamento de rota privada inexistente. |

## 10. Inconsistencias encontradas e corrigidas

- `RoleGuard` redirecionava sem permissao para `/dashboard`; agora envia para `/access-denied`.
- Rotas privadas inexistentes caiam no redirect generico; agora exibem `NotFoundPage`.
- `401` estava apenas reservado para futuro; agora limpa sessao via evento centralizado.

## 11. Inconsistencias encontradas e mantidas como pendencia

| Item | Motivo |
|---|---|
| Hidratacao de usuario apos reload com token salvo | A API ainda nao possui `/me`; manter como pendencia para fase/backend propria. |
| Validacao real por perfil | API real nao foi executada nesta fase. |

## 12. Seguranca visual

- Senha atual nao e exibida nas paginas autenticadas.
- Hash nao e renderizado.
- Token nao e renderizado.
- Credenciais temporarias ficam em estado local e sao limpas ao fechar modal.
- MQTT/ESP32 direto nao foi adicionado.
- Comandos diretos de bomba/valvula nao foram encontrados nas telas de Bombas.

## 13. O que NAO foi implementado nesta fase

- Telas operacionais novas.
- Endpoints.
- Backend.
- CSV.
- Fluxos de oleo/vazao/nivel/volume operacional.
- Comandos diretos de hardware.
- WebSocket manual.

## 14. Pendencias para Fase Front 18

- Polimento visual final.
- Responsividade fina.
- Refinar loading/empty/error states.
- Acessibilidade.
- Consistencia de textos.
- Teste real com API.
- Teste por perfil real: `OPERADOR`, `TECNICO`, `ADMINISTRADOR`.
