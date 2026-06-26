# Fase 8: Relatorios, Historico e graficos reais

## Historico

A acao `Gerar relatorio` do Historico chama `POST /relatorios/processos/:id_processo` com `formatos: ["PDF"]`. Em caso de sucesso, o modal fecha, a listagem e recarregada e o detalhe do processo selecionado e sincronizado para buscar os relatorios vinculados novamente. Em caso de erro, o modal permanece aberto e a mensagem da API fica visivel na tela.

Na Fase 8.2, a listagem do Historico passou a exibir todos os processos registrados pela API, nao apenas os status finais. O filtro de status continua disponivel e aceita o enum completo de processo.

## Download e tabelas

A pagina Relatorios usa download direto por blob para PDF e XLSX quando o arquivo existe e a permissao permite. As acoes das tabelas de Processos, Historico, Alarmes e Relatorios foram compactadas para icones com `aria-label`/`title`, e as tabelas usam layout fixo com truncamento para evitar barra horizontal.

## Graficos adicionados

Todos os graficos usam dados ja carregados por hooks/servicos reais do frontend. Nao foram adicionados arrays mockados, seeds locais ou valores fixos de negocio.

- Dashboard: alarmes recentes por severidade e indicadores operacionais de alarmes/relatorios.
- Processos: processos por status e serie de `valor_vacuo` das leituras do processo selecionado.
- Historico: processos por status e encerramentos recentes por data.
- Relatorios: distribuicao por formato e por `tipo_relatorio`.
- Configuracoes do Sistema: parametros globais de vacuo retornados pela API.
- Tanques: tanques por status e comparativo de `vacuo_padrao`.
- Bombas: bombas por status e por `tipo_bomba`.

## Estados vazios

O componente `RealDataChartPanel` renderiza estado vazio quando nao ha dados ou quando todos os valores numericos sao zero. Isso evita graficos enganosos em telas ainda sem registros reais.

## Validacao recomendada

```powershell
cd react
npm run build
npm run lint
npm run dev -- --host
```

Verifique no navegador:

- Login com usuario real.
- Historico com processo finalizado.
- Geracao de relatorio pelo Historico.
- Pagina Relatorios com preview PDF e download PDF/XLSX.
- Graficos responsivos em desktop e mobile.
