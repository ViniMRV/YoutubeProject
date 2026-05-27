from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router as api_router # Importe o router
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="Video Player API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em desenvolvimento, podemos ser mais permissivos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui as rotas que acabamos de criar
app.include_router(api_router, prefix="/api")

os.makedirs("uploads", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "API do Video Player funcionando perfeitamente!"}