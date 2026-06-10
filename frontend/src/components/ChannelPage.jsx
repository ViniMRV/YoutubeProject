import { useState, useEffect } from 'react';
import axios from 'axios';

const TAB_STYLE_BASE = {
  padding: '10px 20px',
  border: 'none',
  borderBottom: '3px solid transparent',
  background: 'none',
  fontSize: '15px',
  fontWeight: '600',
  cursor: 'pointer',
  color: '#666',
};

const TAB_STYLE_ACTIVE = {
  ...TAB_STYLE_BASE,
  borderBottom: '3px solid #ff0000',
  color: '#111',
};

function ChannelPage({ user, onBack, onPostVideo, onSelectVideo, refreshVideos }) {
  const [activeTab, setActiveTab] = useState('videos');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get('http://localhost:8000/api/videos/', { params: { canal_id: user.nome } })
      .then((res) => setVideos(res.data))
      .catch((err) => console.error('Erro ao buscar vídeos do canal:', err))
      .finally(() => setLoading(false));
  }, [user.nome, refreshVideos]);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          marginBottom: '20px',
          backgroundColor: 'transparent',
          border: 'none',
          fontSize: '15px',
          cursor: 'pointer',
          color: '#111',
          fontWeight: '600',
        }}
      >
        ← Voltar
      </button>

      {/* Cabeçalho do canal */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          marginBottom: '8px',
        }}
      >
        <div style={{ height: '120px', backgroundColor: '#ff0000', opacity: 0.15 }} />

        <div
          style={{
            padding: '0 32px 24px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginTop: '-40px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#ff0000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white',
                fontWeight: 'bold',
                border: '4px solid white',
                flexShrink: 0,
              }}
            >
              {user.nome.charAt(0).toUpperCase()}
            </div>

            <div style={{ paddingBottom: '4px' }}>
              <h2 style={{ margin: '0 0 2px 0', fontSize: '26px', color: '#111' }}>
                {user.nome}
              </h2>
              <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                {videos.length} {videos.length === 1 ? 'vídeo' : 'vídeos'}
              </p>
            </div>
          </div>

          <button
            onClick={onPostVideo}
            style={{
              backgroundColor: '#ff0000',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '10px 20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '4px',
            }}
          >
            + Postar vídeo
          </button>
        </div>
      </div>

      {/* Abas */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '4px',
            borderBottom: '1px solid #eee',
            padding: '0 24px',
          }}
        >
          {['videos', 'playlists', 'historico'].map((tab) => {
            const labels = { videos: 'Vídeos', playlists: 'Playlists', historico: 'Histórico' };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={activeTab === tab ? TAB_STYLE_ACTIVE : TAB_STYLE_BASE}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '24px' }}>
          {activeTab === 'videos' && (
            <VideosTab videos={videos} loading={loading} onSelectVideo={onSelectVideo} />
          )}
          {activeTab === 'playlists' && (
            <PlaceholderTab mensagem="Playlists em breve." />
          )}
          {activeTab === 'historico' && (
            <PlaceholderTab mensagem="Histórico em breve." />
          )}
        </div>
      </div>
    </div>
  );
}

function VideosTab({ videos, loading, onSelectVideo }) {
  if (loading) {
    return <p style={{ color: '#666', textAlign: 'center' }}>Carregando vídeos...</p>;
  }

  if (videos.length === 0) {
    return (
      <p style={{ color: '#666', textAlign: 'center', padding: '32px 0' }}>
        Nenhum vídeo postado ainda.
      </p>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '20px',
      }}
    >
      {videos.map((video) => (
        <div
          key={video._id}
          onClick={() => onSelectVideo && onSelectVideo(video)}
          style={{
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            backgroundColor: '#fafafa',
            cursor: onSelectVideo ? 'pointer' : 'default',
          }}
        >
          <img
            src={video.thumbnail || 'https://via.placeholder.com/240x135?text=Video'}
            alt={video.titulo}
            style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
          />
          <div style={{ padding: '10px' }}>
            <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '14px', color: '#111' }}>
              {video.titulo}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
              {video.duracao_segundos}s
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PlaceholderTab({ mensagem }) {
  return (
    <p style={{ color: '#aaa', textAlign: 'center', padding: '32px 0', fontStyle: 'italic' }}>
      {mensagem}
    </p>
  );
}

export default ChannelPage;
