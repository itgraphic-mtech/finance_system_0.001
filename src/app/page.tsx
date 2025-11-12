export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #eff6ff, white)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 1rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '1rem',
          }}>
            Finance AR System
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#4b5563',
            marginBottom: '2rem',
          }}>
            Invoice and Accounts Receivable Report Management
          </p>
          <div>
            <a
              href="auth/login"
              className="btn-primary"
              style={{ display: 'inline-block' }}
            >
              เข้าสู่ระบบ
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
