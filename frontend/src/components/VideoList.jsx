import { useState, useEffect } from 'react';
import axios from 'axios';

function VideoList({ onSelectVideo, searchText, refreshVideos }) {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/videos/')
      .then(response => {
        setVideos(response.data);
      })
      .catch(error => {
        console.error("Erro ao buscar os vídeos:", error);
      });
  }, [refreshVideos]);

  const filteredVideos = videos.filter((video) => video.titulo.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <div>
      <h2>Vídeos Disponíveis</h2>
      {videos.length === 0 ? ( <p>A carregar vídeos...</p> ) : filteredVideos.length === 0 ? ( <p>Nenhum vídeo encontrado.</p>) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredVideos.map((video) => (
            <div
              key={video._id}
              onClick={() => onSelectVideo(video)}
              style={{display: 'flex', gap: '16px', padding: '12px', borderRadius: '12px', backgroundColor: 'white', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', alignItems: 'center'}}
            >
            <img
              src={video.thumbnail || 'https://via.placeholder.com/240x135?text=Video'}
              style={{ width: '240px', height: '135px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#ddd'}}
            />

            <div>
              <h3 style={{margin: '0 0 8px 0', fontSize: '20px',color: '#111'}}>
                {video.titulo}
              </h3>

              <p style={{margin: 0, color: '#666', fontSize: '14px'}}>
                Duração: {video.duracao_segundos} segundos
              </p>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

export default VideoList;