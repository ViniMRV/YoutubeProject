import { useState } from 'react';
import VideoList from './components/VideoList';
import VideoPlayer from './components/VideoPlayer'; 

function App() {
  const [videoAtual, setVideoAtual] = useState(null);
  const [searchText, setSearchText] = useState('');

  const handleSelectVideo = (video) => {
    setVideoAtual(video);
  };

  const handleBack = () => {
    setVideoAtual(null);
  };

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f9f9f9', fontFamily: 'Arial, sans-serif'}}>

         {/* HEADER */}
         <header style={{backgroundColor: '#ff0000', padding: '16px 24px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)'}}>
          <h1 style={{color: 'white', margin: 0, fontSize: '28px', textAlign: 'center'}}>
            Meu YouTube Clone
         </h1>
      </header>
      
      {/* CONTEÚDO */}
      <main style={{ padding: '24px' }}>
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '24px'}}>
          <input 
            type="text" 
            placeholder="Pesquisar vídeos" 
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            style={{ width: '100%', maxWidth: '600px', padding: '12px 16px',borderRadius: '24px', border: '1px solid #ccc', fontSize: '16px', outline: 'none'}}/>
        </div>

        {!videoAtual ? (
          <VideoList 
            onSelectVideo={handleSelectVideo}
            searchText = {searchText}
          />
        ) : (
          <VideoPlayer
            video={videoAtual}
            onBack={handleBack}
            onSelectVideo={handleSelectVideo}
          />
        )}
      </main>
    </div>
  );
}

export default App;