# Tela de Usuarios - TSEA Frontend

## 1. Resumo da fase

A Fase Front 16 implementou a tela dedicada `/usuarios` para gestao administrativa de usuarios e
niveis de acesso.

## 2. Rota

- Rota: `/usuarios`.
- Perfis permitidos no front: `ADMINISTRADOR`.
- `OPERADOR` e `TECNICO` nao visualizam o item no menu e sao bloqueados pelo `RoleGuard`.

## 3. Dados consumidos

| Bloco | Service | Endpoint | Observacoes |
|---|---|---|---|
| Listagem | `usersService.listUsers` | `GET /user` | Resumo derivado da lista carregada. |
| Detalhe | `usersService.getUserById` | `GET /user/:id` | Service existe, mas a tela usa o item da lista para evitar request extra nesta fase. |
| Criacao | `usersService.createUser` | `POST /user` | Retorna `message`, `temporaryPassword` e `user`. |
| Edicao | `usersService.updateUser` | `PATCH /user/:id` | Atualiza `nome`, `login` e `email`. |
| Nivel de acesso | `usersService.updateUserRole` | `PATCH /user/:id/role` | Atualiza `id_nivel_acesso`. |
| Exclusao | `usersService.deleteUser` | `DELETE /user/:id` | Retorna mensagem de sucesso. |

## 4. Componentes criados

| Componente | Responsabilidade |
|---|---|
| `UsuariosListTable` | Lista usuarios e expoe acoes permitidas. |
| `UsuarioDetailPanel` | Mostra dados seguros do usuario selecionado. |
| `NovoUsuarioModal` | Cria usuario com validacao local simples. |
| `EditarUsuarioModal` | Edita dados permitidos pelo contrato. |
| `AlterarNivelAcessoModal` | Altera nivel de acesso com aviso para mudancas sensiveis. |
| `CredenciaisTemporariasModal` | Exibe e copia senha temporaria apenas apos criacao. |
| `ExcluirUsuarioModal` | Confirma exclusao digitando o login. |
| `NivelAcessoBadge` | Exibe perfil textual com cor auxiliar. |

## 5. Campos exibidos

| Campo | Listagem | Detalhe | Editavel | Observacoes |
|---|---|---|---|---|
| `id_usuario` | Nao | Sim | Nao | Somente identificacao interna. |
| `nome` | Sim | Sim | Sim | Obrigatorio nos formularios. |
| `login` | Sim, secundario | Sim | Sim | Obrigatorio e sem espacos. |
| `email` | Sim | Sim | Sim | Validacao basica de e-mail. |
| `niveisacessos.nome` | Sim | Sim | Via modal proprio | Normalizado para `NivelAcesso`. |
| `primeiro_acesso` | Sim | Sim | Nao | Apenas leitura. |
| `criado_em` | Nao | Sim | Nao | Se API retornar. |
| `atualizado_em` | Sim | Sim | Nao | Se API retornar. |

## 6. Criacao de usuario

- Implementada via `usersService.createUser`.
- Payload: `nome`, `login`, `email`, `id_nivel_acesso`.
- A API gera a senha temporaria automaticamente.
- O usuario criado retorna com `primeiro_acesso: true`.
- Se `temporaryPassword` vier na resposta, ela aparece no modal de credenciais.

## 7. Credenciais temporarias

- Exibidas somente apos criacao bem-sucedida.
- Copia usa `navigator.clipboard.writeText`.
- Se clipboard falhar, a interface permite selecao manual.
- Ao fechar o modal, o estado local e limpo.
- Nao sao persistidas em storage, contexto global ou logs.

## 8. Edicao de usuario

- Implementada via `usersService.updateUser`.
- Campos permitidos: `nome`, `login`, `email`.
- Senha atual, hash e token nao sao exibidos nem enviados.

## 9. Alteracao de nivel de acesso

- Implementada via `usersService.updateUserRole`.
- Niveis:
  - `OPERADOR` = `1`;
  - `TECNICO` = `2`;
  - `ADMINISTRADOR` = `3`.
- Mudancas envolvendo `ADMINISTRADOR` exibem aviso visual.

## 10. Exclusao/remocao

- Implementada via `usersService.deleteUser`.
- Exige confirmacao digitando o login.
- A interface bloqueia exclusao do proprio usuario autenticado.
- O backend permanece como fonte final de validacao.

## 11. Permissoes visuais

| Perfil | Visualizar | Criar | Editar | Alterar nivel | Excluir |
|---|---|---|---|---|---|
| OPERADOR | Nao | Nao | Nao | Nao | Nao |
| TECNICO | Nao | Nao | Nao | Nao | Nao |
| ADMINISTRADOR | Sim | Sim | Sim | Sim | Sim |

## 12. Tratamento de erro

- `400`: dados invalidos.
- `401`: sessao expirada ou usuario nao autenticado.
- `403`: sem permissao para gerenciar usuarios.
- `404`: usuario nao encontrado.
- `409`: login/e-mail ja cadastrado ou conflito de regra.
- `500`: erro inesperado ao processar usuario.

## 13. Estados visuais

- Loading inicial.
- Erro ao carregar.
- Empty state sem usuarios.
- Criando usuario.
- Editando usuario.
- Alterando nivel.
- Excluindo usuario.
- Sucesso por feedback inline.
- Erro por feedback inline.
- Credenciais temporarias exibidas.
- Acesso negado.

## 14. O que NAO foi implementado nesta fase

- Reset manual de senha.
- Esqueci senha.
- Login como usuario.
- Importacao/exportacao.
- CSV.
- Logs/auditoria.
- Alteracao de senha atual.
- Exposicao de hash, token ou senha atual.

## 15. Pendencias para Fase Front 17

- Revisao final de navegacao e permissoes.
- Validar menus por perfil.
- Validar rotas protegidas.
- Validar botoes por perfil.
- Validar redirecionamentos.
- Validar tratamento real de `403`.
- Validar fluxo completo por `OPERADOR`, `TECNICO` e `ADMINISTRADOR` com API rodando.
