# Fase Front 12 - Tela dedicada de Relatorios

## Escopo entregue

A rota `/relatorios` deixou de usar placeholder e passou a ter uma tela operacional dedicada para consulta, geracao, preview e download de relatorios do TSEA. A implementacao usa apenas a API existente, services centralizados e hooks locais da camada React.

## Arquivos principais

- `src/pages/relatorios/RelatoriosPage.tsx`
- `src/pages/relatorios/RelatoriosPage.module.scss`
- `src/hooks/useRelatoriosPage.ts`
- `src/hooks/useRelatoriosPermissions.ts`
- `src/hooks/useGerarRelatorio.ts`
- `src/components/relatorios/*`
- `src/types/relatorios-ui.types.ts`
- `src/services/relatorios.service.ts`

## Services usados

- `listRelatorios(query)` para listagem paginada e filtrada.
- `getRelatorioById(idRelatorio)` para detalhe/metadados.
- `generateProcessReport(idProcesso, payload)` para relatorio de processo.
- `generateAlarmReport(idAlarme, payload)` para relatorio de alarme.
- `previewRelatorio(idRelatorio)` para preview em PDF.
- `downloadRelatorio(idRelatorio)` para download de arquivo permitido.

Nenhuma pagina usa Axios diretamente.

## Tipos e formatos

Tipos de relatorio:

- `PROCESSO`
- `ALARME`

Formatos:

- `PDF`
- `XLSX`

Relatorio de processo aceita PDF e XLSX. Relatorio de alarme aceita PDF.

## Permissoes

`OPERADOR`:

- lista relatorios;
- visualiza metadados;
- abre preview PDF quando autorizado pela API;
- nao gera relatorio;
- nao faz download.

`TECNICO` e `ADMINISTRADOR`:

- lista relatorios;
- visualiza metadados;
- abre preview PDF;
- gera relatorio;
- faz download nos formatos permitidos.

As regras ficam centralizadas em `useRelatoriosPermissions`.

## Geração

O modal `GerarRelatorioModal` permite escolher:

- relatorio de processo por `id_processo`;
- relatorio de alarme por `id_alarme`;
- formato PDF;
- formato XLSX apenas para processo;
- observacao opcional.

A geracao usa `useGerarRelatorio` e atualiza a listagem apos sucesso.

## Preview

O preview usa `useRelatorioPreview`, `previewRelatorio` e `URL.createObjectURL`.

O preview e restrito a PDF. A URL temporaria e revogada ao fechar o modal ou desmontar o componente.

## Download

O download usa `useRelatorioDownload`, `downloadRelatorio` e `downloadBlobFile`.

O nome de arquivo vem de `Content-Disposition` quando disponivel; quando nao vier, o hook cria um nome tecnico de fallback.

## Tratamento Blob

`relatorios.service.ts` valida o `content-type` recebido nos endpoints de arquivo. Se a API retornar JSON, texto ou HTML no lugar de um arquivo, o service transforma a resposta em `ApiError` e evita que o front baixe uma mensagem de erro como arquivo.

## Estados visuais

A tela possui:

- loading de listagem;
- loading de detalhe;
- loading de geracao;
- loading de download;
- empty state;
- mensagens de erro;
- mensagens de sucesso;
- aviso de perfil em modo leitura;
- painel lateral de metadados.

## Cuidados mantidos

- Sem acesso direto a MongoDB, GridFS ou armazenamento interno.
- Sem upload.
- Sem edicao de relatorio.
- Sem exclusao de relatorio.
- Sem reprocessamento/regeneracao de arquivo existente.
- Sem alterar rotas globais.
- Sem alterar SCSS global.
- Sem novas dependencias.

## Pendencias para fases futuras

- Confirmar nomes finais de campos extras vindos da API para enriquecer metadados.
- Adicionar testes automatizados de interacao quando a suite estiver definida.
- Conectar notificacoes em tempo real de geracao quando o backend expuser eventos especificos de relatorio.
