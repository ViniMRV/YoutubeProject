function ChannelPage({ user, onBack, onPostVideo }) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button
          onClick={onBack}
          style={{ marginBottom: '20px', backgroundColor: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#111', fontWeight: '600' }}
        >
          ← Voltar
        </button>
  
        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#111' }}>
            {user.nome}
          </h2>
  
          <p style={{ margin: '0 0 24px 0', color: '#666' }}>
            Canal do usuário
          </p>
  
          <button
            onClick={onPostVideo}
            style={{ backgroundColor: '#ff0000', color: 'white', border: 'none', borderRadius: '20px', padding: '10px 16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Postar vídeo
          </button>
        </div>
      </div>
    );
  }
  
  export default ChannelPage;
  