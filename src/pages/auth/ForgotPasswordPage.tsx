import type { CSSProperties } from 'react';
import { Info, UserRound } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { authService } from '../../services/auth.service';
import { getAuthErrorMessage } from '../../utils/authErrors';
import styles from './AuthPages.module.scss';

const forgotPasswordSchema = z.object({
  login: z.string().min(1, 'Informe o login.'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const feedbackStyle = {
  margin: 0,
  color: '#ff8b98',
  fontSize: '0.82rem',
  lineHeight: 1.45,
} satisfies CSSProperties;

const successStyle = {
  ...feedbackStyle,
  color: '#35d99a',
} satisfies CSSProperties;

export function ForgotPasswordPage() {
  const {
    control,
    formState: { errors, isSubmitSuccessful, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      login: '',
    },
  });

  async function onSubmit(data: ForgotPasswordFormData): Promise<void> {
    try {
      await authService.forgotPassword(data);
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
          title="Recuperação de senha"
          description="Informe seu login para iniciar a recuperação de acesso."
        />

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            control={control}
            name="login"
            render={({ field }) => (
              <AuthInput
                id="recovery-login"
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

          <div className={styles.infoBox}>
            <Info size={18} aria-hidden="true" />
            <span>A API localizará o e-mail vinculado ao login informado e enviará a recuperação.</span>
          </div>

          {isSubmitSuccessful && !errors.root?.message ? (
            <p style={successStyle}>
              Se existir uma conta vinculada aos dados informados, uma recuperação foi enviada.
            </p>
          ) : null}
          {errors.root?.message ? <p style={feedbackStyle}>{errors.root.message}</p> : null}

          <div className={styles.actions}>
            <AuthButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar recuperação'}
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
