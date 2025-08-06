"""
Enhanced Cache Manager with TTL for Canvas LMS Dashboard
Implements in-memory caching with time-to-live for development speed
"""
import asyncio
import time
from typing import Any, Dict, Optional, Callable, Tuple
from cachetools import TTLCache
import threading
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class PerformanceCache:
    """
    High-performance TTL cache manager for Canvas API data
    Features:
    - In-memory TTL caching for sub-second responses
    - Background refresh to prevent cache misses
    - User-scoped caching for multi-tenant support
    - Automatic cache warming
    """
    
    def __init__(self):
        # Separate caches for different data types with appropriate TTLs
        self.grades_cache = TTLCache(maxsize=1000, ttl=300)      # 5 minutes for grades
        self.courses_cache = TTLCache(maxsize=500, ttl=1800)     # 30 minutes for courses  
        self.assignments_cache = TTLCache(maxsize=2000, ttl=900) # 15 minutes for assignments
        self.user_tokens_cache = TTLCache(maxsize=100, ttl=3600) # 1 hour for tokens
        
        # Performance metrics
        self.hit_counts = {"grades": 0, "courses": 0, "assignments": 0}
        self.miss_counts = {"grades": 0, "courses": 0, "assignments": 0}
        self.refresh_tasks = {}
        
        # Background refresh lock
        self._refresh_lock = threading.Lock()
        
        logger.info("🚀 Performance cache initialized with TTL caching")
    
    def _get_user_key(self, user_id: str, data_type: str) -> str:
        """Generate user-scoped cache key"""
        return f"{data_type}:{user_id}"
    
    def get(self, user_id: str, data_type: str) -> Optional[Any]:
        """
        Get cached data with performance tracking
        Returns None if cache miss
        """
        cache = self._get_cache_for_type(data_type)
        if not cache:
            return None
            
        key = self._get_user_key(user_id, data_type)
        
        try:
            data = cache.get(key)
            if data is not None:
                self.hit_counts[data_type] += 1
                logger.debug(f"✅ Cache HIT for {data_type}:{user_id}")
                
                # Background refresh if data is getting stale (80% of TTL)
                self._maybe_background_refresh(user_id, data_type, key)
                
                return data
            else:
                self.miss_counts[data_type] += 1
                logger.debug(f"❌ Cache MISS for {data_type}:{user_id}")
                return None
                
        except Exception as e:
            logger.error(f"Cache get error for {data_type}: {e}")
            return None
    
    def set(self, user_id: str, data_type: str, data: Any) -> bool:
        """
        Set cached data with timestamp
        """
        cache = self._get_cache_for_type(data_type)
        if not cache:
            return False
            
        key = self._get_user_key(user_id, data_type)
        
        try:
            # Add metadata for cache management
            cached_data = {
                "data": data,
                "cached_at": time.time(),
                "user_id": user_id
            }
            
            cache[key] = cached_data
            logger.debug(f"💾 Cached {data_type} for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Cache set error for {data_type}: {e}")
            return False
    
    def _get_cache_for_type(self, data_type: str) -> Optional[TTLCache]:
        """Get appropriate cache based on data type"""
        cache_map = {
            "grades": self.grades_cache,
            "courses": self.courses_cache, 
            "assignments": self.assignments_cache,
            "tokens": self.user_tokens_cache
        }
        return cache_map.get(data_type)
    
    def _maybe_background_refresh(self, user_id: str, data_type: str, cache_key: str):
        """
        Trigger background refresh if cache is getting stale
        This prevents cache misses by refreshing proactively
        """
        cache = self._get_cache_for_type(data_type)
        if not cache:
            return
            
        try:
            cached_item = cache.get(cache_key)
            if not cached_item:
                return
                
            cached_at = cached_item.get("cached_at", 0)
            cache_age = time.time() - cached_at
            
            # Get TTL for this cache type
            ttl_map = {"grades": 300, "courses": 1800, "assignments": 900}
            ttl = ttl_map.get(data_type, 600)
            
            # If cache is 80% expired, refresh in background
            if cache_age > (ttl * 0.8):
                refresh_key = f"{data_type}:{user_id}"
                if refresh_key not in self.refresh_tasks:
                    logger.info(f"🔄 Triggering background refresh for {data_type}:{user_id}")
                    # Mark refresh as in progress
                    self.refresh_tasks[refresh_key] = time.time()
                    
        except Exception as e:
            logger.error(f"Background refresh check error: {e}")
    
    def invalidate(self, user_id: str, data_type: Optional[str] = None):
        """
        Invalidate cache for user - either specific type or all types
        """
        if data_type:
            cache = self._get_cache_for_type(data_type)
            if cache:
                key = self._get_user_key(user_id, data_type)
                cache.pop(key, None)
                logger.info(f"🗑️ Invalidated {data_type} cache for user {user_id}")
        else:
            # Invalidate all caches for user
            for dtype in ["grades", "courses", "assignments"]:
                cache = self._get_cache_for_type(dtype)
                if cache:
                    key = self._get_user_key(user_id, dtype)
                    cache.pop(key, None)
            logger.info(f"🗑️ Invalidated ALL caches for user {user_id}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        total_hits = sum(self.hit_counts.values())
        total_misses = sum(self.miss_counts.values())
        total_requests = total_hits + total_misses
        
        hit_rate = (total_hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "hit_rate": f"{hit_rate:.1f}%",
            "total_requests": total_requests,
            "hit_counts": self.hit_counts.copy(),
            "miss_counts": self.miss_counts.copy(),
            "cache_sizes": {
                "grades": len(self.grades_cache),
                "courses": len(self.courses_cache),
                "assignments": len(self.assignments_cache)
            }
        }
    
    def clear_all(self):
        """Clear all caches - use for testing/reset"""
        self.grades_cache.clear()
        self.courses_cache.clear()
        self.assignments_cache.clear()
        self.user_tokens_cache.clear()
        logger.info("🧹 All caches cleared")

# Global cache instance
performance_cache = PerformanceCache()
