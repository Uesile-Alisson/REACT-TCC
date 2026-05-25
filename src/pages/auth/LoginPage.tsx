import type { CSSProperties } from 'react';
import { UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { useAuth } from '../../hooks/useAuth';
import { getAuthErrorMessage } from '../../utils/authErrors';
import styles from './AuthPages.module.scss';

const loginSchema = z.object({
  login: z.string().min(1, 'Informe o login.'),
  senha: z.string().min(1, 'Informe a senha.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const feedbackStyle = {
  margin: 0,
  color: '#ff8b98',
  fontSize: '0.82rem',
  lineHeight: 1.45,
} satisfies CSSProperties;

export function LoginPage() {
  const navigate = useNavigate();
  const { signin } = useAuth();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: '',
      senha: '',
    },
  });

  async function onSubmit(data: LoginFormData): Promise<void> {
    try {
      const result = await signin(data);

      navigate(result.suggestedRedirectPath, { replace: true });
    } catch (error: unknown) {
      setError('root', {
        message: getAuthErrorMessage(error),
      });
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Acesso operacional"
          description="Entre com suas credenciais para acessar o painel TSEA."
        />

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            control={control}
            name="login"
            render={({ field }) => (
              <AuthInput
                id="login"
                label="Login"
                type="text"
                value={field.value}
                placeholder="usuario.operador"
                autoComplete="username"
                icon={<UserRound size={18} aria-hidden="true" />}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
            )}
          />
          {errors.login?.message ? <p style={feedbackStyle}>{errors.login.message}</p> : null}

          <Controller
            control={control}
            name="senha"
            render={({ field }) => (
              <PasswordInput
                id="password"
                label="Senha"
                value={field.value}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                onChange={field.onChange}
              />
            )}
          />
          {errors.senha?.message ? <p style={feedbackStyle}>{errors.senha.message}</p> : null}
          {errors.root?.message ? <p style={feedbackStyle}>{errors.root.message}</p> : null}

          <div className={styles.actions}>
            <AuthButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </AuthButton>

            <div className={styles.linkRow}>
              <Link className={styles.textLink} to="/forgot-password">
                Esqueci minha senha
              </Link>
            </div>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
