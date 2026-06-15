import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

function PlaylistMenu({ userId, onSelectPlaylist, onBack }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  useEffect(() => {
    loadPlaylists();
  }, [userId]);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/playlists/user/${userId}`);
      setPlaylists(response.data);
    } catch (error) {
      console.error('Erro ao carregar playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      alert('Digite um nome para a playlist');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/playlists/`, {
        nome: newPlaylistName,
        descricao: newPlaylistDesc,
        usuario_id: userId,
        videos: [],
        publica: false
      });
      
      setPlaylists([...playlists, response.data]);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setShowCreateForm(false);
      alert('Playlist criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar playlist:', error);
      alert('Erro ao criar playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Tem certeza que deseja deletar essa playlist?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/playlists/${playlistId}`);
      setPlaylists(playlists.filter(p => p.id !== playlistId));
      alert('Playlist deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar playlist:', error);
      alert('Erro ao deletar playlist');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: '#333' }}>Minhas Playlists</h2>
        <div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              backgroundColor: '#ff0000',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
              fontWeight: 'bold'
            }}
          >
            + Nova Playlist
          </button>
          <button
            onClick={onBack}
            style={{
              backgroundColor: '#999',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Voltar
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #ddd'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Criar Nova Playlist</h3>
          <input
            type="text"
            placeholder="Nome da playlist"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              boxSizing: 'border-box',
              fontSize: '14px'
            }}
          />
          <textarea
            placeholder="Descrição (opcional)"
            value={newPlaylistDesc}
            onChange={(e) => setNewPlaylistDesc(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              boxSizing: 'border-box',
              fontSize: '14px',
              minHeight: '80px',
              fontFamily: 'Arial, sans-serif'
            }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCreatePlaylist}
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
              Criar
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewPlaylistName('');
                setNewPlaylistDesc('');
              }}
              style={{
                backgroundColor: '#999',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Carregando playlists...</p>
      ) : playlists.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', fontSize: '16px' }}>
          Nenhuma playlist criada ainda. Crie uma para começar!
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
              <h3
                onClick={() => onSelectPlaylist(playlist)}
                style={{
                  margin: '0 0 8px 0',
                  color: '#ff0000',
                  fontSize: '18px',
                  cursor: 'pointer',
                  wordBreak: 'break-word'
                }}
              >
                {playlist.nome}
              </h3>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px', wordBreak: 'break-word' }}>
                {playlist.descricao || 'Sem descrição'}
              </p>
              <p style={{ margin: '0 0 12px 0', color: '#999', fontSize: '13px' }}>
                {playlist.videos?.length || 0} vídeos
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onSelectPlaylist(playlist)}
                  style={{
                    flex: 1,
                    backgroundColor: '#ff0000',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  Ver
                </button>
                <button
                  onClick={() => handleDeletePlaylist(playlist.id)}
                  style={{
                    flex: 1,
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlaylistMenu;
