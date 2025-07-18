from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    kills: int = 0
    deaths: int = 0
    health: int = 10
    score: int = 0
    isLive: bool = True