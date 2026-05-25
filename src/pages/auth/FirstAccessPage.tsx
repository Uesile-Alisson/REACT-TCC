import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { PasswordStrengthIndicator } from '../../components/auth/PasswordStrengthIndicator';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import { getAuthErrorMessage } from '../../utils/authErrors';
import styles from './AuthPages.module.scss';

const passwordSchema = z
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

type FirstAccessFormData = z.infer<typeof passwordSchema>;

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

export function FirstAccessPage() {
  const navigate = useNavigate();
  const { completeFirstAccess } = useAuth();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<FirstAccessFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      senhaNova: '',
      confirmarSenha: '',
    },
  });
  const password = useWatch({ control, name: 'senhaNova' }) ?? '';

  async function onSubmit(data: FirstAccessFormData): Promise<void> {
    try {
      const response = await authService.firstAccess({
        senhaTemporaria: '',
        senhaNova: data.senhaNova,
        confirmarSenha: data.confirmarSenha,
      });

      completeFirstAccess();
      setError('root', { type: 'success', message: response.message });
      window.setTimeout(() => navigate('/dashboard', { replace: true }), 800);
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
          title="Primeiro acesso"
          description="Defina uma senha de entrada para liberar o uso do sistema."
        />

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            control={control}
            name="senhaNova"
            render={({ field }) => (
              <PasswordInput
                id="new-password"
                label="Nova senha"
                value={field.value}
                placeholder="Crie uma senha"
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
                id="confirm-new-password"
                label="Confirmar nova senha"
                value={field.value}
                placeholder="Repita a senha"
                onChange={field.onChange}
              />
            )}
          />
          {errors.confirmarSenha?.message ? (
            <p style={feedbackStyle}>{errors.confirmarSenha.message}</p>
          ) : null}

          <PasswordStrengthIndicator password={password} />
          {errors.root?.message ? (
            <p style={errors.root.type === 'success' ? successStyle : feedbackStyle}>
              {errors.root.message}
            </p>
          ) : null}

          <div className={styles.actions}>
            <AuthButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Alterando...' : 'Alterar senha'}
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
