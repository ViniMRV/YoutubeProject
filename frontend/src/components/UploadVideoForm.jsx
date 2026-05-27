import { useState } from 'react';
import axios from 'axios';

function UploadVideoForm({ onClose, onVideoCreated }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [duracao, setDuracao] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [video, setVideo] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('duracao_segundos', duracao);
    formData.append('thumbnail', thumbnail);
    formData.append('video', video);

    const response = await axios.post(
      'http://localhost:8000/api/videos/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    onVideoCreated(response.data);
    onClose();
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxWidth: '500px', margin: '24px auto' }}>
      <h2>Postar vídeo</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '12px', padding: '10px' }}
        />

        <textarea
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          style={{ width: '100%', marginBottom: '12px', padding: '10px' }}
        />

        <input
          type="number"
          placeholder="Duração em segundos"
          value={duracao}
          onChange={(e) => setDuracao(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '12px', padding: '10px' }}
        />

        <p>Thumbnail:</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnail(e.target.files[0])}
          required
        />

        <p>Vídeo:</p>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files[0])}
          required
        />

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button type="submit">Publicar</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default UploadVideoForm;