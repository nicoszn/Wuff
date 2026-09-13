from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import yt_dlp

app = FastAPI()

class ExtractRequest(BaseModel):
    url: str

@app.post("/")
async def extract_media(payload: ExtractRequest):
    target_url = payload.url
    
    if not target_url or ("x.com" not in target_url and "twitter.com" not in target_url):
        raise HTTPException(status_code=400, detail="A valid public X/Twitter link is required.")
        
    # Python-native yt-dlp extraction configuration block
    # Bypasses datacenter restrictions by tapping the official syndication embed API
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
            # Safely fetch metadata directly into a Python dictionary runtime
            info_dict = ydl.extract_info(target_url, download=False)
            
            if not info_dict:
                raise HTTPException(status_code=404, detail="Could not capture post data metadata schema.")
                
            media_list = []
            
            # Process single entries or multi-item structures
            formats = info_dict.get('formats', [])
            
            # Select the absolute highest bitrate MP4 target video file variant
            mp4_videos = [f for f in formats if f.get('ext') == 'mp4' and f.get('acodec') != 'none']
            if mp4_videos:
                best_video = max(mp4_videos, key=lambda x: x.get('bitrate', 0) or 0)
                media_list.append({
                    "type": "video",
                    "preview": info_dict.get('thumbnail', ''),
                    "downloadUrl": best_video.get('url')
                })
            elif info_dict.get('url'):
                # Handle single photo image/fallback strings
                media_list.append({
                    "type": "image",
                    "preview": info_dict.get('thumbnail', ''),
                    "downloadUrl": info_dict.get('url')
                })
                
            if not media_list:
                raise HTTPException(status_code=422, detail="No extractable downloads verified for this post format.")
                
            return {
                "id": info_dict.get('id', ''),
                "text": info_dict.get('description', ''),
                "title": info_dict.get('title', 'X Asset Extraction'),
                "media": media_list
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"yt-dlp extraction error: {str(e)}")
