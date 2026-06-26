# Integracao Frontend Auth Me

## Objetivo

Esta correcao integra o frontend do TSEA ao endpoint autenticado `GET /auth/me`, mantendo a arquitetura existente de Axios, services, Context API, rotas privadas e realtime.

## Contrato Usado

O frontend espera que `GET /auth/me` retorne o usuario autenticado com a seguinte estrutura:

```ts
{
  id_usuario: number;
  nome: string;
  login: string;
  email?: string | null;
  id_nivel_acesso: number;
  nivel_acesso: 'OPERADOR' | 'TECNICO' | 'ADMINISTRADOR';
  primeiro_acesso: boolean;
}
```

O `baseURL` continua vindo de `VITE_API_BASE_URL` ou `VITE_API_URL`, com fallback para `http://localhost:3000/api`. Por isso o service chama apenas `/auth/me`, sem duplicar `/api`.

## Arquivos Ajustados

- `src/types/auth.types.ts`: adiciona o tipo `AuthMeResponse` e prepara `AuthUser` para armazenar `id_nivel_acesso`.
- `src/services/auth.service.ts`: adiciona `me()` usando a instancia Axios compartilhada e reutiliza o normalizador de usuario.
- `src/contexts/AuthContext.tsx`: hidrata a sessao inicial chamando `authService.me()` quando existe `access_token` salvo.
- `src/routes/RoleGuard.tsx`: respeita `isLoading` antes de avaliar permissao.
- `src/contexts/realtime/RealtimeProvider.tsx`: aguarda usuario hidratado antes de conectar ao Socket.IO.

## Fluxo de Inicializacao

1. Sem `access_token` salvo:
   - `user` fica `null`;
   - `accessToken` fica `null`;
   - `isAuthenticated` fica `false`;
   - `isLoading` fica `false`.

2. Com `access_token` salvo:
   - `isLoading` inicia como `true`;
   - o frontend chama `GET /auth/me`;
   - em sucesso, preenche `user`, preserva `accessToken` e libera as rotas;
   - em erro, limpa a sessao local de forma previsivel.

## Comportamento em 401

O interceptor Axios existente continua normalizando erros e disparando o evento de sessao nao autorizada em respostas `401`. O `AuthProvider` escuta esse evento, remove o `access_token`, limpa usuario e encerra o carregamento.

Nao foi implementado refresh token, retry automatico ou logout com navegacao imperativa nesta etapa.

## Realtime

O `RealtimeProvider` agora conecta somente quando:

- `isLoading` e `false`;
- existe `accessToken`;
- `isAuthenticated` e `true`;
- `user` ja foi hidratado.

Isso evita conexao prematura com token salvo, mas sem usuario validado pelo backend.
