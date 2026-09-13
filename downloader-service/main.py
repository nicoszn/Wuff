from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import yt_dlp

app = FastAPI()

class ExtractRequest(BaseModel):
    url: str

@app.get("/health")
def health_check():
    return {"status": "container healthy"}

@app.post("/")
@app.post("/api/downloader")
async def extract_media(payload: ExtractRequest):
    target_url = payload.url
    if not target_url or ("x.com" not in target_url and "twitter.com" not in target_url):
        raise HTTPException(status_code=400, detail="A valid public X/Twitter link is required.")
        
    ydl_opts = {
        'extract_flat': False,
        'skip_download': True,
        'extractor_args': {
            'twitter': {
                'api': ['syndication']
            }
        },
        'quiet': True
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(target_url, download=False)
            if not info_dict:
                raise HTTPException(status_code=404, detail="Could not capture post data metadata schema.")
                
            media_list = []
            formats = info_dict.get('formats', [])
            
            # Select premium stream quality properties
            mp4_videos = [f for f in formats if f.get('ext') == 'mp4' and f.get('acodec') != 'none']
            if mp4_videos:
                best_video = max(mp4_videos, key=lambda x: x.get('bitrate', 0) or 0)
                media_list.append({
                    "type": "video",
                    "preview": info_dict.get('thumbnail', ''),
                    "downloadUrl": best_video.get('url')
                })
            elif info_dict.get('url'):
                media_list.append({
                    "type": "image",
                    "preview": info_dict.get('thumbnail', ''),
                    "downloadUrl": info_dict.get('url')
                })
                
            return {
                "id": info_dict.get('id', ''),
                "text": info_dict.get('description', ''),
                "title": info_dict.get('title', 'X Asset Extraction'),
                "media": media_list
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failure: {str(e)}")
