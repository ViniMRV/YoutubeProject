import { useRef } from 'react';

function VideoPlayer({ video, onBack }) {
  // O useRef vai nos permitir acessar os métodos nativos do elemento de vídeo 
  // para depois implementarmos os botões de avançar/voltar do seu diagrama
  const videoRef = useRef(null);

  return (
    <div style={{ marginTop: '20px' }}>
      <button onClick={onBack} style={{ marginBottom: '15px' }}>
        ← Voltar para a lista
      </button>
      
      <h2>{video.titulo}</h2>
      
      {/* Elemento de vídeo HTML5 padrão */}
      <video 
        ref={videoRef}
        src={video.url} 
        controls 
        width="100%" 
        style={{ maxWidth: '800px', backgroundColor: 'black', borderRadius: '8px' }}
      >
        Seu navegador não suporta a tag de vídeo.
      </video>
    </div>
  );
}

export default VideoPlayer;