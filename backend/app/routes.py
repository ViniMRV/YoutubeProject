from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.models import VideoModel, UserPreferencesModel, VideoProgressModel, UserModel
from app.database import video_collection, preferences_collection, users_collection
from typing import List
import shutil
import os
from uuid import uuid4

router = APIRouter()

# --- Rotas de Vídeos ---

@router.post("/videos/", response_model=VideoModel)
async def create_video(video: VideoModel):
    # Insere um novo vídeo no banco
    new_video = await video_collection.insert_one(video.model_dump(by_alias=True, exclude_unset=True))
    created_video = await video_collection.find_one({"_id": new_video.inserted_id})
    
    # Adicionamos esta linha para converter o ObjectId para string
    created_video["_id"] = str(created_video["_id"]) 
    
    return created_video

@router.get("/videos/", response_model=List[VideoModel])
async def list_videos():
    # Implementa a parte de "Seleciona Video" do diagrama
    videos = await video_collection.find().to_list(100)
    
    # Adicionamos este loop para converter o ObjectId de cada vídeo da lista
    for video in videos:
        video["_id"] = str(video["_id"])
        
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

@router.post("/videos/upload", response_model=VideoModel)
async def upload_video(
    titulo: str = Form(...),
    descricao: str = Form(""),
    duracao_segundos: int = Form(...),
    thumbnail: UploadFile = File(...),
    video: UploadFile = File(...)
):
    os.makedirs("uploads", exist_ok=True)

    thumbnail_filename = f"{uuid4()}_{thumbnail.filename}"
    video_filename = f"{uuid4()}_{video.filename}"

    thumbnail_path = f"uploads/{thumbnail_filename}"
    video_path = f"uploads/{video_filename}"

    with open(thumbnail_path, "wb") as buffer:
        shutil.copyfileobj(thumbnail.file, buffer)

    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    video_data = {
        "titulo": titulo,
        "descricao": descricao,
        "duracao_segundos": duracao_segundos,
        "thumbnail": f"http://localhost:8000/uploads/{thumbnail_filename}",
        "url": f"http://localhost:8000/uploads/{video_filename}"
    }

    new_video = await video_collection.insert_one(video_data)
    created_video = await video_collection.find_one({"_id": new_video.inserted_id})
    created_video["_id"] = str(created_video["_id"])

    return created_video

@router.post("/users/", response_model=UserModel)
async def create_user(user: UserModel):
    new_user = await users_collection.insert_one(
        user.model_dump(by_alias=True, exclude_unset=True)
    )

    created_user = await users_collection.find_one({"_id": new_user.inserted_id})
    created_user["_id"] = str(created_user["_id"])

    return created_user


@router.get("/users/{user_id}", response_model=UserModel)
async def get_user(user_id: str):
    user = await users_collection.find_one({"_id": user_id})

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    user["_id"] = str(user["_id"])
    return user