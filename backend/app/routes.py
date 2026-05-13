from fastapi import APIRouter, HTTPException
from app.models import VideoModel, UserPreferencesModel, VideoProgressModel
from app.database import video_collection, preferences_collection
from typing import List

router = APIRouter()

# --- Rotas de Vídeos ---

@router.post("/videos/", response_model=VideoModel)
async def create_video(video: VideoModel):
    # Insere um novo vídeo no banco
    new_video = await video_collection.insert_one(video.model_dump(by_alias=True, exclude_unset=True))
    created_video = await video_collection.find_one({"_id": new_video.inserted_id})
    return created_video

@router.get("/videos/", response_model=List[VideoModel])
async def list_videos():
    # Implementa a parte de "Seleciona Video" do diagrama
    videos = await video_collection.find().to_list(100)
    return videos

# --- Rotas de Preferências ---

@router.get("/preferences/{user_id}", response_model=UserPreferencesModel)
async def get_preferences(user_id: str):
    # Busca as preferências que o Service carrega ao iniciar o player
    prefs = await preferences_collection.find_one({"usuario_id": user_id})
    if prefs:
        return prefs
    # Se não existir, retorna um padrão
    return UserPreferencesModel(usuario_id=user_id)

@router.put("/preferences/{user_id}")
async def update_preferences(user_id: str, prefs: UserPreferencesModel):
    # Implementa a aplicação de configurações
    await preferences_collection.update_one(
        {"usuario_id": user_id},
        {"$set": prefs.model_dump(exclude={"usuario_id"})},
        upsert=True
    )
    return {"message": "Preferências atualizadas com sucesso"}