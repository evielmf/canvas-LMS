[20:02:28.731] Running build in Washington, D.C., USA (East) – iad1
[20:02:28.732] Build machine configuration: 2 cores, 8 GB
[20:02:28.752] Cloning github.com/evielmf/canvas-LMS (Branch: main, Commit: c6925c7)
[20:02:28.920] Previous build caches not available
[20:02:29.221] Cloning completed: 469.000ms
[20:02:31.163] Running "vercel build"
[20:02:31.573] Vercel CLI 46.0.2
[20:02:31.969] Installing dependencies...
[20:02:35.193] npm warn deprecated sourcemap-codec@1.4.8: Please use @jridgewell/sourcemap-codec instead
[20:02:35.267] npm warn deprecated rollup-plugin-terser@7.0.2: This package has been deprecated and is no longer maintained. Please use @rollup/plugin-terser
[20:02:35.291] npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
[20:02:35.509] npm warn deprecated workbox-google-analytics@6.6.0: It is not compatible with newer versions of GA starting with v4, as long as you are using GAv3 it should be ok, but the package is not longer being maintained
[20:02:35.554] npm warn deprecated workbox-cacheable-response@6.6.0: workbox-background-sync@6.6.0
[20:02:36.490] npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
[20:02:39.164] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[20:02:39.385] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[20:02:39.414] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[20:02:39.596] npm warn deprecated source-map@0.8.0-beta.0: The work that was done in this beta branch won't be included in future versions
[20:02:55.133] 
[20:02:55.133] added 804 packages in 23s
[20:02:55.135] 
[20:02:55.135] 186 packages are looking for funding
[20:02:55.136]   run `npm fund` for details
[20:02:55.319] Detected Next.js version: 15.4.5
[20:02:55.324] Running "npm run build"
[20:02:55.574] 
[20:02:55.574] > canvas-lms-dashboard@0.1.0 build
[20:02:55.574] > next build
[20:02:55.574] 
[20:02:57.187] Attention: Next.js now collects completely anonymous telemetry regarding usage.
[20:02:57.188] This information is used to shape Next.js' roadmap and prioritize features.
[20:02:57.188] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[20:02:57.189] https://nextjs.org/telemetry
[20:02:57.189] 
[20:02:57.237]    ▲ Next.js 15.4.5
[20:02:57.237]    - Environments: .env.local
[20:02:57.238]    - Experiments (use with caution):
[20:02:57.238]      · optimizePackageImports
[20:02:57.238] 
[20:02:57.319]    Creating an optimized production build ...
[20:02:57.687] > [PWA] Compile server
[20:02:57.690] > [PWA] Compile server
[20:02:57.691] > [PWA] Compile client (static)
[20:02:57.692] > [PWA] Auto register service worker with: /vercel/path0/node_modules/next-pwa/register.js
[20:02:57.692] > [PWA] Service worker: /vercel/path0/public/sw.js
[20:02:57.693] > [PWA]   url: /sw.js
[20:02:57.693] > [PWA]   scope: /
[20:03:28.141]  ✓ Compiled successfully in 30.0s
[20:03:28.149]    Linting and checking validity of types ...
[20:03:37.147] 
[20:03:37.152] Failed to compile.
[20:03:37.157] 
[20:03:37.160] ./app/api/analytics/grade-trends/route.ts
[20:03:37.161] 4:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.161] 
[20:03:37.161] ./app/api/analytics/study-sessions/route.ts
[20:03:37.161] 4:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.162] 
[20:03:37.162] ./app/api/analytics/weekly/route.ts
[20:03:37.162] 4:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.162] 
[20:03:37.162] ./app/api/canvas/all/route.ts
[20:03:37.162] 138:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.162] 
[20:03:37.163] ./app/api/canvas/assignments/route.ts
[20:03:37.163] 100:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.163] 
[20:03:37.163] ./app/api/canvas/auto-sync/route.ts
[20:03:37.163] 149:54  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.163] 186:33  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.164] 216:70  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.164] 246:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.164] 336:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.164] 348:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.165] 397:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.165] 
[20:03:37.165] ./app/api/canvas/clear-tokens/route.ts
[20:03:37.165] 5:21  Warning: 'response' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.165] 
[20:03:37.165] ./app/api/canvas/courses/route.ts
[20:03:37.176] 76:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.176] 
[20:03:37.177] ./app/api/canvas/fix-course-names/route.ts
[20:03:37.177] 4:28  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.177] 74:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.177] 115:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.177] 124:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.177] 155:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.183] 
[20:03:37.183] ./app/api/canvas/grades/route.ts
[20:03:37.184] 62:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.184] 64:13  Error: 'course' is never reassigned. Use 'const' instead.  prefer-const
[20:03:37.184] 129:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.184] 
[20:03:37.184] ./app/api/canvas/sync/route.ts
[20:03:37.184] 11:21  Warning: 'response' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.185] 38:20  Warning: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
[20:03:37.185] 123:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.187] 151:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.188] 177:68  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.188] 218:67  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.188] 283:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.188] 315:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.188] 
[20:03:37.189] ./app/api/debug/data/route.ts
[20:03:37.189] 4:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.189] 38:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.189] 
[20:03:37.189] ./app/api/debug/schema/route.ts
[20:03:37.189] 4:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.189] 
[20:03:37.189] ./app/api/schedule/route.ts
[20:03:37.190] 5:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.190] 33:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.190] 89:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.190] 143:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.190] 186:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.190] 
[20:03:37.190] ./app/api/sync/conflicts/[id]/ignore/route.ts
[20:03:37.191] 78:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.191] 
[20:03:37.191] ./app/api/sync/conflicts/[id]/resolve/route.ts
[20:03:37.191] 51:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.191] 90:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.191] 102:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.192] 102:61  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.192] 123:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.192] 152:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.192] 167:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.192] 
[20:03:37.192] ./app/api/sync/conflicts/route.ts
[20:03:37.192] 55:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.193] 55:56  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.193] 72:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.193] 144:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.193] 180:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.193] 192:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.194] 192:61  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.194] 209:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.195] 232:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.195] 245:25  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.195] 
[20:03:37.195] ./app/dashboard/analytics/page.tsx
[20:03:37.195] 17:13  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.195] 
[20:03:37.195] ./app/privacy/page.tsx
[20:03:37.195] 127:45  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.196] 142:74  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.196] 153:62  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.196] 153:75  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.196] 
[20:03:37.196] ./app/providers.tsx
[20:03:37.196] 62:86  Warning: 'session' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.196] 
[20:03:37.197] ./app/terms/page.tsx
[20:03:37.197] 34:51  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.197] 34:63  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.197] 95:76  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.197] 115:46  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.197] 120:62  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.197] 140:30  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.198] 180:81  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.198] 180:87  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.198] 182:43  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.198] 182:49  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.198] 190:37  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.198] 
[20:03:37.198] ./components/analytics/AnalyticsView.tsx
[20:03:37.198] 19:13  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.199] 
[20:03:37.199] ./components/analytics/CourseHealthGrid.tsx
[20:03:37.199] 3:27  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.199] 3:59  Warning: 'CheckCircle' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.199] 3:72  Warning: 'AlertTriangle' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.199] 5:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.199] 
[20:03:37.200] ./components/analytics/GradeTrendsChart.tsx
[20:03:37.200] 4:27  Warning: 'BarChart' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.200] 4:37  Warning: 'Bar' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.200] 4:122  Warning: 'Legend' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.200] 5:45  Warning: 'PieChartIcon' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.200] 164:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.200] 209:36  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.201] 
[20:03:37.201] ./components/analytics/SmartPatternInsights.tsx
[20:03:37.201] 6:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.201] 7:10  Warning: 'Tabs' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.201] 7:16  Warning: 'TabsContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.201] 7:29  Warning: 'TabsList' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.201] 7:39  Warning: 'TabsTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.202] 28:9  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.202] 225:13  Warning: 'afternoonStudy' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.202] 
[20:03:37.202] ./components/analytics/StudyConsistencyHeatmap.tsx
[20:03:37.202] 4:10  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.202] 4:37  Warning: 'TrendingUp' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.202] 101:9  Warning: 'maxActivity' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.202] 303:31  Warning: '_' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.203] 
[20:03:37.203] ./components/analytics/StudySessionModal.tsx
[20:03:37.203] 4:13  Warning: 'Play' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.203] 4:19  Warning: 'Pause' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.203] 5:10  Warning: 'Card' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.213] 5:16  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.213] 5:29  Warning: 'CardDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.213] 5:46  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.214] 5:58  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.214] 7:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.214] 
[20:03:37.214] ./components/analytics/TimeAllocationBreakdown.tsx
[20:03:37.214] 152:47  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.214] 245:42  Warning: 'index' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.214] 
[20:03:37.215] ./components/analytics/WeeklyProductivityCard.tsx
[20:03:37.215] 3:45  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.215] 70:20  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.215] 82:22  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.215] 
[20:03:37.215] ./components/assignments/AssignmentsView.tsx
[20:03:37.215] 6:3  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.216] 13:3  Warning: 'ExternalLink' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.216] 15:10  Warning: 'format' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.216] 21:10  Warning: 'AssignmentCardSkeleton' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.216] 22:10  Warning: 'AssignmentsLoading' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.216] 56:31  Warning: 'assignmentId' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.216] 61:35  Warning: 'assignmentId' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.216] 
[20:03:37.217] ./components/auth/AuthDebugPanel.tsx
[20:03:37.217] 32:15  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.222] 
[20:03:37.223] ./components/auth/AuthPage.tsx
[20:03:37.223] 11:10  Warning: 'mounted' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.223] 20:17  Warning: 'data' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.223] 20:23  Warning: 'error' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.223] 30:6  Warning: React Hook useEffect has a missing dependency: 'supabase.auth'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[20:03:37.223] 52:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.223] 293:57  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.224] 325:62  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.224] 325:91  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.224] 393:30  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.225] 449:88  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.225] 465:82  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.225] 
[20:03:37.225] ./components/dashboard/CanvasDataManager.tsx
[20:03:37.225] 8:10  Warning: 'toast' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.225] 
[20:03:37.225] ./components/dashboard/CanvasTokenSetup.tsx
[20:03:37.226] 17:17  Warning: 'supabase' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.226] 19:9  Warning: 'testCanvasConnection' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.226] 206:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.226] 247:29  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.226] 286:32  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.226] 286:54  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.226] 287:23  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.226] 287:40  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.227] 288:40  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.227] 288:58  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.227] 
[20:03:37.227] ./components/dashboard/DashboardNav.tsx
[20:03:37.227] 35:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.227] 96:15  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
[20:03:37.227] 
[20:03:37.228] ./components/dashboard/DashboardOverview.tsx
[20:03:37.228] 6:3  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.228] 10:3  Warning: 'AlertCircle' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.228] 12:3  Warning: 'Plus' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.228] 13:3  Warning: 'RefreshCw' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.228] 16:8  Warning: 'CanvasDataManager' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.228] 26:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.229] 64:31  Warning: 'assignmentId' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.229] 69:35  Warning: 'assignmentId' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.229] 108:46  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.229] 126:22  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.229] 272:22  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.229] 
[20:03:37.229] ./components/dashboard/DashboardOverviewOptimized.tsx
[20:03:37.230] 5:66  Warning: 'CanvasCourse' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.230] 5:80  Warning: 'CanvasGrade' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.230] 8:3  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.230] 12:3  Warning: 'AlertCircle' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.230] 14:3  Warning: 'Plus' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.230] 15:3  Warning: 'RefreshCw' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.230] 18:8  Warning: 'CanvasDataManager' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.231] 28:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.231] 61:12  Warning: 'parallelError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.231] 140:43  Warning: 'assignmentId' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.231] 145:47  Warning: 'assignmentId' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.231] 178:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.231] 201:46  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.231] 219:24  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.232] 359:24  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.232] 
[20:03:37.232] ./components/dashboard/GradeChart.tsx
[20:03:37.232] 4:86  Warning: 'BarChart' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.232] 4:96  Warning: 'Bar' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.232] 146:44  Warning: 'name' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.233] 150:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.233] 150:55  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.233] 
[20:03:37.233] ./components/dashboard/ManualSyncButton.tsx
[20:03:37.233] 5:44  Warning: 'AlertCircle' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.233] 
[20:03:37.233] ./components/dashboard/MobileAssignmentCard.tsx
[20:03:37.234] 5:10  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.234] 5:27  Warning: 'AlertTriangle' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.234] 
[20:03:37.234] ./components/dashboard/OptimizedDashboardOverview.tsx
[20:03:37.234] 10:25  Warning: 'CanvasCourse' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.234] 11:10  Warning: 'performanceTracker' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.234] 170:11  Warning: 'avgResponseTime' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.234] 
[20:03:37.235] ./components/dashboard/Sidebar.tsx
[20:03:37.235] 21:3  Warning: 'X' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.235] 61:18  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.235] 174:25  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
[20:03:37.235] 
[20:03:37.235] ./components/dashboard/SyncStatusWidget.tsx
[20:03:37.235] 5:31  Warning: 'Clock' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.236] 
[20:03:37.236] ./components/dashboard/UpcomingReminders.tsx
[20:03:37.236] 62:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.236] 
[20:03:37.236] ./components/grades/GradesView.tsx
[20:03:37.236] 5:10  Warning: 'GradesLoading' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.236] 13:3  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.237] 15:3  Warning: 'ExternalLink' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.237] 20:84  Warning: 'LineChart' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.237] 20:95  Warning: 'Line' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.237] 23:7  Warning: 'filterOptions' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.237] 28:7  Warning: 'COLORS' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.237] 31:11  Warning: 'assignments' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.237] 31:24  Warning: 'courses' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.239] 33:11  Warning: 'mappings' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.239] 35:10  Warning: 'selectedFilter' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.239] 35:26  Warning: 'setSelectedFilter' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.239] 65:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.239] 68:69  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.239] 100:9  Warning: 'recentGrades' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.240] 
[20:03:37.240] ./components/schedule/ScheduleView.tsx
[20:03:37.240] 76:10  Warning: 'showFilterModal' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.240] 76:27  Warning: 'setShowFilterModal' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.240] 119:15  Warning: 'data' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.240] 444:93  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.240] 624:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.241] 
[20:03:37.241] ./components/settings/CourseNameMappingManager.tsx
[20:03:37.241] 55:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.241] 64:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.241] 98:57  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.241] 98:72  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.241] 
[20:03:37.242] ./components/settings/SettingsView.tsx
[20:03:37.242] 8:3  Warning: 'Bell' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.242] 27:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.242] 78:41  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.242] 78:56  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.242] 102:53  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.242] 102:68  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.243] 109:61  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.243] 112:37  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.243] 112:52  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.243] 206:6  Warning: React Hook useEffect has a missing dependency: 'loadCanvasToken'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[20:03:37.243] 229:9  Warning: 'encryptToken' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.243] 248:9  Warning: 'decryptToken' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.244] 452:41  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.244] 484:22  Warning: 'assignmentsError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.244] 489:22  Warning: 'coursesError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.244] 510:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.244] 719:34  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[20:03:37.244] 756:40  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.245] 756:62  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.245] 757:31  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.245] 757:48  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.245] 758:48  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.245] 758:66  Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[20:03:37.245] 811:19  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
[20:03:37.246] 
[20:03:37.246] ./components/sync/SyncConflictIntegration.tsx
[20:03:37.246] 6:10  Warning: 'Card' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.246] 6:16  Warning: 'CardContent' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.246] 6:29  Warning: 'CardHeader' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.246] 6:41  Warning: 'CardTitle' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.247] 
[20:03:37.247] ./components/sync/SyncConflictResolver.tsx
[20:03:37.247] 62:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.247] 71:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.247] 83:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.247] 95:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.248] 303:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.248] 
[20:03:37.248] ./components/ui/BottomSheet.tsx
[20:03:37.248] 4:13  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.248] 4:21  Warning: 'ChevronDown' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.249] 
[20:03:37.249] ./components/ui/ChunkErrorBoundary.tsx
[20:03:37.249] 33:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.249] 
[20:03:37.249] ./components/ui/PullToRefresh.tsx
[20:03:37.250] 78:6  Warning: React Hook useEffect has missing dependencies: 'handleTouchEnd', 'handleTouchMove', and 'handleTouchStart'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[20:03:37.250] 
[20:03:37.250] ./components/ui/input.tsx
[20:03:37.250] 5:18  Warning: An interface declaring no members is equivalent to its supertype.  @typescript-eslint/no-empty-object-type
[20:03:37.250] 
[20:03:37.250] ./lib/background-sync.ts
[20:03:37.250] 1:10  Warning: 'createClient' is defined but never used.  @typescript-eslint/no-unused-vars
[20:03:37.251] 4:7  Warning: 'decryptToken' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.251] 87:32  Warning: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
[20:03:37.251] 119:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.251] 136:28  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.251] 
[20:03:37.251] ./lib/sync-conflict-detector.ts
[20:03:37.251] 10:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.252] 11:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.252] 46:11  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.252] 47:9  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.252] 77:31  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.252] 93:18  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.252] 94:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.253] 140:25  Warning: 'liveCourse' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.253] 159:22  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.253] 160:20  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.253] 213:29  Warning: 'liveAssignment' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[20:03:37.253] 257:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.253] 331:13  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[20:03:37.253] 
[20:03:37.254] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
[20:03:37.281] Error: Command "npm run build" exited with 1