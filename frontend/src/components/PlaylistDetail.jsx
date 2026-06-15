import { useState, useEffect } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';

const API_BASE_URL = 'http://localhost:8000/api';

function PlaylistDetail({ playlist, userId, onBack }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoAtual, setVideoAtual] = useState(null);
  const [allVideos, setAllVideos] = useState([]);
  const [showAddVideo, setShowAddVideo] = useState(false);

  useEffect(() => {
    loadPlaylistVideos();
    loadAllVideos();
  }, [playlist]);

  const loadPlaylistVideos = async () => {
    try {
      setLoading(true);
      // Busca os IDs dos vídeos da playlist
      const playlistResponse = await axios.get(`${API_BASE_URL}/playlists/${playlist.id}`);
      
      // Busca os dados completos de cada vídeo
      if (playlistResponse.data.videos && playlistResponse.data.videos.length > 0) {
        const videoPromises = playlistResponse.data.videos.map(videoId =>
          axios.get(`${API_BASE_URL}/videos/`).then(res => 
            res.data.find(v => v.id === videoId || v._id === videoId)
          )
        );
        const videosData = await Promise.all(videoPromises);
        setVideos(videosData.filter(v => v));
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar vídeos da playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllVideos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/videos/`);
      setAllVideos(response.data);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
    }
  };

  const handleAddVideoToPlaylist = async (videoId) => {
    try {
      await axios.post(`${API_BASE_URL}/playlists/${playlist.id}/videos/${videoId}`);
      alert('Vídeo adicionado à playlist!');
      setShowAddVideo(false);
      loadPlaylistVideos();
    } catch (error) {
      console.error('Erro ao adicionar vídeo:', error);
      alert('Erro ao adicionar vídeo');
    }
  };

  const handleRemoveVideoFromPlaylist = async (videoId) => {
    if (!window.confirm('Remover este vídeo da playlist?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/playlists/${playlist.id}/videos/${videoId}`);
      setVideos(videos.filter(v => v.id !== videoId && v._id !== videoId));
      alert('Vídeo removido da playlist!');
    } catch (error) {
      console.error('Erro ao remover vídeo:', error);
      alert('Erro ao remover vídeo');
    }
  };

  const getVideoId = (video) => video.id || video._id;

  const availableVideos = allVideos.filter(v => 
    !videos.find(pv => getVideoId(pv) === getVideoId(v))
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <button
            onClick={onBack}
            style={{
              backgroundColor: '#999',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginRight: '16px'
            }}
          >
            ← Voltar
          </button>
          <h2 style={{ display: 'inline', margin: 0, color: '#333' }}>{playlist.nome}</h2>
        </div>
        <button
          onClick={() => setShowAddVideo(!showAddVideo)}
          style={{
            backgroundColor: '#ff0000',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          + Adicionar Vídeo
        </button>
      </div>

      {playlist.descricao && (
        <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
          {playlist.descricao}
        </p>
      )}

      {showAddVideo && availableVideos.length > 0 && (
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #ddd'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Selecione um vídeo para adicionar</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {availableVideos.map((video) => (
              <div
                key={getVideoId(video)}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer'
                }}
              >
                {video.thumbnail && (
                  <img
                    src={video.thumbnail}
                    alt={video.titulo}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginBottom: '8px'
                    }}
                  />
                )}
                <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '14px', wordBreak: 'break-word' }}>
                  {video.titulo}
                </h4>
                <button
                  onClick={() => handleAddVideoToPlaylist(getVideoId(video))}
                  style={{
                    width: '100%',
                    backgroundColor: '#ff0000',
                    color: 'white',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  Adicionar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {videoAtual && (
        <div style={{ marginBottom: '24px' }}>
          <VideoPlayer video={videoAtual} onClose={() => setVideoAtual(null)} />
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Carregando...</p>
      ) : videos.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', fontSize: '16px', marginTop: '32px' }}>
          Nenhum vídeo nesta playlist. Adicione vídeos para começar!
        </p>
      ) : (
        <div>
          <h3 style={{ margin: '24px 0 16px 0', color: '#333' }}>
            Vídeos da Playlist ({videos.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {videos.map((video) => (
              <div
                key={getVideoId(video)}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {video.thumbnail && (
                  <img
                    src={video.thumbnail}
                    alt={video.titulo}
                    style={{
                      width: '100%',
                      height: '160px',
                      objectFit: 'cover'
                    }}
                  />
                )}
                <div style={{ padding: '12px' }}>
                  <h4
                    onClick={() => setVideoAtual(video)}
                    style={{
                      margin: '0 0 8px 0',
                      color: '#333',
                      fontSize: '16px',
                      wordBreak: 'break-word',
                      cursor: 'pointer'
                    }}
                  >
                    {video.titulo}
                  </h4>
                  <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '12px' }}>
                    {video.duracao_segundos > 60
                      ? `${Math.floor(video.duracao_segundos / 60)}:${String(video.duracao_segundos % 60).padStart(2, '0')}`
                      : `${video.duracao_segundos}s`}
                  </p>
                  <button
                    onClick={() => handleRemoveVideoFromPlaylist(getVideoId(video))}
                    style={{
                      width: '100%',
                      backgroundColor: '#d32f2f',
                      color: 'white',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaylistDetail;
