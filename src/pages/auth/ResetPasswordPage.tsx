import type { CSSProperties } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { PasswordStrengthIndicator } from '../../components/auth/PasswordStrengthIndicator';
import { authService } from '../../services/auth.service';
import { getAuthErrorMessage } from '../../utils/authErrors';
import styles from './AuthPages.module.scss';

const resetPasswordSchema = z
  .object({
    senhaNova: z
      .string()
      .min(1, 'Informe a nova senha.')
      .min(6, 'A senha deve ter no mínimo 6 caracteres.')
      .regex(/[A-Z]/, 'A senha deve conter pelo menos 1 letra maiúscula.')
      .regex(/\d/, 'A senha deve conter pelo menos 1 número.')
      .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos 1 caractere especial.'),
    confirmarSenha: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((data) => data.senhaNova === data.confirmarSenha, {
    message: 'As senhas precisam coincidir.',
    path: ['confirmarSenha'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

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

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      senhaNova: '',
      confirmarSenha: '',
    },
  });
  const password = useWatch({ control, name: 'senhaNova' }) ?? '';

  async function onSubmit(data: ResetPasswordFormData): Promise<void> {
    if (!token) {
      setError('root', {
        message: 'Token de redefinição não encontrado. Solicite uma nova recuperação.',
      });
      return;
    }

    try {
      const response = await authService.resetPassword({
        token,
        senhaNova: data.senhaNova,
        confirmarSenha: data.confirmarSenha,
      });

      setError('root', { type: 'success', message: response.message });
      window.setTimeout(() => navigate('/login', { replace: true }), 1000);
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
          title="Redefinir senha"
          description="Cadastre uma nova senha para recuperar o acesso ao TSEA."
        />

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            control={control}
            name="senhaNova"
            render={({ field }) => (
              <PasswordInput
                id="reset-password"
                label="Nova senha"
                value={field.value}
                placeholder="Digite a nova senha"
                onChange={field.onChange}
              />
            )}
          />
          {errors.senhaNova?.message ? <p style={feedbackStyle}>{errors.senhaNova.message}</p> : null}

          <Controller
            control={control}
            name="confirmarSenha"
            render={({ field }) => (
              <PasswordInput
                id="confirm-reset-password"
                label="Confirmar nova senha"
                value={field.value}
                placeholder="Repita a nova senha"
                onChange={field.onChange}
              />
            )}
          />
          {errors.confirmarSenha?.message ? (
            <p style={feedbackStyle}>{errors.confirmarSenha.message}</p>
          ) : null}

          <PasswordStrengthIndicator password={password} />
          {!token ? (
            <p style={feedbackStyle}>
              Token de redefinição ausente. Use o link enviado pela recuperação de senha.
            </p>
          ) : null}
          {errors.root?.message ? (
            <p style={errors.root.type === 'success' ? successStyle : feedbackStyle}>
              {errors.root.message}
            </p>
          ) : null}

          <div className={styles.actions}>
            <AuthButton type="submit" disabled={isSubmitting || !token}>
              {isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
