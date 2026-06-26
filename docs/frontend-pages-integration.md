# Integracao das Paginas com a API - TSEA

## 1. Resumo da fase

A Fase Front 3 integrou as paginas existentes com os services HTTP reais ja criados. O projeto ainda nao possui paginas dedicadas para Processos, Alarmes, Historico, Relatorios, Usuarios ou Configuracoes; por isso, nao foram criadas telas novas. A Dashboard temporaria passou a consumir dados reais de status MQTT/hardware, processo ativo, alarmes, historico e relatorios para validar a comunicacao HTTP sem implementar layout operacional completo.

API real nao executada nesta fase; integracao feita com base nos services e contrato documentado.

## 2. Paginas integradas

| Pagina | Service usado | Rotas consumidas | Status | Observacoes |
|---|---|---|---|---|
| Login | `authService.signIn` via `AuthContext.signin` | `POST /auth/signin` | Integrada | Redireciona para `/first-access` ou `/dashboard`. |
| Primeiro acesso | `authService.firstAccess` | `POST /auth/first-access` | Integrada | Mantem indicador de senha e atualiza estado local de primeiro acesso. |
| Esqueci senha | `authService.forgotPassword` | `POST /auth/forgot-password` | Integrada | Envia `login`, nao e-mail. |
| Redefinir senha | `authService.resetPassword` | `POST /auth/reset-password` | Integrada | Usa `token` da URL. |
| Dashboard | `mqttHardwareService`, `processosService`, `alarmesService`, `historicoService`, `relatoriosService` via `useDashboardData` | `GET /mqtt-hardware/status`, `GET /processos/ativo`, `GET /alarmes/dashboard`, `GET /historico/dashboard`, `GET /relatorios` | Integrada parcialmente | Painel minimo para validar dados reais; nao e dashboard final. |

## 3. Auth e protecao de rotas

- `AuthContext` segue centralizando token, usuario, login, logout e primeiro acesso.
- `PublicRoute` impede retorno para `/login` quando autenticado.
- `PrivateRoute` protege `/first-access` e `/dashboard`.
- Token continua na chave central `access_token`.
- Nao foi criado endpoint `/me`, pois o contrato atual nao possui essa rota.
- O contexto puro foi separado em `AuthContextValue.ts` para remover `eslint-disable`.

## 4. Processos

- Integracao existente: Dashboard consulta `GET /processos/ativo`.
- Paginas dedicadas de listagem/detalhe/criacao de processos ainda nao existem.
- Acoes como iniciar, pausar, retomar, finalizar, interromper e parada de emergencia existem no service, mas nao foram conectadas em UI por ausencia de pagina.
- Nao houve simulacao de processo e nenhum fluxo de oleo/vazao/nivel/volume foi criado.

## 5. Alarmes

- Integracao existente: Dashboard consulta `GET /alarmes/dashboard`.
- Pagina dedicada de alarmes ainda nao existe.
- Resolucao de alarme existe no service, mas nao foi conectada em UI por ausencia de pagina.
- Nao houve popup em tempo real e nenhum Socket.IO foi implementado.

## 6. Historico

- Integracao existente: Dashboard consulta `GET /historico/dashboard`.
- Pagina dedicada de historico ainda nao existe.
- Listagem, detalhe, tanques, alarmes, eventos, grafico de vacuo e comparativos seguem disponiveis no service para telas futuras.
- Historico nao gera relatorio diretamente nesta fase.

## 7. Relatorios

- Integracao existente: Dashboard consulta `GET /relatorios` para obter contagem.
- Pagina dedicada de relatorios ainda nao existe.
- Geracao de relatorio de processo e alarme existe no service, mas nao foi conectada em UI por ausencia de pagina.
- Preview e download foram deixados para a Fase Front 5.
- Nenhuma opcao CSV foi criada.

## 8. Configuracoes/Usuarios, se aplicavel

- Paginas de Usuarios e Configuracoes ainda nao existem no frontend atual.
- Services de usuarios e MQTT/configuracao existem para uso futuro.
- Nenhuma tela administrativa foi criada nesta fase.

## 9. Permissoes aplicadas

- Rotas privadas exigem autenticacao.
- Como nao existem paginas administrativas ou acoes operacionais conectadas, nao houve ocultacao adicional por perfil em telas dedicadas.
- Dashboard exibe o `nivel_acesso` do usuario autenticado quando disponivel.
- Permissoes futuras devem seguir:
  - OPERADOR: consulta operacional, alarmes e relatorios sem geracao/download.
  - TECNICO: operacao tecnica e geracao de relatorios.
  - ADMINISTRADOR: administracao, configuracoes e usuarios.

## 10. Estados de loading/error/empty

- Forms de auth possuem loading no submit, erro de API e bloqueio contra duplo submit.
- Dashboard possui loading, erro e fallback para dados indisponiveis.
- Empty states completos de listas ficam pendentes ate existirem paginas dedicadas de modulo.

## 11. Mocks removidos ou ainda pendentes

- A busca por termos de simulacao nao encontrou ocorrencias apos os ajustes daquela fase.
- Nao ha dados simulados usados como fonte principal nas paginas integradas.

## 12. Pendencias para Fase Front 4

- Integrar Socket.IO do namespace `mqtt-hardware`.
- Integrar eventos de status MQTT/ESP32.
- Integrar leituras de vacuo em tempo real.
- Integrar eventos de alarmes em tempo real.
- Integrar eventos de lifecycle de processos.
- Integrar atualizacoes de acoplamento.

## 13. Pendencias para Fase Front 5

- Implementar preview PDF.
- Implementar download PDF.
- Implementar download XLSX.
- Usar Blob visualmente nas telas.
- Aplicar parser de `Content-Disposition` na UI de arquivo.
- Aplicar permissoes de download por perfil.
