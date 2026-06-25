# Integracao de Arquivos de Relatorios - TSEA Frontend

## 1. Resumo da fase

A Fase Front 5 preparou a infraestrutura segura para preview PDF e download PDF/XLSX de relatorios usando Blob/File, headers HTTP, filename sanitizado e limpeza de object URLs.

A integracao visual completa nao foi conectada porque o projeto ainda nao possui pagina dedicada de Relatorios. Conforme a regra da fase, nao foi criada uma pagina completa do zero. A Dashboard existente apenas exibe contagem de relatorios por HTTP.

API real nao executada nesta fase; preview/download foram integrados por contrato e services.

## 2. Rotas usadas

| Acao | Metodo | Rota | Content-Type | Observacoes |
|---|---|---|---|---|
| Preview PDF | GET | `/relatorios/:id_relatorio/preview` | `application/pdf` | Retorna Blob inline. |
| Download PDF/XLSX | GET | `/relatorios/:id_relatorio/download` | `application/pdf` ou XLSX | Retorna Blob attachment. |

## 3. Services usados

- `previewRelatorio(idRelatorio)` em `src/services/relatorios.service.ts`.
- `downloadRelatorio(idRelatorio)` em `src/services/relatorios.service.ts`.
- Ambos usam Axios com `responseType: 'blob'`.
- Ambos retornam `ApiFileResponse` com `blob`, `filename`, `contentType`, `contentDisposition` e `contentLength`.

## 4. Utilitarios criados

- Content-Disposition: `src/utils/files/content-disposition.ts`.
- Download Blob: `src/utils/files/download-file.ts`.
- Object URL: `src/utils/files/object-url.ts`.

O parser suporta:

- `filename="arquivo.pdf"`;
- `filename=arquivo.pdf`;
- `filename*=UTF-8''arquivo%20teste.pdf`.

O filename e sanitizado para evitar `/`, `\`, `..` e caracteres invalidos.

## 5. Preview PDF

- Hook preparado: `src/hooks/useRelatorioPreview.ts`.
- Valida PDF antes de chamar o service.
- Cria object URL com `URL.createObjectURL`.
- Revoga URL anterior antes de abrir novo preview.
- Revoga URL no fechamento/desmontagem.
- Nao abre XLSX em preview.

Limitacao: nao foi criado modal visual porque nao existe pagina de Relatorios para consumir o hook.

## 6. Download PDF/XLSX

- Hook preparado: `src/hooks/useRelatorioDownload.ts`.
- Chama `downloadRelatorio`.
- Extrai filename do `Content-Disposition`.
- Usa fallback seguro quando header nao traz filename.
- Cria link temporario, dispara clique, remove o link e revoga object URL em `finally`.
- Nao usa base64.
- Nao persiste Blob.

## 7. Permissoes aplicadas

| Perfil | Preview | Download |
|---|---|---|
| OPERADOR | Sim, para PDF | Nao |
| TECNICO | Sim, para PDF | Sim, PDF/XLSX conforme tipo |
| ADMINISTRADOR | Sim, para PDF | Sim, PDF/XLSX conforme tipo |

Regras preparadas:

- XLSX nao tem preview.
- Relatorio de alarme nao permite XLSX.
- CSV nao existe.

## 8. Tratamento de erro

- Erros sao convertidos por `getAuthErrorMessage`.
- `403` deve exibir mensagem de permissao quando retornado pela API.
- `404` deve ser exibido como arquivo/relatorio nao encontrado quando retornado pela API.
- Erro de Blob JSON ainda depende do interceptor central para tratamento mais refinado.

## 9. Cuidados de seguranca

- Sem base64.
- Sem localStorage/sessionStorage para Blob.
- Sem exposicao de headers internos na UI.
- Filename sanitizado.
- `URL.revokeObjectURL` aplicado no download e no preview.
- Sem backend alterado.
- Sem Socket.IO.
- Sem MQTT/ESP32.

## 10. Pendencias para Fase Front 6

- Criar pagina dedicada de Relatorios ou integrar quando ela existir.
- Criar modal visual de preview PDF.
- Loading skeleton.
- Estados vazios melhores.
- Responsividade refinada.
- Acessibilidade do modal.
- Mensagens de erro mais especificas.
- Refinamento visual de permissoes.

## Bloqueio principal

`Pagina de Relatorios ainda nao possui listagem real; preview/download nao foram integrados a UI completa.`
