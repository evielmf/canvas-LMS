# 🚀 Canvas LMS Codebase Performance Audit Report
**Generated:** 2025-08-06 13:46:27
**Project Path:** `C:\Users\chipa\Downloads\CANVAS-LMS--2`

## 📊 Executive Summary

| Metric | Value |
|--------|-------|
| **Overall Score** | 73/100 |
| **Total Files Analyzed** | 110 |
| **Total Issues Found** | 453 |
| **Critical Issues** | 16 🔴 |
| **Warning Issues** | 106 🟡 |
| **Info Issues** | 331 🔵 |

🟡 **Fair** - Several performance improvements needed

## 🚨 Critical Issues Requiring Immediate Attention

### 📄 `components\analytics\AnalyticsView.tsx`
- 🔴 **Potential infinite useEffect loop**
  - 💡 *Suggestion:* Check dependencies array - avoid state/props that change every render
  - 📍 *Line:* 47

### 📄 `components\analytics\GradeTrendsChart.tsx`
- 🔴 **Potential infinite useEffect loop**
  - 💡 *Suggestion:* Check dependencies array - avoid state/props that change every render
  - 📍 *Line:* 22

### 📄 `components\analytics\SmartPatternInsights.tsx`
- 🔴 **Potential infinite useEffect loop**
  - 💡 *Suggestion:* Check dependencies array - avoid state/props that change every render
  - 📍 *Line:* 44

### 📄 `components\analytics\StudyConsistencyHeatmap.tsx`
- 🔴 **Potential infinite useEffect loop**
  - 💡 *Suggestion:* Check dependencies array - avoid state/props that change every render
  - 📍 *Line:* 25

### 📄 `components\analytics\TimeAllocationBreakdown.tsx`
- 🔴 **Potential infinite useEffect loop**
  - 💡 *Suggestion:* Check dependencies array - avoid state/props that change every render
  - 📍 *Line:* 42

### 📄 `components\assignments\AssignmentsView.tsx`
- 🔴 **Potential infinite useEffect loop**
  - 💡 *Suggestion:* Check dependencies array - avoid state/props that change every render
  - 📍 *Line:* 45

### 📄 `components\dashboard\AssignmentCard.tsx`
- 🔴 **Potential infinite useEffect loop**
  - 💡 *Suggestion:* Check dependencies array - avoid state/props that change every render
  - 📍 *Line:* 15

### 📄 `components\dashboard\AssignmentCard_new.tsx`
- 🔴 **Potential infinite useEffect loop**
  - 💡 *Suggestion:* Check dependencies array - avoid state/props that change every render
  - 📍 *Line:* 15

### 📄 `components\dashboard\CanvasDataManager.tsx`
- 🔴 **Potential infinite useEffect loop**
  - 💡 *Suggestion:* Check dependencies array - avoid state/props that change every render
  - 📍 *Line:* 33

### 📄 `components\dashboard\DashboardOverview.tsx`
- 🔴 **Potential infinite useEffect loop**
  - 💡 *Suggestion:* Check dependencies array - avoid state/props that change every render
  - 📍 *Line:* 38

### 📄 `components\dashboard\GradeChart.tsx`
- 🔴 **Potential infinite useEffect loop**
  - 💡 *Suggestion:* Check dependencies array - avoid state/props that change every render
  - 📍 *Line:* 15

### 📄 `components\dashboard\MobileAssignmentCard.tsx`
- 🔴 **Potential infinite useEffect loop**
  - 💡 *Suggestion:* Check dependencies array - avoid state/props that change every render
  - 📍 *Line:* 25

### 📄 `components\dashboard\UpcomingReminders.tsx`
- 🔴 **Potential infinite useEffect loop**
  - 💡 *Suggestion:* Check dependencies array - avoid state/props that change every render
  - 📍 *Line:* 70
- 🔴 **Potential infinite useEffect loop**
  - 💡 *Suggestion:* Check dependencies array - avoid state/props that change every render
  - 📍 *Line:* 205

### 📄 `components\schedule\ScheduleView.tsx`
- 🔴 **Potential infinite useEffect loop**
  - 💡 *Suggestion:* Check dependencies array - avoid state/props that change every render
  - 📍 *Line:* 104

### 📄 `hooks\useCanvasData.ts`
- 🔴 **Potential infinite useEffect loop**
  - 💡 *Suggestion:* Check dependencies array - avoid state/props that change every render
  - 📍 *Line:* 94

## 📉 Files Needing Most Attention

| File | Score | Issues | Size | Imports |
|------|-------|--------|------|---------|
| `app\api\canvas\auto-sync\route.ts` | 0/100 | 39 | 14.8KB | 4 |
| `app\api\canvas\sync\route.ts` | 0/100 | 30 | 11.9KB | 3 |
| `components\dashboard\CanvasTokenSetup.tsx` | 0/100 | 23 | 12.5KB | 4 |
| `components\settings\SettingsView.tsx` | 0/100 | 22 | 29.0KB | 7 |
| `hooks\useCanvasData.ts` | 0/100 | 19 | 11.7KB | 3 |
| `hooks\useDataPrefetch.ts` | 0/100 | 15 | 6.8KB | 3 |
| `hooks\useUniversalPrefetch.ts` | 0/100 | 14 | 5.9KB | 3 |
| `lib\background-sync.ts` | 0/100 | 26 | 6.8KB | 2 |
| `scripts\canvas_fetcher.py` | 0/100 | 19 | 14.5KB | 6 |
| `app\api\migrate\route.ts` | 5/100 | 19 | 8.6KB | 2 |

## 📋 Detailed File Analysis

### 📱 Frontend Files

#### 🔴 `app\api\canvas\auto-sync\route.ts` (0/100)
*Size: 14.8KB | Lines: 411 | Imports: 4*

- 🟡 **Large file size: 15,193 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*
- 🔵 **Console statement found** (Line 24)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 46)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 51)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 63)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 69)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 98)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 104)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 110)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 115)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 126)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 130)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 131)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 132)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 172)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 176)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 181)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 203)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 209)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 215)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 220)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 250)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 255)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 259)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 269)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 273)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 274)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 275)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 311)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 314)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 315)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 316)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 317)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 320)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 321)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 322)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 326)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 345)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 357)
  - 💡 *Remove console statements for production*

#### 🔴 `app\api\canvas\sync\route.ts` (0/100)
*Size: 11.9KB | Lines: 327 | Imports: 3*

- 🟡 **Large file size: 12,159 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*
- 🔵 **Console statement found** (Line 14)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 19)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 31)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 59)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 69)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 79)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 82)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 90)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 95)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 98)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 107)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 117)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 145)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 146)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 149)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 154)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 168)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 171)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 189)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 192)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 197)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 206)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 216)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 252)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 253)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 256)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 269)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 292)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 324)
  - 💡 *Remove console statements for production*

#### 🔴 `components\dashboard\CanvasTokenSetup.tsx` (0/100)
*Size: 12.5KB | Lines: 353 | Imports: 4*

- 🟡 **Fetch call without error handling** (Line 23)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 130)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Large file size: 12,818 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*
- 🔵 **Console statement found** (Line 21)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 33)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 39)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 42)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 64)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 75)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 95)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 109)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 119)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 120)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 121)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 122)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 141)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 149)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 169)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 177)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 181)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 184)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 187)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 200)
  - 💡 *Remove console statements for production*

#### 🔴 `components\settings\SettingsView.tsx` (0/100)
*Size: 29.0KB | Lines: 725 | Imports: 7*

- 🟡 **Fetch call without error handling** (Line 111)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 239)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Large file size: 29,661 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*
- 🔵 **Console statement found** (Line 64)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 82)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 102)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 109)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 124)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 127)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 149)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 160)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 192)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 211)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 212)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 213)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 214)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 226)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 230)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 254)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 258)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 278)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 331)
  - 💡 *Remove console statements for production*

#### 🔴 `hooks\useCanvasData.ts` (0/100)
*Size: 11.7KB | Lines: 369 | Imports: 3*

- 🔴 **Potential infinite useEffect loop** (Line 94)
  - 💡 *Check dependencies array - avoid state/props that change every render*
- 🟡 **Fetch call without error handling** (Line 184)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 185)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 186)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 225)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Large file size: 11,997 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*
- 🔵 **Console statement found** (Line 60)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 67)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 107)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 111)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 180)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 190)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 192)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 205)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 224)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 233)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 277)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 294)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 304)
  - 💡 *Remove console statements for production*

#### 🔴 `hooks\useDataPrefetch.ts` (0/100)
*Size: 6.8KB | Lines: 198 | Imports: 3*

- 🟡 **useEffect without error handling**
  - 💡 *Add try-catch blocks or error boundaries*
- 🟡 **Fetch call without error handling** (Line 11)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 40)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 52)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 64)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 100)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 110)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 125)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 135)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 150)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 160)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 175)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 185)
  - 💡 *Add .catch() or try-catch for error handling*
- 🔵 **Console statement found** (Line 32)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 73)
  - 💡 *Remove console statements for production*

#### 🔴 `hooks\useUniversalPrefetch.ts` (0/100)
*Size: 5.9KB | Lines: 177 | Imports: 3*

- 🟡 **Fetch call without error handling** (Line 11)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 46)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 56)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 74)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 84)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 118)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 128)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 138)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 150)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 154)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 158)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 162)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 166)
  - 💡 *Add .catch() or try-catch for error handling*
- 🔵 **Console statement found** (Line 30)
  - 💡 *Remove console statements for production*

#### 🔴 `lib\background-sync.ts` (0/100)
*Size: 6.8KB | Lines: 218 | Imports: 2*

- 🟡 **Fetch call without error handling** (Line 161)
  - 💡 *Add .catch() or try-catch for error handling*
- 🔵 **Console statement found** (Line 19)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 38)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 43)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 47)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 53)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 60)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 71)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 80)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 93)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 106)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 111)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 115)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 126)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 133)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 141)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 146)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 149)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 158)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 171)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 179)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 183)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 189)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 194)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 208)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 213)
  - 💡 *Remove console statements for production*

#### 🔴 `app\api\migrate\route.ts` (5/100)
*Size: 8.6KB | Lines: 185 | Imports: 2*

- 🔵 **Console statement found** (Line 18)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 21)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 25)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 28)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 39)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 43)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 53)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 57)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 76)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 79)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 100)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 103)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 138)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 141)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 149)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 152)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 169)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 171)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 179)
  - 💡 *Remove console statements for production*

#### 🔴 `components\dashboard\UpcomingReminders.tsx` (5/100)
*Size: 11.2KB | Lines: 334 | Imports: 5*

- 🔴 **Potential infinite useEffect loop** (Line 70)
  - 💡 *Check dependencies array - avoid state/props that change every render*
- 🔴 **Potential infinite useEffect loop** (Line 205)
  - 💡 *Check dependencies array - avoid state/props that change every render*
- 🟡 **Large file size: 11,429 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*
- 🔵 **Console statement found** (Line 29)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 32)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 45)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 54)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 63)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 92)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 231)
  - 💡 *Remove console statements for production*

#### 🔴 `components\dashboard\DashboardOverview.tsx` (15/100)
*Size: 15.8KB | Lines: 365 | Imports: 18*

- 🔴 **Potential infinite useEffect loop** (Line 38)
  - 💡 *Check dependencies array - avoid state/props that change every render*
- 🟡 **useEffect without error handling**
  - 💡 *Add try-catch blocks or error boundaries*
- 🟡 **Fetch call without error handling** (Line 44)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 50)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Large file size: 16,221 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*
- 🟡 **High import count: 18**
  - 💡 *Consider refactoring to reduce dependencies*

#### 🔴 `components\assignments\AssignmentsView.tsx` (30/100)
*Size: 13.6KB | Lines: 352 | Imports: 12*

- 🔴 **Potential infinite useEffect loop** (Line 45)
  - 💡 *Check dependencies array - avoid state/props that change every render*
- 🟡 **useEffect without error handling**
  - 💡 *Add try-catch blocks or error boundaries*
- 🟡 **Fetch call without error handling** (Line 51)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 66)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Large file size: 13,917 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*

#### 🔴 `components\dashboard\DashboardOverviewOptimized.tsx` (35/100)
*Size: 19.4KB | Lines: 460 | Imports: 18*

- 🟡 **Fetch call without error handling** (Line 111)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Large file size: 19,869 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*
- 🟡 **High import count: 18**
  - 💡 *Consider refactoring to reduce dependencies*
- 🔵 **Console statement found** (Line 92)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 105)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 115)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 118)
  - 💡 *Remove console statements for production*

#### 🔴 `components\schedule\ScheduleView.tsx` (35/100)
*Size: 29.7KB | Lines: 769 | Imports: 6*

- 🔴 **Potential infinite useEffect loop** (Line 104)
  - 💡 *Check dependencies array - avoid state/props that change every render*
- 🟡 **Large file size: 30,448 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*
- 🔵 **Console statement found** (Line 97)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 140)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 495)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 606)
  - 💡 *Remove console statements for production*

#### 🔴 `lib\sync-conflict-detector.ts` (35/100)
*Size: 10.1KB | Lines: 371 | Imports: 0*

- 🟡 **Large file size: 10,345 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*
- 🔵 **Console statement found** (Line 265)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 313)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 316)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 319)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 324)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 339)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 362)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 365)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 369)
  - 💡 *Remove console statements for production*

#### 🔴 `components\sync\SyncConflictResolver.tsx` (40/100)
*Size: 12.3KB | Lines: 388 | Imports: 8*

- 🟡 **Large file size: 12,623 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*
- 🔵 **Console statement found** (Line 61)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 63)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 70)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 72)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 82)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 84)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 94)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 96)
  - 💡 *Remove console statements for production*

#### 🔴 `hooks\useSyncConflicts.ts` (40/100)
*Size: 5.6KB | Lines: 199 | Imports: 2*

- 🟡 **Fetch call without error handling** (Line 44)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 58)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 79)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 96)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 124)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 184)
  - 💡 *Add .catch() or try-catch for error handling*

#### 🔴 `utils\performance-optimization.ts` (40/100)
*Size: 8.4KB | Lines: 301 | Imports: 1*

- 🟡 **Fetch call without error handling** (Line 95)
  - 💡 *Add .catch() or try-catch for error handling*
- 🔵 **Console statement found** (Line 48)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 52)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 176)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 206)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 209)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 215)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 227)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 244)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 248)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 300)
  - 💡 *Remove console statements for production*

#### 🔴 `components\auth\AuthPage.tsx` (45/100)
*Size: 28.9KB | Lines: 509 | Imports: 4*

- 🟡 **Large file size: 29,643 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*
- 🔵 **Console statement found** (Line 22)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 24)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 35)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 45)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 48)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 53)
  - 💡 *Remove console statements for production*

#### 🔴 `hooks\useCanvasSync.ts` (45/100)
*Size: 6.5KB | Lines: 225 | Imports: 4*

- 🟡 **Fetch call without error handling** (Line 39)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 54)
  - 💡 *Add .catch() or try-catch for error handling*
- 🔵 **Console statement found** (Line 93)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 106)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 117)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 135)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 145)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 151)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 155)
  - 💡 *Remove console statements for production*

#### 🔴 `app\api\sync\conflicts\route.ts` (50/100)
*Size: 8.0KB | Lines: 262 | Imports: 2*

- 🔵 **Console statement found** (Line 42)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 73)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 111)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 122)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 145)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 164)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 171)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 181)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 206)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 229)
  - 💡 *Remove console statements for production*

#### 🔴 `app\api\canvas\test\route.ts` (50/100)
*Size: 6.9KB | Lines: 217 | Imports: 4*

- 🟡 **Fetch call without error handling** (Line 97)
  - 💡 *Add .catch() or try-catch for error handling*
- 🔵 **Console statement found** (Line 77)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 91)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 133)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 138)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 156)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 168)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 182)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 206)
  - 💡 *Remove console statements for production*

#### 🔴 `components\analytics\SmartPatternInsights.tsx` (50/100)
*Size: 13.7KB | Lines: 378 | Imports: 6*

- 🔴 **Potential infinite useEffect loop** (Line 44)
  - 💡 *Check dependencies array - avoid state/props that change every render*
- 🟡 **useEffect without error handling**
  - 💡 *Add try-catch blocks or error boundaries*
- 🟡 **Large file size: 13,978 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*

#### 🔴 `components\analytics\StudyConsistencyHeatmap.tsx` (50/100)
*Size: 12.2KB | Lines: 329 | Imports: 5*

- 🔴 **Potential infinite useEffect loop** (Line 25)
  - 💡 *Check dependencies array - avoid state/props that change every render*
- 🟡 **useEffect without error handling**
  - 💡 *Add try-catch blocks or error boundaries*
- 🟡 **Large file size: 12,453 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*

#### 🔴 `components\analytics\TimeAllocationBreakdown.tsx` (50/100)
*Size: 10.2KB | Lines: 309 | Imports: 4*

- 🔴 **Potential infinite useEffect loop** (Line 42)
  - 💡 *Check dependencies array - avoid state/props that change every render*
- 🟡 **Heavy import: recharts**
  - 💡 *Consider dynamic import for recharts: dynamic(() => import("recharts"))*
- 🟡 **Large file size: 10,394 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*

#### 🟡 `components\dashboard\GradeChart.tsx` (60/100)
*Size: 7.7KB | Lines: 199 | Imports: 4*

- 🔴 **Potential infinite useEffect loop** (Line 15)
  - 💡 *Check dependencies array - avoid state/props that change every render*
- 🟡 **useEffect without error handling**
  - 💡 *Add try-catch blocks or error boundaries*
- 🟡 **Heavy import: recharts**
  - 💡 *Consider dynamic import for recharts: dynamic(() => import("recharts"))*

#### 🟡 `components\dashboard\OptimizedDashboardOverview.tsx` (60/100)
*Size: 11.9KB | Lines: 351 | Imports: 5*

- 🟡 **Fetch call without error handling** (Line 207)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Large file size: 12,175 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*
- 🔵 **Console statement found** (Line 106)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 109)
  - 💡 *Remove console statements for production*

#### 🟡 `components\dashboard\Sidebar.tsx` (60/100)
*Size: 13.7KB | Lines: 308 | Imports: 8*

- 🟡 **Fetch call without error handling** (Line 41)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 230)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Large file size: 14,019 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*

#### 🟡 `hooks\useAnalyticsData.ts` (60/100)
*Size: 4.4KB | Lines: 170 | Imports: 2*

- 🟡 **Fetch call without error handling** (Line 70)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 91)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 112)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 137)
  - 💡 *Add .catch() or try-catch for error handling*

#### 🟡 `app\api\sync\conflicts\[id]\resolve\route.ts` (65/100)
*Size: 5.7KB | Lines: 182 | Imports: 2*

- 🔵 **Console statement found** (Line 41)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 52)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 70)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 77)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 91)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 119)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 148)
  - 💡 *Remove console statements for production*

#### 🟡 `components\dashboard\CanvasDataManager.tsx` (65/100)
*Size: 4.3KB | Lines: 135 | Imports: 6*

- 🔴 **Potential infinite useEffect loop** (Line 33)
  - 💡 *Check dependencies array - avoid state/props that change every render*
- 🟡 **useEffect without error handling**
  - 💡 *Add try-catch blocks or error boundaries*
- 🔵 **Console statement found** (Line 39)
  - 💡 *Remove console statements for production*

#### 🟡 `components\dashboard\MobileBottomNav.tsx` (65/100)
*Size: 2.7KB | Lines: 79 | Imports: 4*

- 🟡 **Fetch call without error handling** (Line 22)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 55)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 56)
  - 💡 *Add .catch() or try-catch for error handling*
- 🔵 **Console statement found** (Line 38)
  - 💡 *Remove console statements for production*

#### 🟡 `app\api\canvas\course-mapping\route.ts` (70/100)
*Size: 4.3KB | Lines: 138 | Imports: 2*

- 🔵 **Console statement found** (Line 21)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 36)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 71)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 89)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 118)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 135)
  - 💡 *Remove console statements for production*

#### 🟡 `components\analytics\GradeTrendsChart.tsx` (70/100)
*Size: 9.3KB | Lines: 257 | Imports: 4*

- 🔴 **Potential infinite useEffect loop** (Line 22)
  - 💡 *Check dependencies array - avoid state/props that change every render*
- 🟡 **Heavy import: recharts**
  - 💡 *Consider dynamic import for recharts: dynamic(() => import("recharts"))*

#### 🟡 `components\dashboard\AssignmentCard.tsx` (70/100)
*Size: 3.4KB | Lines: 100 | Imports: 4*

- 🔴 **Potential infinite useEffect loop** (Line 15)
  - 💡 *Check dependencies array - avoid state/props that change every render*
- 🟡 **useEffect without error handling**
  - 💡 *Add try-catch blocks or error boundaries*

#### 🟡 `components\dashboard\AssignmentCard_new.tsx` (70/100)
*Size: 3.0KB | Lines: 98 | Imports: 4*

- 🔴 **Potential infinite useEffect loop** (Line 15)
  - 💡 *Check dependencies array - avoid state/props that change every render*
- 🟡 **useEffect without error handling**
  - 💡 *Add try-catch blocks or error boundaries*

#### 🟡 `components\dashboard\MobileAssignmentCard.tsx` (70/100)
*Size: 7.0KB | Lines: 223 | Imports: 4*

- 🔴 **Potential infinite useEffect loop** (Line 25)
  - 💡 *Check dependencies array - avoid state/props that change every render*
- 🟡 **useEffect without error handling**
  - 💡 *Add try-catch blocks or error boundaries*

#### 🟡 `components\grades\GradesView.tsx` (70/100)
*Size: 15.7KB | Lines: 392 | Imports: 9*

- 🟡 **Heavy import: recharts**
  - 💡 *Consider dynamic import for recharts: dynamic(() => import("recharts"))*
- 🟡 **Large file size: 16,032 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*

#### 🟡 `hooks\useCourseNameMappings.ts` (70/100)
*Size: 3.0KB | Lines: 100 | Imports: 3*

- 🟡 **Fetch call without error handling** (Line 20)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 43)
  - 💡 *Add .catch() or try-catch for error handling*
- 🟡 **Fetch call without error handling** (Line 69)
  - 💡 *Add .catch() or try-catch for error handling*

#### 🟡 `app\api\canvas\assignments\route.ts` (75/100)
*Size: 3.5KB | Lines: 103 | Imports: 2*

- 🔵 **Console statement found** (Line 8)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 13)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 25)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 61)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 97)
  - 💡 *Remove console statements for production*

#### 🟡 `app\api\canvas\courses\route.ts` (75/100)
*Size: 2.5KB | Lines: 82 | Imports: 2*

- 🔵 **Console statement found** (Line 8)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 13)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 25)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 40)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 76)
  - 💡 *Remove console statements for production*

#### 🟡 `components\dashboard\DashboardClientWrapper.tsx` (75/100)
*Size: 0.8KB | Lines: 25 | Imports: 2*

- 🟡 **useEffect without error handling**
  - 💡 *Add try-catch blocks or error boundaries*
- 🟡 **Fetch call without error handling** (Line 11)
  - 💡 *Add .catch() or try-catch for error handling*
- 🔵 **Console statement found** (Line 18)
  - 💡 *Remove console statements for production*

#### 🟢 `app\privacy\page.tsx` (80/100)
*Size: 9.9KB | Lines: 191 | Imports: 2*

- 🟡 **Large file size: 10,093 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*

#### 🟢 `app\terms\page.tsx` (80/100)
*Size: 15.1KB | Lines: 290 | Imports: 2*

- 🟡 **Large file size: 15,422 bytes**
  - 💡 *Consider splitting into smaller components or using dynamic imports*

#### 🟢 `app\auth\callback\route.ts` (80/100)
*Size: 1.6KB | Lines: 45 | Imports: 2*

- 🔵 **Console statement found** (Line 15)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 21)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 34)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 38)
  - 💡 *Remove console statements for production*

#### 🟢 `app\api\sync\conflicts\[id]\ignore\route.ts` (80/100)
*Size: 2.4KB | Lines: 85 | Imports: 2*

- 🔵 **Console statement found** (Line 41)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 58)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 65)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 79)
  - 💡 *Remove console statements for production*

#### 🟢 `app\api\canvas\grades\route.ts` (80/100)
*Size: 2.6KB | Lines: 81 | Imports: 2*

- 🔵 **Console statement found** (Line 11)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 24)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 47)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 73)
  - 💡 *Remove console statements for production*

#### 🟢 `app\api\analytics\study-sessions\route.ts` (80/100)
*Size: 2.6KB | Lines: 88 | Imports: 2*

- 🔵 **Console statement found** (Line 24)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 31)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 75)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 82)
  - 💡 *Remove console statements for production*

#### 🟢 `components\analytics\AnalyticsView.tsx` (80/100)
*Size: 8.0KB | Lines: 231 | Imports: 12*

- 🔴 **Potential infinite useEffect loop** (Line 47)
  - 💡 *Check dependencies array - avoid state/props that change every render*

#### 🟢 `app\providers.tsx` (85/100)
*Size: 2.9KB | Lines: 95 | Imports: 5*

- 🔵 **Console statement found** (Line 42)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 53)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 69)
  - 💡 *Remove console statements for production*

#### 🟢 `app\api\canvas\clear-tokens\route.ts` (85/100)
*Size: 1.1KB | Lines: 32 | Imports: 2*

- 🔵 **Console statement found** (Line 21)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 25)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 29)
  - 💡 *Remove console statements for production*

#### 🟢 `components\analytics\StudySessionModal.tsx` (85/100)
*Size: 7.9KB | Lines: 228 | Imports: 7*

- 🟡 **Fetch call without error handling** (Line 44)
  - 💡 *Add .catch() or try-catch for error handling*
- 🔵 **Console statement found** (Line 74)
  - 💡 *Remove console statements for production*

#### 🟢 `components\dashboard\SyncStatusWidget.tsx` (85/100)
*Size: 5.2KB | Lines: 157 | Imports: 3*

- 🟡 **useEffect without error handling**
  - 💡 *Add try-catch blocks or error boundaries*
- 🔵 **Console statement found** (Line 27)
  - 💡 *Remove console statements for production*

#### 🟢 `app\dashboard\layout.tsx` (90/100)
*Size: 1.5KB | Lines: 59 | Imports: 5*

- 🔵 **Console statement found** (Line 21)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 56)
  - 💡 *Remove console statements for production*

#### 🟢 `components\dashboard\FloatingActionButton.tsx` (90/100)
*Size: 3.2KB | Lines: 100 | Imports: 2*

- 🟡 **useEffect without error handling**
  - 💡 *Add try-catch blocks or error boundaries*

#### 🟢 `components\ui\BottomSheet.tsx` (90/100)
*Size: 2.1KB | Lines: 76 | Imports: 2*

- 🟡 **useEffect without error handling**
  - 💡 *Add try-catch blocks or error boundaries*

#### 🟢 `components\ui\ChunkErrorBoundary.tsx` (90/100)
*Size: 2.8KB | Lines: 83 | Imports: 1*

- 🔵 **Console statement found** (Line 36)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 37)
  - 💡 *Remove console statements for production*

#### 🟢 `hooks\useCanvasToken.ts` (90/100)
*Size: 1.0KB | Lines: 50 | Imports: 2*

- 🔵 **Console statement found** (Line 29)
  - 💡 *Remove console statements for production*
- 🔵 **Console statement found** (Line 35)
  - 💡 *Remove console statements for production*

#### 🟢 `next.config.js` (90/100)
*Size: 2.1KB | Lines: 90 | Imports: 0*

- 🔵 **Missing compression settings**
  - 💡 *Add compress configuration for better performance*
- 🔵 **Consider enabling SWC minification**
  - 💡 *Add swcMinify configuration for better performance*

#### 🟢 `app\api\debug\schema\route.ts` (95/100)
*Size: 1.3KB | Lines: 44 | Imports: 2*

- 🔵 **Console statement found** (Line 41)
  - 💡 *Remove console statements for production*

#### 🟢 `app\api\canvas\debug\route.ts` (95/100)
*Size: 1.5KB | Lines: 64 | Imports: 2*

- 🔵 **Console statement found** (Line 55)
  - 💡 *Remove console statements for production*

#### 🟢 `app\api\analytics\course-health\route.ts` (95/100)
*Size: 2.8KB | Lines: 82 | Imports: 2*

- 🔵 **Console statement found** (Line 76)
  - 💡 *Remove console statements for production*

#### 🟢 `app\api\analytics\grade-trends\route.ts` (95/100)
*Size: 3.1KB | Lines: 90 | Imports: 2*

- 🔵 **Console statement found** (Line 84)
  - 💡 *Remove console statements for production*

#### 🟢 `app\api\analytics\weekly\route.ts` (95/100)
*Size: 2.4KB | Lines: 78 | Imports: 2*

- 🔵 **Console statement found** (Line 72)
  - 💡 *Remove console statements for production*

#### 🟢 `components\auth\AuthDebugPanel.tsx` (95/100)
*Size: 1.2KB | Lines: 43 | Imports: 3*

- 🔵 **Console statement found** (Line 21)
  - 💡 *Remove console statements for production*

#### 🟢 `components\ui\PullToRefresh.tsx` (95/100)
*Size: 3.5KB | Lines: 119 | Imports: 2*

- 🔵 **Console statement found** (Line 58)
  - 💡 *Remove console statements for production*

### 🔧 Backend Files

#### 🔴 `scripts\canvas_fetcher.py` (0/100)
*Size: 14.5KB | Lines: 387 | Imports: 6*

- 🔵 **Print statement found** (Line 53)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 331)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 332)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 333)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 334)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 335)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 336)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 337)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 338)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 364)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 365)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 366)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 367)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 368)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 369)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 372)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 377)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 380)
  - 💡 *Use logging instead of print statements*
- 🔵 **Print statement found** (Line 383)
  - 💡 *Use logging instead of print statements*

#### 🟡 `backend\main-simplified.py` (65/100)
*Size: 8.2KB | Lines: 232 | Imports: 12*

- 🟡 **Synchronous HTTP call** (Line 74)
  - 💡 *Use async/await with httpx for better performance*
- 🔵 **GET route without caching** (Line 113)
  - 💡 *Consider adding caching decorator for GET endpoints*
- 🔵 **GET route without caching** (Line 132)
  - 💡 *Consider adding caching decorator for GET endpoints*
- 🔵 **GET route without caching** (Line 142)
  - 💡 *Consider adding caching decorator for GET endpoints*
- 🔵 **GET route without caching** (Line 152)
  - 💡 *Consider adding caching decorator for GET endpoints*
- 🔵 **GET route without caching** (Line 162)
  - 💡 *Consider adding caching decorator for GET endpoints*

#### 🟢 `backend\main.py` (85/100)
*Size: 13.1KB | Lines: 396 | Imports: 13*

- 🔵 **GET route without caching** (Line 229)
  - 💡 *Consider adding caching decorator for GET endpoints*

### ⚙️ Configuration Files

#### 🟢 `next.config.js` (90/100)
*Size: 2.1KB | Lines: 90 | Imports: 0*

- 🔵 **Missing compression settings**
  - 💡 *Add compress configuration for better performance*
- 🔵 **Consider enabling SWC minification**
  - 💡 *Add swcMinify configuration for better performance*

## 💡 Strategic Recommendations

### 🚨 Immediate Actions Required:
1. **Fix all critical issues** - These can cause runtime errors or severe performance problems
2. **Implement error boundaries** - Add proper error handling throughout the application
3. **Review useEffect dependencies** - Fix infinite loops and missing dependencies

### ⚡ Performance Optimizations:
1. **Implement dynamic imports** - For heavy components and libraries
2. **Add caching layers** - For API routes and expensive computations
3. **Optimize bundle size** - Replace heavy dependencies with lighter alternatives
4. **Add proper async/await** - For all HTTP calls and database operations

### 🎯 Long-term Improvements:
1. **Code splitting** - Break large components into smaller, focused modules
2. **Performance monitoring** - Add metrics collection for real-time monitoring
3. **Automated testing** - Implement performance regression tests
4. **Documentation** - Document performance-critical code paths

---
*Generated by Canvas LMS Codebase Auditor*
