import { useAuth } from '../../hooks/useAuth';

const pageStyle = {
  display: 'grid',
  minHeight: '100vh',
  placeItems: 'center',
  padding: '24px',
  background: '#050a12',
  color: '#f5f9ff',
} satisfies React.CSSProperties;

const panelStyle = {
  width: 'min(100%, 520px)',
  padding: '32px',
  border: '1px solid rgba(122, 185, 244, 0.2)',
  borderRadius: '8px',
  background: 'linear-gradient(180deg, rgba(13, 30, 49, 0.94), rgba(7, 15, 27, 0.96))',
  boxShadow: '0 24px 70px rgba(0, 0, 0, 0.44)',
  textAlign: 'center',
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: '2rem',
  lineHeight: 1.1,
} satisfies React.CSSProperties;

const textStyle = {
  margin: '14px 0 26px',
  color: '#9cb4cf',
  lineHeight: 1.6,
} satisfies React.CSSProperties;

const buttonStyle = {
  minHeight: '44px',
  padding: '0 22px',
  borderRadius: '7px',
  background: 'linear-gradient(180deg, rgba(83, 197, 255, 0.98), rgba(22, 119, 230, 0.98))',
  color: '#03111e',
  cursor: 'pointer',
  fontWeight: 800,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
} satisfies React.CSSProperties;

export function DashboardPage() {
  const { logout } = useAuth();

  return (
    <main style={pageStyle}>
      <section style={panelStyle}>
        <h1 style={titleStyle}>Dashboard TSEA</h1>
        <p style={textStyle}>Redirecionamento autenticado funcionando</p>
        <button style={buttonStyle} type="button" onClick={logout}>
          Sair
        </button>
      </section>
    </main>
  );
}
