from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from app.models import VideoModel, UserPreferencesModel, VideoProgressModel, UserModel
from app.database import video_collection, preferences_collection, users_collection
from typing import List, Optional
from bson import ObjectId
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
async def list_videos(canal_id: Optional[str] = Query(default=None)):
    filtro = {"canal_id": canal_id} if canal_id else {}
    videos = await video_collection.find(filtro).to_list(100)
    for video in videos:
        video["_id"] = str(video["_id"])
    return videos

def _parse_id(video_id: str):
    try:
        return ObjectId(video_id)
    except Exception:
        return video_id


@router.delete("/videos/{video_id}")
async def delete_video(video_id: str):
    result = await video_collection.delete_one({"_id": _parse_id(video_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vídeo não encontrado")
    return {"message": "Vídeo deletado com sucesso"}


@router.patch("/videos/{video_id}/canal")
async def assign_canal(video_id: str, canal_id: str = Query(...)):
    result = await video_collection.update_one(
        {"_id": _parse_id(video_id)},
        {"$set": {"canal_id": canal_id}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vídeo não encontrado")
    return {"message": "canal_id atualizado"}


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
    canal_id: str = Form(""),
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
        "canal_id": canal_id or None,
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