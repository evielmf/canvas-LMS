#!/usr/bin/env python3
"""
Simplified FastAPI backend for Canvas LMS Dashboard
Uses standard library instead of aiohttp/orjson for Windows compatibility
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from cache_manager import PerformanceCache
import uvicorn
import requests
from urllib.parse import urljoin

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Canvas LMS Performance API",
    description="High-performance Canvas API with TTL caching",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize cache
cache = PerformanceCache()

# Performance tracking
performance_stats = {
    "total_requests": 0,
    "cache_hits": 0,
    "cache_misses": 0,
    "avg_response_time": 0,
    "error_count": 0
}

class PerformanceTimer:
    def __init__(self):
        self.start_time = None
        
    def __enter__(self):
        self.start_time = time.time()
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.start_time:
            duration = time.time() - self.start_time
            performance_stats["total_requests"] += 1
            performance_stats["avg_response_time"] = (
                (performance_stats["avg_response_time"] * (performance_stats["total_requests"] - 1) + duration) 
                / performance_stats["total_requests"]
            )

def make_canvas_request(url: str, headers: Dict[str, str], timeout: int = 10) -> Dict[str, Any]:
    """Make a Canvas API request using requests library"""
    try:
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Canvas API request failed: {e}")
        raise HTTPException(status_code=500, detail=f"Canvas API error: {str(e)}")

async def fetch_canvas_data(endpoint: str, user_id: str, canvas_token: str, canvas_url: str) -> Dict[str, Any]:
    """Fetch data from Canvas API with caching"""
    cache_key = f"{user_id}:{endpoint}"
    
    # Check cache first
    cached_data = cache.get(cache_key)
    if cached_data:
        performance_stats["cache_hits"] += 1
        logger.info(f"Cache hit for {cache_key}")
        return cached_data
    
    performance_stats["cache_misses"] += 1
    logger.info(f"Cache miss for {cache_key}")
    
    # Fetch from Canvas API
    url = urljoin(canvas_url, f"/api/v1/{endpoint}")
    headers = {"Authorization": f"Bearer {canvas_token}"}
    
    try:
        # Use asyncio to run the synchronous request
        loop = asyncio.get_event_loop()
        data = await loop.run_in_executor(None, make_canvas_request, url, headers)
        
        # Cache the result
        cache.set(cache_key, data)
        
        return data
    except Exception as e:
        performance_stats["error_count"] += 1
        logger.error(f"Failed to fetch Canvas data: {e}")
        raise

@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "cache_stats": cache.get_stats(),
        "performance": performance_stats
    }

@app.get("/api/cache/stats")
async def get_cache_stats():
    """Get cache statistics"""
    return {
        "cache": cache.get_stats(),
        "performance": performance_stats,
        "uptime": time.time()
    }

@app.get("/api/canvas/courses/{user_id}")
async def get_courses(user_id: str, canvas_token: str, canvas_url: str):
    """Get Canvas courses for user"""
    with PerformanceTimer():
        try:
            data = await fetch_canvas_data("courses", user_id, canvas_token, canvas_url)
            return {"data": data, "cached": cache.get(f"{user_id}:courses") is not None}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/canvas/assignments/{user_id}")
async def get_assignments(user_id: str, canvas_token: str, canvas_url: str):
    """Get Canvas assignments for user"""
    with PerformanceTimer():
        try:
            data = await fetch_canvas_data("assignments", user_id, canvas_token, canvas_url)
            return {"data": data, "cached": cache.get(f"{user_id}:assignments") is not None}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/canvas/grades/{user_id}")
async def get_grades(user_id: str, canvas_token: str, canvas_url: str):
    """Get Canvas grades for user"""
    with PerformanceTimer():
        try:
            data = await fetch_canvas_data("grades", user_id, canvas_token, canvas_url)
            return {"data": data, "cached": cache.get(f"{user_id}:grades") is not None}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/canvas/all/{user_id}")
async def get_all_canvas_data(user_id: str, canvas_token: str, canvas_url: str):
    """Get all Canvas data in parallel"""
    with PerformanceTimer():
        try:
            # Fetch all data concurrently
            tasks = [
                fetch_canvas_data("courses", user_id, canvas_token, canvas_url),
                fetch_canvas_data("assignments", user_id, canvas_token, canvas_url),
                fetch_canvas_data("grades", user_id, canvas_token, canvas_url)
            ]
            
            courses, assignments, grades = await asyncio.gather(*tasks, return_exceptions=True)
            
            result = {
                "courses": courses if not isinstance(courses, Exception) else None,
                "assignments": assignments if not isinstance(assignments, Exception) else None,
                "grades": grades if not isinstance(grades, Exception) else None,
                "cached": {
                    "courses": cache.get(f"{user_id}:courses") is not None,
                    "assignments": cache.get(f"{user_id}:assignments") is not None,
                    "grades": cache.get(f"{user_id}:grades") is not None
                },
                "errors": {
                    "courses": str(courses) if isinstance(courses, Exception) else None,
                    "assignments": str(assignments) if isinstance(assignments, Exception) else None,
                    "grades": str(grades) if isinstance(grades, Exception) else None
                }
            }
            
            return result
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cache/clear")
async def clear_cache():
    """Clear all cache data"""
    cache.clear()
    return {"message": "Cache cleared successfully"}

@app.post("/api/cache/refresh/{user_id}")
async def refresh_user_cache(user_id: str, canvas_token: str, canvas_url: str, background_tasks: BackgroundTasks):
    """Refresh cache for a specific user in background"""
    
    async def refresh_data():
        try:
            # Clear existing cache for this user
            for endpoint in ["courses", "assignments", "grades"]:
                cache.delete(f"{user_id}:{endpoint}")
            
            # Fetch fresh data
            await get_all_canvas_data(user_id, canvas_token, canvas_url)
            logger.info(f"Background refresh completed for user {user_id}")
        except Exception as e:
            logger.error(f"Background refresh failed for user {user_id}: {e}")
    
    background_tasks.add_task(refresh_data)
    return {"message": f"Background refresh started for user {user_id}"}

if __name__ == "__main__":
    logger.info("Starting Canvas LMS Performance API...")
    logger.info("Optimizations: TTL caching, parallel fetching, performance tracking")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=False  # Disable reload for production
    )
