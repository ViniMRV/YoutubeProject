import { useState, useEffect } from 'react';
import axios from 'axios';

function VideoList({ onSelectVideo }) {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // Faz a chamada GET para o nosso backend FastAPI
    axios.get('http://localhost:8000/api/videos/')
      .then(response => {
        setVideos(response.data);
      })
      .catch(error => {
        console.error("Erro ao buscar os vídeos:", error);
      });
  }, []);

  return (
    <div>
      <h2>Vídeos Disponíveis</h2>
      {videos.length === 0 ? (
        <p>A carregar vídeos...</p>
      ) : (
        <ul>
          {videos.map((video) => (
            <li key={video._id} style={{ marginBottom: '10px' }}>
              <strong>{video.titulo}</strong>
              <button 
                onClick={() => onSelectVideo(video)} 
                style={{ marginLeft: '10px' }}
              >
                Assistir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default VideoList;