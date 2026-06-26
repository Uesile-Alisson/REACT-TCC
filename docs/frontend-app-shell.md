# Fase Front 7 - App Shell e Menu Lateral

## 1. Resumo

A Fase Front 7 criou a estrutura principal autenticada do front-end TSEA, com App Shell, menu lateral esquerdo, topo operacional e rotas protegidas para os modulos futuros do sistema.

O dashboard existente foi preservado e agora roda dentro do layout principal.

## 2. Layout criado

- `src/layouts/AppShell/AppShell.tsx`
- `src/layouts/AppShell/AppShell.module.scss`
- `src/layouts/AppShell/index.ts`

O App Shell possui:

- sidebar fixa em desktop;
- topo com rota ativa, usuario, logout e status realtime;
- menu hamburguer em telas estreitas;
- area principal rolavel;
- responsividade para desktop, notebook, tablet e celular;
- identidade visual escura, tecnologica e compativel com uso futuro em Electron.

## 3. Rotas configuradas

| Rota | Protecao | Status |
| --- | --- | --- |
| `/dashboard` | autenticado | dashboard preservado |
| `/processos` | autenticado | placeholder |
| `/alarmes` | autenticado | placeholder |
| `/historico` | autenticado | placeholder |
| `/relatorios` | autenticado | placeholder |
| `/configuracoes/sistema` | tecnico/admin | integrado |
| `/configuracoes/mqtt-hardware` | tecnico/admin | placeholder |
| `/configuracoes/tanques` | tecnico/admin | integrado |
| `/configuracoes/bombas` | tecnico/admin | integrado |
| `/usuarios` | admin | placeholder |

As rotas publicas de autenticacao foram mantidas fora do App Shell.

## 4. Menu lateral

O menu lateral foi centralizado em `src/config/navigation.ts`.

Itens criados:

- Dashboard TSEA;
- Processos;
- Alarmes;
- Historico;
- Relatorios;
- Configuracoes do Sistema;
- Configuracoes MQTT/Hardware;
- Tanques;
- Bombas;
- Usuarios.

Em desktop, a navegacao permanece na sidebar lateral.

Em mobile/tablet estreito, a sidebar lateral e ocultada e o topo exibe um botao hamburguer com `aria-label="Abrir menu"` e `aria-expanded`. Ao abrir, um overlay centralizado renderiza os mesmos itens autorizados para o perfil do usuario. O overlay fecha ao clicar fora, no botao de fechar, ao pressionar `Escape` ou ao navegar para outra rota.

A navegacao horizontal interna que existia na sidebar mobile foi removida para evitar rolagem lateral no topo/menu.

## 5. Protecao de rotas

Foram mantidas as protecoes existentes por autenticacao em `PrivateRoute`.

Foi criado `src/routes/RoleGuard.tsx` para aplicar controle visual por perfil usando `user.nivel_acesso`.

Perfis considerados:

- `OPERADOR`;
- `TECNICO`;
- `ADMINISTRADOR`.

## 6. Permissoes visuais

| Perfil | Acesso visual |
| --- | --- |
| OPERADOR | Dashboard, Processos, Alarmes, Historico, Relatorios |
| TECNICO | Modulos do operador + configuracoes tecnicas |
| ADMINISTRADOR | Todos os modulos |

O backend continua sendo a fonte final de autorizacao.

## 7. Paginas base criadas

As paginas inexistentes foram criadas como placeholders profissionais, sem regra operacional profunda:

- `ProcessosPage`;
- `AlarmesPage`;
- `HistoricoPage`;
- `RelatoriosPage`;
- `ConfiguracoesSistemaPage`;
- `ConfiguracoesMqttHardwarePage`;
- `TanquesPage`;
- `BombasPage`;
- `UsuariosPage`.

## 8. Paginas preservadas

O `DashboardPage` foi preservado e apenas adaptado para renderizar dentro do App Shell, evitando fundo e logout duplicados.

As telas de autenticacao nao foram alteradas visualmente nesta fase.

## 9. Limitacoes conhecidas

- Sem implementacao operacional profunda dos modulos.
- Sem novas chamadas HTTP.
- Sem novas dependencias instaladas.
- Sem CSV, oleo, vazao, nivel ou volume.
- Sem acesso direto a MQTT ou ESP32.
- Em refresh com apenas `access_token` salvo, o front ainda nao possui endpoint `/me`; portanto o usuario pode ficar sem perfil carregado ate novo login.

## 10. Pendencias para a proxima fase

- Implementar conteudo real das telas operacionais conforme contrato da API.
- Integrar permissoes com validacao backend quando houver endpoint apropriado.
- Evoluir dashboard e modulos dedicados sem duplicar regras de comunicacao.

## 11. Execucao local padrao

Frontend padrao validado:

- `http://127.0.0.1:5173`
- `http://localhost:5173`

Use:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

A porta `5174` nao e tratada como alvo principal do projeto. Se o Vite subir em outra porta por conflito local, a validacao oficial do frontend deve priorizar `5173`.
