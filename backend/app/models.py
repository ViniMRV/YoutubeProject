from pydantic import BaseModel, Field
from typing import Optional

# Baseado no bloco "Videos" do seu diagrama
class VideoModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    titulo: str
    descricao: Optional[str] = None
    url: str
    thumbnail: Optional[str] = None
    duracao_segundos: int

# Baseado no bloco "Preferências do usuário" e ações de alteração de estado do diagrama
class UserPreferencesModel(BaseModel):
    usuario_id: str
    velocidade_reproducao: float = 1.0  # Padrão: 1x
    qualidade_video: str = "1080p"      # Padrão: 1080p
    idioma_legenda: Optional[str] = None # None significa desativado
    tela_cheia_ativada: bool = False

# Baseado nos blocos "Minutagem do video" e "Salvar progresso de reprodução" do diagrama
class VideoProgressModel(BaseModel):
    usuario_id: str
    video_id: str
    tempo_atual_segundos: int = 0
    pausado: bool = True