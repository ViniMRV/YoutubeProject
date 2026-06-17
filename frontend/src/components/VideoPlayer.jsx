import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

// Converte qualquer URL do YouTube para a URL de embed
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  // Formato: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  // Já é uma URL de embed
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  return null;
}

function VideoPlayer({ video, onBack, onSelectVideo }) {
  const videoRef = useRef(null);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/videos/')
      .then(response => {
        setVideos(response.data);
      })
      .catch(error => {
        console.error("Erro ao buscar os vídeos:", error);
      });
  }, []);

  const otherVideos = videos.filter((item) => item._id !== video._id);

  return (
    <div style={{ marginTop: '20px' }}>
      <button
        onClick={onBack}
        style={{ marginBottom: '20px', backgroundColor: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#111', fontWeight: '600'}}
      >
        ← Voltar
      </button>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ width: '100%' }}>
          <div
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              backgroundColor: 'black',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {getYouTubeEmbedUrl(video.url) ? (
              <iframe
                src={getYouTubeEmbedUrl(video.url)}
                title={video.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                }}
              />
            ) : (
              <video
                ref={videoRef}
                src={video.url}
                controls
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  backgroundColor: 'black',
                }}
              >
                Seu navegador não suporta a tag de vídeo.
              </video>
            )}
          </div>

          <h2 style={{ marginTop: '16px', fontSize: '28px', color: '#111' }}>
            {video.titulo}
          </h2>
        </div>

        <aside style={{ width: '360px', minWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {otherVideos.map((item) => (
            <div
              key={item._id}
              onClick={() => onSelectVideo(item)}
              style={{ display: 'flex', gap: '10px', cursor: 'pointer', backgroundColor: 'white', padding: '8px', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
            >
              <img
                src={item.thumbnail || 'https://via.placeholder.com/160x90?text=Video'}
                style={{ width: '140px', minWidth: '140px', height: '80px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#ddd' }}
              />

              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#111' }}>
                  {item.titulo}
                </h4>

                <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
                  {item.duracao_segundos} segundos
                </p>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

export default VideoPlayer;