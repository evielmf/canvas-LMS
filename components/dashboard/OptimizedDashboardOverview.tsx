/**
 * High-Performance Dashboard Overview with TTL Caching and Parallel Fetching
 * Performance targets: <3s load time, >80% cache hit rate
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, BookOpen, GraduationCap, Clock } from 'lucide-react';
import { useCanvasData, CanvasCourse, CanvasAssignment, CanvasGrade } from '@/hooks/useCanvasData';
import { performanceTracker } from '@/utils/performance-optimization';

// Performance constants
const DASHBOARD_LOAD_TIMEOUT = 30000; // 30 second fallback
const CRITICAL_DATA_TIMEOUT = 5000;   // 5 second critical path

interface PerformanceMetrics {
  loadStartTime: number;
  criticalDataTime?: number;
  totalLoadTime?: number;
  cacheHitRate: number;
  apiResponseTimes: number[];
}

interface DashboardStats {
  totalCourses: number;
  activeAssignments: number;
  averageGrade: number;
  upcomingDeadlines: number;
}

export default function OptimizedDashboardOverview() {
  // Performance tracking state
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    loadStartTime: Date.now(),
    cacheHitRate: 0,
    apiResponseTimes: []
  });

  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoadingCritical, setIsLoadingCritical] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing dashboard...');
  const [performanceWarning, setPerformanceWarning] = useState<string | null>(null);

  // Use our optimized Canvas data hook with aggressive caching
  const {
    courses,
    assignments,
    grades,
    loading,
    error,
    refetch,
    backgroundRefresh,
    isCached
  } = useCanvasData();

  // Performance monitoring effect
  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const loadTime = Date.now() - startTime;
      if (loadTime > 3000) {
        setPerformanceWarning(`Dashboard loaded in ${loadTime.toFixed(2)}ms (target: <3000ms)`);
      }
    };
  }, []);

  // Process dashboard data when Canvas data loads
  const processCanvasData = useCallback(() => {
    if (!courses || !assignments || !grades) return;

    const startTime = Date.now();
    setLoadingStatus('Processing dashboard data...');

    try {
      // Calculate dashboard statistics
      const stats: DashboardStats = {
        totalCourses: courses?.length || 0,
        activeAssignments: assignments?.filter(
          (a: CanvasAssignment) => a.due_at && new Date(a.due_at) > new Date()
        ).length || 0,
        averageGrade: grades?.length > 0 
          ? grades.reduce((sum: number, g: CanvasGrade) => sum + (g.score || 0), 0) / grades.length 
          : 0,
        upcomingDeadlines: assignments?.filter(
          (a: CanvasAssignment) => a.due_at && 
          new Date(a.due_at) > new Date() && 
          new Date(a.due_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ).length || 0
      };

      setDashboardStats(stats);
      
      // Mark critical data as loaded
      if (isLoadingCritical) {
        setIsLoadingCritical(false);
        setPerformanceMetrics(prev => ({
          ...prev,
          criticalDataTime: Date.now() - prev.loadStartTime
        }));
      }

      const processingTime = Date.now() - startTime;
      console.log(`Dashboard data processed in ${processingTime}ms`);
      
    } catch (error) {
      console.error('Error processing dashboard data:', error);
      setPerformanceWarning('Error processing dashboard data');
    }
  }, [courses, assignments, grades, isLoadingCritical]);

  // Update performance metrics when data changes
  useEffect(() => {
    if (isCached) {
      const cacheHitRate = Object.values(isCached).filter(Boolean).length / Object.values(isCached).length * 100;
      setPerformanceMetrics(prev => ({
        ...prev,
        cacheHitRate: cacheHitRate || 0,
        apiResponseTimes: [] // This would be populated by actual performance tracking
      }));
    }
  }, [isCached]);

  // Process data when it becomes available
  useEffect(() => {
    if (courses && assignments && grades && !loading) {
      processCanvasData();
    }
  }, [courses, assignments, grades, loading, processCanvasData]);

  // Background refresh setup
  useEffect(() => {
    if (backgroundRefresh) {
      const interval = setInterval(() => {
        backgroundRefresh();
      }, 5 * 60 * 1000); // Refresh every 5 minutes

      return () => clearInterval(interval);
    }
  }, [backgroundRefresh]);

  // Critical data timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoadingCritical) {
        setPerformanceWarning('Critical data load exceeded 5 second target');
        setLoadingStatus('Performance degraded - loading in fallback mode...');
      }
    }, CRITICAL_DATA_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [isLoadingCritical]);

  // Total load timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading || isLoadingCritical) {
        setPerformanceWarning('Dashboard load timeout - check backend performance');
      }
    }, DASHBOARD_LOAD_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [loading, isLoadingCritical]);

  // Performance badge component
  const PerformanceBadge = () => {
    const criticalTime = performanceMetrics.criticalDataTime;
    const avgResponseTime = performanceMetrics.apiResponseTimes.length > 0
      ? performanceMetrics.apiResponseTimes.reduce((a, b) => a + b, 0) / performanceMetrics.apiResponseTimes.length
      : 0;

    let badgeColor = 'bg-green-500';
    let status = 'Excellent';
    
    if (criticalTime && criticalTime > 3000) {
      badgeColor = 'bg-red-500';
      status = 'Slow';
    } else if (criticalTime && criticalTime > 1000) {
      badgeColor = 'bg-yellow-500';
      status = 'Good';
    }

    return (
      <div className="flex items-center space-x-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${badgeColor}`}></div>
        <span>Performance: {status}</span>
        {criticalTime && (
          <span className="text-muted-foreground">
            ({criticalTime}ms, {performanceMetrics.cacheHitRate.toFixed(1)}% cached)
          </span>
        )}
      </div>
    );
  };

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <span>Dashboard Error: {error.message}</span>
              <button 
                onClick={() => refetch()} 
                className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
            {performanceWarning && (
              <div className="mt-2 text-yellow-600 text-sm">
                Performance Warning: {performanceWarning}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state with performance indicators
  if (isLoadingCritical || !dashboardStats) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Loading skeleton with performance info */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dashboard Status</CardTitle>
              <Loader2 className="h-4 w-4 animate-spin" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-2">{loadingStatus}</div>
              <PerformanceBadge />
              {performanceWarning && (
                <div className="mt-2 text-yellow-600 text-xs">
                  ⚠️ {performanceWarning}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loading skeletons for other cards */}
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="p-6">
      {/* Performance warning banner */}
      {performanceWarning && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center space-x-2 text-yellow-800 text-sm">
            <Clock className="h-4 w-4" />
            <span>Performance Notice: {performanceWarning}</span>
          </div>
        </div>
      )}

      {/* Dashboard stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Active enrollments
            </p>
          </CardContent>
        </Card>

        {/* Active Assignments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Pending submissions
            </p>
          </CardContent>
        </Card>

        {/* Average Grade */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.averageGrade > 0 ? `${dashboardStats.averageGrade.toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dashboardStats.upcomingDeadlines}
            </div>
            <p className="text-xs text-muted-foreground">
              Upcoming deadlines
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance metrics footer */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <PerformanceBadge />
          <div className="text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
