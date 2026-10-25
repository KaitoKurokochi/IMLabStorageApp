import os
import sys
import uvicorn

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings

if __name__ == "__main__":
    reload = settings.APP_ENV != "production"
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=reload
    )
