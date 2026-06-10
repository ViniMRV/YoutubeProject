import { useState } from 'react';
import VideoList from './components/VideoList';
import VideoPlayer from './components/VideoPlayer';
import UploadVideoForm from './components/UploadVideoForm';
import ChannelPage from './components/ChannelPage';

function App() {
  const [videoAtual, setVideoAtual] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [refreshVideos, setRefreshVideos] = useState(0);
  const [showChannelPage, setShowChannelPage] = useState(false);

  const user = {
    nome: 'Isabella'
  };

  const handleSelectVideo = (video) => {
    setVideoAtual(video);
    setShowChannelPage(false);
    setShowUploadForm(false);
  };

  const handleBack = () => {
    setVideoAtual(null);
  };

  const handleOpenChannel = () => {
    setShowChannelPage(true);
    setVideoAtual(null);
    setShowUploadForm(false);
  };

  const handleBackFromChannel = () => {
    setShowChannelPage(false);
    setShowUploadForm(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f9f9', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ backgroundColor: '#ff0000', padding: '16px 24px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: '140px' }} />

        <h1 style={{ color: 'white', margin: 0, fontSize: '28px' }}>
          Meu YouTube Clone
        </h1>

        <button
          onClick={handleOpenChannel}
          style={{ backgroundColor: 'white', color: '#ff0000', border: 'none', borderRadius: '20px', padding: '10px 16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {user.nome}
        </button>
      </header>

      <main style={{ padding: '24px' }}>
        {showChannelPage ? (
          <>
            <ChannelPage
              user={user}
              onBack={handleBackFromChannel}
              onPostVideo={() => setShowUploadForm(true)}
              onSelectVideo={handleSelectVideo}
              refreshVideos={refreshVideos}
            />

            {showUploadForm && (
              <UploadVideoForm
                onClose={() => setShowUploadForm(false)}
                canalId={user.nome}
                onVideoCreated={() => {
                  setRefreshVideos(refreshVideos + 1);
                  setShowUploadForm(false);
                }}
              />
            )}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <input 
                type="text" 
                placeholder="Pesquisar vídeos" 
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                style={{ width: '100%', maxWidth: '600px', padding: '12px 16px', borderRadius: '24px', border: '1px solid #ccc', fontSize: '16px', outline: 'none' }}
              />
            </div>

            {!videoAtual ? (
              <VideoList 
                onSelectVideo={handleSelectVideo}
                searchText={searchText}
                refreshVideos={refreshVideos}
              />
            ) : (
              <VideoPlayer
                video={videoAtual}
                onBack={handleBack}
                onSelectVideo={handleSelectVideo}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;