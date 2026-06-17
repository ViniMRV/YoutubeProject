from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from app.models import VideoModel, UserPreferencesModel, VideoProgressModel, UserModel, PlaylistModel
from app.database import video_collection, preferences_collection, users_collection, playlists_collection
from typing import List, Optional
from bson import ObjectId
import shutil
import os
from uuid import uuid4
from datetime import datetime

router = APIRouter()

_in_memory_playlists = {}


def _serialize_playlist(playlist: dict) -> dict:
    data = dict(playlist)
    # Sempre mapeia _id para id
    if "_id" in data:
        data["id"] = str(data.pop("_id"))
    elif "id" not in data:
        data["id"] = str(uuid4())

    data.setdefault("videos", [])
    data.setdefault("publica", False)
    return data


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


# --- Rotas de Playlists ---

@router.post("/playlists/", response_model=PlaylistModel)
async def create_playlist(playlist: PlaylistModel):
    """Cria uma nova playlist"""
    playlist_data = playlist.model_dump(by_alias=True, exclude_unset=True)
    playlist_data["data_criacao"] = datetime.now().isoformat()

    try:
        new_playlist = await playlists_collection.insert_one(playlist_data)
        created_playlist = await playlists_collection.find_one({"_id": new_playlist.inserted_id})
        return _serialize_playlist(created_playlist)
    except Exception:
        playlist_id = str(uuid4())
        playlist_data["id"] = playlist_id
        playlist_data["_id"] = playlist_id
        _in_memory_playlists[playlist_id] = playlist_data
        return _serialize_playlist(playlist_data)


@router.get("/playlists/user/{usuario_id}", response_model=List[PlaylistModel])
async def list_user_playlists(usuario_id: str):
    """Lista todas as playlists do usuário"""
    try:
        playlists = await playlists_collection.find({"usuario_id": usuario_id}).to_list(100)
        return [_serialize_playlist(playlist) for playlist in playlists]
    except Exception:
        return [_serialize_playlist(playlist) for playlist in _in_memory_playlists.values() if playlist.get("usuario_id") == usuario_id]


@router.get("/playlists/{playlist_id}", response_model=PlaylistModel)
async def get_playlist(playlist_id: str):
    """Obtém uma playlist específica"""
    try:
        playlist = await playlists_collection.find_one({"_id": _parse_id(playlist_id)})
    except Exception:
        playlist = _in_memory_playlists.get(playlist_id)

    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist não encontrada")

    return _serialize_playlist(playlist)


@router.put("/playlists/{playlist_id}", response_model=PlaylistModel)
async def update_playlist(playlist_id: str, playlist_update: PlaylistModel):
    """Atualiza uma playlist"""
    update_data = playlist_update.model_dump(by_alias=True, exclude_unset=True, exclude={"id"})

    try:
        result = await playlists_collection.update_one(
            {"_id": _parse_id(playlist_id)},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Playlist não encontrada")
        updated_playlist = await playlists_collection.find_one({"_id": _parse_id(playlist_id)})
        return _serialize_playlist(updated_playlist)
    except Exception:
        if playlist_id not in _in_memory_playlists:
            raise HTTPException(status_code=404, detail="Playlist não encontrada")
        _in_memory_playlists[playlist_id].update(update_data)
        return _serialize_playlist(_in_memory_playlists[playlist_id])


@router.delete("/playlists/{playlist_id}")
async def delete_playlist(playlist_id: str):
    """Deleta uma playlist"""
    try:
        result = await playlists_collection.delete_one({"_id": _parse_id(playlist_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Playlist não encontrada")
        return {"message": "Playlist deletada com sucesso"}
    except Exception:
        if playlist_id not in _in_memory_playlists:
            raise HTTPException(status_code=404, detail="Playlist não encontrada")
        _in_memory_playlists.pop(playlist_id, None)
        return {"message": "Playlist deletada com sucesso"}


@router.post("/playlists/{playlist_id}/videos/{video_id}")
async def add_video_to_playlist(playlist_id: str, video_id: str):
    """Adiciona um vídeo à playlist"""
    try:
        video = await video_collection.find_one({"_id": _parse_id(video_id)})
        if not video:
            raise HTTPException(status_code=404, detail="Vídeo não encontrado")

        playlist = await playlists_collection.find_one({"_id": _parse_id(playlist_id)})
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist não encontrada")

        if video_id not in playlist.get("videos", []):
            result = await playlists_collection.update_one(
                {"_id": _parse_id(playlist_id)},
                {"$push": {"videos": video_id}}
            )
            if result.modified_count == 0:
                raise HTTPException(status_code=400, detail="Não foi possível adicionar o vídeo")
        return {"message": "Vídeo adicionado à playlist com sucesso"}
    except Exception:
        if playlist_id not in _in_memory_playlists:
            raise HTTPException(status_code=404, detail="Playlist não encontrada")
        videos = _in_memory_playlists[playlist_id].setdefault("videos", [])
        if video_id not in videos:
            videos.append(video_id)
        return {"message": "Vídeo adicionado à playlist com sucesso"}


@router.delete("/playlists/{playlist_id}/videos/{video_id}")
async def remove_video_from_playlist(playlist_id: str, video_id: str):
    """Remove um vídeo da playlist"""
    try:
        result = await playlists_collection.update_one(
            {"_id": _parse_id(playlist_id)},
            {"$pull": {"videos": video_id}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Playlist não encontrada")

        return {"message": "Vídeo removido da playlist com sucesso"}
    except Exception:
        if playlist_id not in _in_memory_playlists:
            raise HTTPException(status_code=404, detail="Playlist não encontrada")
        _in_memory_playlists[playlist_id].setdefault("videos", [])
        _in_memory_playlists[playlist_id]["videos"] = [
            item for item in _in_memory_playlists[playlist_id].get("videos", []) if item != video_id
        ]
        return {"message": "Vídeo removido da playlist com sucesso"}