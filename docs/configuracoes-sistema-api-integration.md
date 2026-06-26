# Configuracoes do Sistema - Integracao Real

## Endpoints

- `GET /api/configuracoes/sistema`
- `PATCH /api/configuracoes/sistema`

## Permissoes

- `TECNICO`: pode ler e alterar.
- `ADMINISTRADOR`: pode ler e alterar.
- `OPERADOR`: nao acessa a rota no front e nao deve passar pelo backend.

## Campos

- `vacuo_padrao`
- `limite_seguranca_vacuo`
- `tolerancia_vacuo_percentual`
- `status_geral_sistema`

## Salvamento

O front envia apenas campos alterados e permitidos. Campos internos sao removidos do
payload:

- `id_configuracao_sistema`
- `id_usuario_alteracao`
- `criado_em`
- `atualizado_em`

## Estados

- `loading`
- `error`
- `saving`
- `success`
- `dirty`
- `forbidden`
- `not found`

## Pendencias

- Teste manual completo com API e banco ligados.
- Confirmar existencia de registro inicial em `configuracoessistema` no ambiente alvo.
