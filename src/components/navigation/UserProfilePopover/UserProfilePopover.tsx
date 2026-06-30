import { useEffect, useId, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock3, KeyRound, LogOut, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AuthUser, NivelAcesso } from '../../../types';
import styles from './UserProfilePopover.module.scss';

type UserProfilePopoverProps = {
  user: AuthUser | null;
  onLogout: () => void;
};

const PROFILE_LABELS: Record<NivelAcesso, string> = {
  ADMINISTRADOR: 'Administrador',
  TECNICO: 'Tecnico',
  OPERADOR: 'Operador',
};

function getUserInitials(user: AuthUser | null): string {
  if (!user) {
    return 'TS';
  }

  const initials = user.nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return initials || user.login.slice(0, 2).toUpperCase();
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return 'Indisponivel';
  }

  return new Date(value).toLocaleString('pt-BR');
}

function formatBoolean(value: boolean | undefined): string {
  if (value === undefined) {
    return 'Indisponivel';
  }

  return value ? 'Pendente' : 'Concluido';
}

export function UserProfilePopover({ user, onLogout }: UserProfilePopoverProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const popoverId = useId();
  const navigate = useNavigate();
  const initials = useMemo(() => getUserInitials(user), [user]);
  const profileLabel = user ? PROFILE_LABELS[user.nivel_acesso] : 'Sessao';

  function closePopover(returnFocus = true): void {
    setIsOpen(false);

    if (returnFocus) {
      window.requestAnimationFrame(() => buttonRef.current?.focus());
    }
  }

  function handleLogout(): void {
    closePopover(false);
    try {
      onLogout();
    } finally {
      window.setTimeout(() => navigate('/login', { replace: true }), 0);
    }
  }

  function handleLogoutMouseDown(event: ReactMouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
    handleLogout();
  }

  function handlePasswordRecovery(): void {
    if (!user) {
      return;
    }

    closePopover(false);
    try {
      onLogout();
    } finally {
      window.setTimeout(
        () =>
          navigate('/forgot-password', {
            state: {
              login: user.login,
            },
          }),
        0,
      );
    }
  }

  function handlePasswordRecoveryMouseDown(event: ReactMouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
    handlePasswordRecovery();
  }

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleDocumentClick = (event: MouseEvent): void => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (buttonRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }

      closePopover(false);
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closePopover();
      }
    };

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={styles.profileRoot}>
      <motion.button
        ref={buttonRef}
        type="button"
        className={styles.profileChip}
        aria-label="Abrir minha conta"
        aria-controls={popoverId}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
      >
        <span className={styles.avatar} aria-hidden="true">
          {initials}
        </span>
        <span className={styles.identity}>
          <strong>{user?.nome ?? 'Usuario TSEA'}</strong>
          <small>{profileLabel}</small>
        </span>
      </motion.button>

      {isOpen ? (
        <motion.div
          ref={popoverRef}
          id={popoverId}
          className={styles.popover}
          role="dialog"
          aria-label="Minha conta"
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className={styles.popoverHeader}>
            <span className={styles.largeAvatar} aria-hidden="true">
              {initials}
            </span>
            <div>
              <p>Minha conta</p>
              <h2>{user?.nome ?? 'Usuario autenticado'}</h2>
              <span className={`${styles.roleBadge} ${user ? styles[user.nivel_acesso.toLowerCase()] : ''}`}>
                <ShieldCheck size={14} aria-hidden="true" />
                {profileLabel}
              </span>
            </div>
          </header>

          <dl className={styles.details}>
            <div>
              <dt>
                <UserRound size={14} aria-hidden="true" />
                Login
              </dt>
              <dd>{user?.login ?? 'Indisponivel'}</dd>
            </div>
            <div>
              <dt>
                <Mail size={14} aria-hidden="true" />
                Email
              </dt>
              <dd>{user?.email || 'Indisponivel'}</dd>
            </div>
            <div>
              <dt>
                <Clock3 size={14} aria-hidden="true" />
                Ultimo acesso
              </dt>
              <dd>{formatDateTime(user?.ultimo_acesso)}</dd>
            </div>
            <div>
              <dt>
                <ShieldCheck size={14} aria-hidden="true" />
                Primeiro acesso
              </dt>
              <dd>{formatBoolean(user?.primeiro_acesso)}</dd>
            </div>
            <div>
              <dt>
                <CalendarDays size={14} aria-hidden="true" />
                Criado em
              </dt>
              <dd>{formatDateTime(user?.criado_em)}</dd>
            </div>
          </dl>

          <div className={styles.actions}>
            {user ? (
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={handlePasswordRecovery}
                onMouseDown={handlePasswordRecoveryMouseDown}
              >
                <KeyRound size={15} aria-hidden="true" />
                Redefinir senha
              </button>
            ) : null}
            <button
              type="button"
              className={styles.logoutAction}
              onClick={handleLogout}
              onMouseDown={handleLogoutMouseDown}
            >
              <LogOut size={15} aria-hidden="true" />
              Sair
            </button>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
