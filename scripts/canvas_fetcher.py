#!/usr/bin/env python3
"""
Enhanced Canvas Data Fetcher with Backend Integration
Works with the new Canvas LMS Dashboard backend caching system
"""

import requests
import json
import sys
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

class CanvasDataFetcher:
    def __init__(self, canvas_url: str, api_token: str, verbose: bool = True):
        """
        Initialize the Canvas Data Fetcher
        
        Args:
            canvas_url: Canvas instance URL (e.g., https://yourschool.instructure.com)
            api_token: Canvas API token
            verbose: Whether to print detailed progress information
        """
        self.canvas_url = canvas_url.rstrip('/')
        self.api_token = api_token
        self.verbose = verbose
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json',
            'User-Agent': 'Canvas-LMS-Dashboard-Fetcher/1.0'
        })
        
        # Rate limiting
        self.last_request_time = 0
        self.min_request_interval = 0.1  # 100ms between requests
        
        # Statistics
        self.stats = {
            'courses_fetched': 0,
            'assignments_fetched': 0,
            'submissions_fetched': 0,
            'api_calls': 0,
            'errors': [],
            'start_time': datetime.now(),
            'end_time': None
        }
    
    def log(self, message: str, level: str = 'INFO'):
        """Log a message with timestamp"""
        if self.verbose:
            timestamp = datetime.now().strftime('%H:%M:%S')
            print(f"[{timestamp}] {level}: {message}")
    
    def rate_limit(self):
        """Implement rate limiting to be respectful to Canvas API"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.min_request_interval:
            sleep_time = self.min_request_interval - time_since_last
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
    
    def make_request(self, endpoint: str, params: Dict[str, Any] = None) -> Optional[List[Dict]]:
        """
        Make a request to Canvas API with error handling and rate limiting
        
        Args:
            endpoint: API endpoint (e.g., '/api/v1/courses')
            params: Query parameters
            
        Returns:
            Response data or None if failed
        """
        self.rate_limit()
        
        url = f"{self.canvas_url}{endpoint}"
        
        try:
            self.log(f"📡 API Call: {endpoint}")
            self.stats['api_calls'] += 1
            
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            error_msg = f"API request failed for {endpoint}: {str(e)}"
            self.log(error_msg, 'ERROR')
            self.stats['errors'].append(error_msg)
            return None
    
    def fetch_courses(self) -> List[Dict]:
        """Fetch all active courses"""
        self.log("📚 Fetching courses...")
        
        courses = self.make_request('/api/v1/courses', {
            'enrollment_state': 'active',
            'per_page': 100,
            'include[]': ['total_scores', 'syllabus_body', 'public_description']
        })
        
        if courses:
            self.stats['courses_fetched'] = len(courses)
            self.log(f"✅ Found {len(courses)} courses")
            
            # Log course details
            for course in courses:
                self.log(f"  📖 {course.get('name', 'Unknown')} ({course.get('course_code', 'No code')})")
        
        return courses or []
    
    def fetch_assignments(self, courses: List[Dict]) -> List[Dict]:
        """Fetch assignments for all courses"""
        self.log("📝 Fetching assignments...")
        
        all_assignments = []
        
        for course in courses:
            course_id = course['id']
            course_name = course.get('name', 'Unknown Course')
            
            self.log(f"  📂 Fetching assignments for: {course_name}")
            
            assignments = self.make_request(f'/api/v1/courses/{course_id}/assignments', {
                'per_page': 100,
                'include[]': ['submission']
            })
            
            if assignments:
                # Enrich assignments with course info
                for assignment in assignments:
                    assignment['course_name'] = course_name
                    assignment['course_code'] = course.get('course_code', '')
                    assignment['course_id'] = course_id
                
                all_assignments.extend(assignments)
                self.stats['assignments_fetched'] += len(assignments)
                self.log(f"    ✅ Found {len(assignments)} assignments")
            else:
                self.log(f"    ⚠️ No assignments found for {course_name}")
        
        self.log(f"📊 Total assignments fetched: {len(all_assignments)}")
        return all_assignments
    
    def fetch_submissions(self, courses: List[Dict]) -> List[Dict]:
        """Fetch submission data (grades) for all courses"""
        self.log("🎯 Fetching submissions/grades...")
        
        all_submissions = []
        
        for course in courses:
            course_id = course['id']
            course_name = course.get('name', 'Unknown Course')
            
            self.log(f"  📊 Fetching submissions for: {course_name}")
            
            submissions = self.make_request(f'/api/v1/courses/{course_id}/students/self/submissions', {
                'per_page': 100,
                'include[]': ['assignment']
            })
            
            if submissions:
                # Filter for graded submissions and enrich with course info
                graded_submissions = []
                for submission in submissions:
                    if submission.get('score') is not None and submission.get('assignment'):
                        submission['course_name'] = course_name
                        submission['course_code'] = course.get('course_code', '')
                        submission['course_id'] = course_id
                        graded_submissions.append(submission)
                
                all_submissions.extend(graded_submissions)
                self.stats['submissions_fetched'] += len(graded_submissions)
                self.log(f"    ✅ Found {len(graded_submissions)} graded submissions")
            else:
                self.log(f"    ⚠️ No submissions found for {course_name}")
        
        self.log(f"📈 Total submissions fetched: {len(all_submissions)}")
        return all_submissions
    
    def analyze_data(self, assignments: List[Dict], submissions: List[Dict]) -> Dict:
        """Analyze fetched data and generate insights"""
        self.log("🔍 Analyzing data...")
        
        now = datetime.now()
        next_week = now + timedelta(days=7)
        
        # Upcoming assignments
        upcoming = []
        overdue = []
        completed = []
        
        for assignment in assignments:
            if not assignment.get('due_at'):
                continue
                
            try:
                due_date = datetime.fromisoformat(assignment['due_at'].replace('Z', '+00:00'))
                
                # Check if submitted
                is_submitted = assignment.get('submission') and assignment['submission'].get('submitted_at')
                
                if is_submitted:
                    completed.append(assignment)
                elif due_date < now:
                    overdue.append(assignment)
                elif due_date <= next_week:
                    upcoming.append(assignment)
                    
            except (ValueError, TypeError):
                continue
        
        # Grade analysis
        if submissions:
            scores = [s['score'] for s in submissions if s.get('score') is not None]
            total_points = [s['assignment']['points_possible'] for s in submissions 
                          if s.get('assignment') and s['assignment'].get('points_possible')]
            
            avg_score = sum(scores) / len(scores) if scores else 0
            avg_points = sum(total_points) / len(total_points) if total_points else 0
            overall_percentage = (avg_score / avg_points * 100) if avg_points > 0 else 0
        else:
            avg_score = avg_points = overall_percentage = 0
        
        analysis = {
            'assignments': {
                'total': len(assignments),
                'upcoming': len(upcoming),
                'overdue': len(overdue),
                'completed': len(completed)
            },
            'grades': {
                'total_graded': len(submissions),
                'average_score': round(avg_score, 2),
                'average_points_possible': round(avg_points, 2),
                'overall_percentage': round(overall_percentage, 2)
            },
            'upcoming_assignments': upcoming[:10],  # Top 10 upcoming
            'overdue_assignments': overdue[:5]      # Top 5 overdue
        }
        
        self.log(f"📊 Analysis complete:")
        self.log(f"  📝 Total assignments: {analysis['assignments']['total']}")
        self.log(f"  ⏰ Upcoming (next 7 days): {analysis['assignments']['upcoming']}")
        self.log(f"  🚨 Overdue: {analysis['assignments']['overdue']}")
        self.log(f"  ✅ Completed: {analysis['assignments']['completed']}")
        self.log(f"  📈 Overall grade: {analysis['grades']['overall_percentage']:.1f}%")
        
        return analysis
    
    def fetch_all_data(self) -> Dict:
        """Fetch all Canvas data and return structured result"""
        self.log("🚀 Starting Canvas data fetch...")
        
        # Fetch courses
        courses = self.fetch_courses()
        if not courses:
            self.log("❌ No courses found or fetch failed", 'ERROR')
            return self.generate_result([], [], [])
        
        # Fetch assignments
        assignments = self.fetch_assignments(courses)
        
        # Fetch submissions
        submissions = self.fetch_submissions(courses)
        
        return self.generate_result(courses, assignments, submissions)
    
    def generate_result(self, courses: List[Dict], assignments: List[Dict], submissions: List[Dict]) -> Dict:
        """Generate final result with all data and analysis"""
        self.stats['end_time'] = datetime.now()
        duration = self.stats['end_time'] - self.stats['start_time']
        
        # Analyze data
        analysis = self.analyze_data(assignments, submissions)
        
        result = {
            'metadata': {
                'fetch_time': self.stats['end_time'].isoformat(),
                'duration_seconds': duration.total_seconds(),
                'canvas_url': self.canvas_url,
                'api_calls_made': self.stats['api_calls'],
                'errors': self.stats['errors']
            },
            'statistics': {
                'courses': len(courses),
                'assignments': len(assignments),
                'submissions': len(submissions)
            },
            'data': {
                'courses': courses,
                'assignments': assignments,
                'submissions': submissions
            },
            'analysis': analysis
        }
        
        self.log(f"🎉 Data fetch completed in {duration.total_seconds():.1f} seconds")
        self.log(f"📊 API calls made: {self.stats['api_calls']}")
        
        if self.stats['errors']:
            self.log(f"⚠️ Errors encountered: {len(self.stats['errors'])}", 'WARN')
        
        return result
    
    def save_to_file(self, data: Dict, filename: str = None) -> str:
        """Save data to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'canvas_data_{timestamp}.json'
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, default=str, ensure_ascii=False)
            
            self.log(f"💾 Data saved to: {filename}")
            return filename
            
        except Exception as e:
            error_msg = f"Failed to save data to {filename}: {str(e)}"
            self.log(error_msg, 'ERROR')
            raise Exception(error_msg)

def main():
    """Main function for command line usage"""
    if len(sys.argv) < 3:
        print("Enhanced Canvas Data Fetcher")
        print("Usage: python canvas_fetcher.py <canvas_url> <api_token> [options]")
        print("\nOptions:")
        print("  --quiet        : Minimize output")
        print("  --output FILE  : Save to specific file")
        print("  --format json  : Output format (json only for now)")
        print("\nExample:")
        print("  python canvas_fetcher.py https://school.instructure.com your_token_here")
        sys.exit(1)
    
    canvas_url = sys.argv[1]
    api_token = sys.argv[2]
    
    # Parse options
    verbose = '--quiet' not in sys.argv
    output_file = None
    
    if '--output' in sys.argv:
        output_index = sys.argv.index('--output')
        if output_index + 1 < len(sys.argv):
            output_file = sys.argv[output_index + 1]
    
    # Initialize fetcher
    fetcher = CanvasDataFetcher(canvas_url, api_token, verbose=verbose)
    
    try:
        # Fetch all data
        result = fetcher.fetch_all_data()
        
        # Save to file
        saved_file = fetcher.save_to_file(result, output_file)
        
        # Print summary
        print(f"\n📋 Fetch Summary:")
        print(f"  📚 Courses: {result['statistics']['courses']}")
        print(f"  📝 Assignments: {result['statistics']['assignments']}")
        print(f"  📊 Submissions: {result['statistics']['submissions']}")
        print(f"  ⏱️ Duration: {result['metadata']['duration_seconds']:.1f}s")
        print(f"  💾 Saved to: {saved_file}")
        
        if result['metadata']['errors']:
            print(f"  ⚠️ Errors: {len(result['metadata']['errors'])}")
        
        # Print upcoming assignments
        upcoming = result['analysis']['upcoming_assignments']
        if upcoming:
            print(f"\n🔔 Upcoming Assignments:")
            for assignment in upcoming[:5]:
                due_date = assignment.get('due_at', 'No due date')
                print(f"  • {assignment['name']} ({assignment['course_name']}) - Due: {due_date}")
        
    except Exception as e:
        print(f"\n❌ Fetch failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
