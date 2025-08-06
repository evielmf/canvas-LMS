from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import uvicorn
import os
import asyncio
import aiohttp
import time
import logging
from datetime import datetime
from dotenv import load_dotenv
from cache_manager import performance_cache

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Easeboard API - Optimized",
    description="High-performance backend API for Easeboard student dashboard with TTL caching",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app", 
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Pydantic models
class CanvasCredentials(BaseModel):
    canvas_url: str
    canvas_token: str
    user_id: str

class CacheStats(BaseModel):
    hit_rate: str
    total_requests: int
    hit_counts: Dict[str, int]
    miss_counts: Dict[str, int]
    cache_sizes: Dict[str, int]

# Global session for connection pooling
http_session: Optional[aiohttp.ClientSession] = None

@app.on_event("startup")
async def startup_event():
    """Initialize HTTP session for connection pooling"""
    global http_session
    timeout = aiohttp.ClientTimeout(total=30)
    connector = aiohttp.TCPConnector(limit=100, ttl_dns_cache=300)
    http_session = aiohttp.ClientSession(
        timeout=timeout,
        connector=connector
    )
    logger.info("🚀 FastAPI server started with connection pooling")

@app.on_event("shutdown") 
async def shutdown_event():
    """Clean up HTTP session"""
    global http_session
    if http_session:
        await http_session.close()

async def get_http_session() -> aiohttp.ClientSession:
    """Dependency to get HTTP session"""
    global http_session
    if not http_session:
        await startup_event()
    return http_session

@app.get("/")
async def root():
    """Health check endpoint with cache stats"""
    cache_stats = performance_cache.get_stats()
    return {
        "message": "Easeboard API is running - OPTIMIZED", 
        "status": "healthy",
        "version": "2.0.0",
        "cache_performance": cache_stats,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/canvas/grades/{user_id}")
async def get_cached_grades(
    user_id: str,
    force_refresh: bool = False,
    session: aiohttp.ClientSession = Depends(get_http_session)
) -> Dict[str, Any]:
    """
    Get Canvas grades with aggressive TTL caching
    Target: <1s response time
    """
    start_time = time.time()
    
    try:
        # Check cache first (unless force refresh)
        if not force_refresh:
            cached_data = performance_cache.get(user_id, "grades")
            if cached_data:
                response_time = (time.time() - start_time) * 1000
                logger.info(f"⚡ Grades cache HIT - {response_time:.1f}ms")
                return {
                    "grades": cached_data["data"],
                    "cached": True,
                    "response_time_ms": response_time,
                    "source": "memory_cache"
                }
        
        # Cache miss - fetch from database/API
        logger.info(f"🔄 Fetching grades for user {user_id}")
        
        # Simulate database fetch (replace with actual Supabase query)
        # In production, this would call your Supabase API
        grades_data = await fetch_grades_from_db(user_id, session)
        
        # Cache the result
        performance_cache.set(user_id, "grades", grades_data)
        
        response_time = (time.time() - start_time) * 1000
        logger.info(f"💾 Grades fetched and cached - {response_time:.1f}ms")
        
        return {
            "grades": grades_data,
            "cached": False,
            "response_time_ms": response_time,
            "source": "database"
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching grades: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch grades: {str(e)}")

@app.get("/api/canvas/courses/{user_id}")
async def get_cached_courses(
    user_id: str,
    force_refresh: bool = False,
    session: aiohttp.ClientSession = Depends(get_http_session)
) -> Dict[str, Any]:
    """
    Get Canvas courses with TTL caching
    Target: <1s response time
    """
    start_time = time.time()
    
    try:
        # Check cache first
        if not force_refresh:
            cached_data = performance_cache.get(user_id, "courses")
            if cached_data:
                response_time = (time.time() - start_time) * 1000
                logger.info(f"⚡ Courses cache HIT - {response_time:.1f}ms")
                return {
                    "courses": cached_data["data"],
                    "cached": True,
                    "response_time_ms": response_time,
                    "source": "memory_cache"
                }
        
        # Fetch from database
        courses_data = await fetch_courses_from_db(user_id, session)
        performance_cache.set(user_id, "courses", courses_data)
        
        response_time = (time.time() - start_time) * 1000
        return {
            "courses": courses_data,
            "cached": False,
            "response_time_ms": response_time,
            "source": "database"
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching courses: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch courses: {str(e)}")

@app.get("/api/canvas/assignments/{user_id}")
async def get_cached_assignments(
    user_id: str,
    force_refresh: bool = False,
    session: aiohttp.ClientSession = Depends(get_http_session)
) -> Dict[str, Any]:
    """
    Get Canvas assignments with TTL caching
    Target: <1s response time
    """
    start_time = time.time()
    
    try:
        # Check cache first
        if not force_refresh:
            cached_data = performance_cache.get(user_id, "assignments")
            if cached_data:
                response_time = (time.time() - start_time) * 1000
                logger.info(f"⚡ Assignments cache HIT - {response_time:.1f}ms")
                return {
                    "assignments": cached_data["data"],
                    "cached": True,
                    "response_time_ms": response_time,
                    "source": "memory_cache"
                }
        
        # Fetch from database
        assignments_data = await fetch_assignments_from_db(user_id, session)
        performance_cache.set(user_id, "assignments", assignments_data)
        
        response_time = (time.time() - start_time) * 1000
        return {
            "assignments": assignments_data,
            "cached": False,
            "response_time_ms": response_time,
            "source": "database"
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching assignments: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch assignments: {str(e)}")

@app.get("/api/canvas/all/{user_id}")
async def get_all_canvas_data_parallel(
    user_id: str,
    session: aiohttp.ClientSession = Depends(get_http_session)
) -> Dict[str, Any]:
    """
    Fetch ALL Canvas data in parallel for dashboard
    Target: <3s response time for complete dashboard
    """
    start_time = time.time()
    
    try:
        # Parallel fetch using asyncio.gather
        logger.info(f"🚀 Parallel fetch starting for user {user_id}")
        
        tasks = [
            fetch_grades_from_cache_or_db(user_id, session),
            fetch_courses_from_cache_or_db(user_id, session), 
            fetch_assignments_from_cache_or_db(user_id, session)
        ]
        
        grades_data, courses_data, assignments_data = await asyncio.gather(*tasks)
        
        response_time = (time.time() - start_time) * 1000
        logger.info(f"⚡ Parallel fetch completed - {response_time:.1f}ms")
        
        return {
            "grades": grades_data,
            "courses": courses_data,
            "assignments": assignments_data,
            "response_time_ms": response_time,
            "parallel_fetch": True,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error in parallel fetch: {e}")
        raise HTTPException(status_code=500, detail=f"Parallel fetch failed: {str(e)}")

@app.post("/api/canvas/sync/{user_id}")
async def trigger_background_sync(
    user_id: str,
    credentials: CanvasCredentials,
    background_tasks: BackgroundTasks,
    session: aiohttp.ClientSession = Depends(get_http_session)
) -> Dict[str, Any]:
    """
    Trigger background Canvas sync without blocking
    """
    try:
        # Invalidate cache to force fresh data
        performance_cache.invalidate(user_id)
        
        # Add background task for heavy sync operation
        background_tasks.add_task(
            background_canvas_sync, 
            user_id, 
            credentials.canvas_url, 
            credentials.canvas_token,
            session
        )
        
        return {
            "message": "Background sync started",
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
            "estimated_completion": "2-5 minutes"
        }
        
    except Exception as e:
        logger.error(f"❌ Sync trigger error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to trigger sync: {str(e)}")

@app.get("/api/cache/stats")
async def get_cache_statistics() -> CacheStats:
    """Get detailed cache performance statistics"""
    stats = performance_cache.get_stats()
    return CacheStats(**stats)

@app.delete("/api/cache/{user_id}")
async def invalidate_user_cache(user_id: str, data_type: Optional[str] = None):
    """Invalidate cache for specific user and data type"""
    performance_cache.invalidate(user_id, data_type)
    return {
        "message": f"Cache invalidated for user {user_id}",
        "data_type": data_type or "all"
    }

# Helper functions for data fetching
async def fetch_grades_from_cache_or_db(user_id: str, session: aiohttp.ClientSession):
    """Fetch grades from cache or database"""
    cached = performance_cache.get(user_id, "grades")
    if cached:
        return cached["data"]
    
    data = await fetch_grades_from_db(user_id, session)
    performance_cache.set(user_id, "grades", data)
    return data

async def fetch_courses_from_cache_or_db(user_id: str, session: aiohttp.ClientSession):
    """Fetch courses from cache or database"""
    cached = performance_cache.get(user_id, "courses")
    if cached:
        return cached["data"]
    
    data = await fetch_courses_from_db(user_id, session)
    performance_cache.set(user_id, "courses", data)
    return data

async def fetch_assignments_from_cache_or_db(user_id: str, session: aiohttp.ClientSession):
    """Fetch assignments from cache or database"""
    cached = performance_cache.get(user_id, "assignments")
    if cached:
        return cached["data"]
    
    data = await fetch_assignments_from_db(user_id, session)
    performance_cache.set(user_id, "assignments", data)
    return data

async def fetch_grades_from_db(user_id: str, session: aiohttp.ClientSession) -> List[Dict]:
    """Simulate database fetch for grades (replace with actual Supabase call)"""
    await asyncio.sleep(0.1)  # Simulate DB query time
    return [
        {"id": 1, "score": 95, "assignment": "Quiz 1", "course": "Math 101"},
        {"id": 2, "score": 87, "assignment": "Essay", "course": "English 102"}
    ]

async def fetch_courses_from_db(user_id: str, session: aiohttp.ClientSession) -> List[Dict]:
    """Simulate database fetch for courses"""
    await asyncio.sleep(0.1)
    return [
        {"id": 1, "name": "Math 101", "code": "MATH101"},
        {"id": 2, "name": "English 102", "code": "ENG102"}
    ]

async def fetch_assignments_from_db(user_id: str, session: aiohttp.ClientSession) -> List[Dict]:
    """Simulate database fetch for assignments"""
    await asyncio.sleep(0.1)
    return [
        {"id": 1, "name": "Quiz 2", "due_date": "2024-12-20", "course_id": 1},
        {"id": 2, "name": "Final Essay", "due_date": "2024-12-22", "course_id": 2}
    ]

async def background_canvas_sync(user_id: str, canvas_url: str, canvas_token: str, session: aiohttp.ClientSession):
    """Background task for heavy Canvas API sync"""
    try:
        logger.info(f"🔄 Starting background sync for user {user_id}")
        
        # Simulate heavy Canvas API calls
        await asyncio.sleep(2)  # Simulate API calls
        
        # Update cache with fresh data after sync
        performance_cache.invalidate(user_id)
        
        logger.info(f"✅ Background sync completed for user {user_id}")
        
    except Exception as e:
        logger.error(f"❌ Background sync failed for user {user_id}: {e}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info",
        access_log=True
    )
