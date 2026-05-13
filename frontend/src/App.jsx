import { useState } from 'react';
import VideoList from './components/VideoList';
import VideoPlayer from './components/VideoPlayer'; // Importe o novo componente

function App() {
  const [videoAtual, setVideoAtual] = useState(null);

  const handleSelectVideo = (video) => {
    setVideoAtual(video);
  };

  const handleBack = () => {
    setVideoAtual(null);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Meu YouTube Clone</h1>
      
      {!videoAtual ? (
        <VideoList onSelectVideo={handleSelectVideo} />
      ) : (
        <VideoPlayer video={videoAtual} onBack={handleBack} />
      )}
    </div>
  );
}

export default App;