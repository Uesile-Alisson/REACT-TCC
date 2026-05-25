import styles from './AuthHeader.module.scss';

type AuthHeaderProps = {
  title: string;
  description: string;
};

export function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <header className={styles.header}>
      <span>Secure Access</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}
