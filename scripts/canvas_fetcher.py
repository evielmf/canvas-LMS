#!/usr/bin/env python3
"""
Canvas API Data Fetcher
Simple Python script to fetch Canvas data directly
"""

import requests
import json
import sys
from datetime import datetime, timedelta

def fetch_canvas_data(canvas_url, api_token):
    """
    Fetch Canvas data using Python requests
    """
    # Remove trailing slash
    canvas_url = canvas_url.rstrip('/')
    
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json'
    }
    
    print(f"Testing Canvas connection to: {canvas_url}")
    
    try:
        # Test connection with courses
        courses_response = requests.get(
            f'{canvas_url}/api/v1/courses?enrollment_state=active&per_page=100',
            headers=headers,
            timeout=30
        )
        
        if courses_response.status_code != 200:
            print(f"❌ Failed to fetch courses: {courses_response.status_code}")
            print(f"Response: {courses_response.text}")
            return None
            
        courses = courses_response.json()
        print(f"✅ Successfully fetched {len(courses)} courses")
        
        # Fetch assignments for each course
        all_assignments = []
        for course in courses[:3]:  # Limit to first 3 courses for testing
            course_id = course['id']
            course_name = course['name']
            
            print(f"Fetching assignments for: {course_name}")
            
            assignments_response = requests.get(
                f'{canvas_url}/api/v1/courses/{course_id}/assignments?per_page=100&include[]=submission',
                headers=headers,
                timeout=30
            )
            
            if assignments_response.status_code == 200:
                assignments = assignments_response.json()
                print(f"  ✅ Found {len(assignments)} assignments")
                
                for assignment in assignments:
                    assignment['course_name'] = course_name
                    assignment['course_code'] = course.get('course_code', '')
                    
                all_assignments.extend(assignments)
            else:
                print(f"  ❌ Failed to fetch assignments: {assignments_response.status_code}")
        
        # Filter upcoming assignments
        upcoming = []
        now = datetime.now()
        next_week = now + timedelta(days=7)
        
        for assignment in all_assignments:
            if assignment.get('due_at'):
                try:
                    due_date = datetime.fromisoformat(assignment['due_at'].replace('Z', '+00:00'))
                    if now <= due_date <= next_week:
                        upcoming.append({
                            'name': assignment['name'],
                            'course': assignment['course_name'],
                            'due_at': assignment['due_at'],
                            'points_possible': assignment.get('points_possible'),
                            'html_url': assignment.get('html_url')
                        })
                except:
                    continue
        
        print(f"\n📋 Summary:")
        print(f"  Total courses: {len(courses)}")
        print(f"  Total assignments: {len(all_assignments)}")
        print(f"  Upcoming assignments (next 7 days): {len(upcoming)}")
        
        if upcoming:
            print(f"\n🔔 Upcoming assignments:")
            for assignment in upcoming:
                print(f"  • {assignment['name']} ({assignment['course']}) - Due: {assignment['due_at']}")
        
        return {
            'courses': courses,
            'assignments': all_assignments,
            'upcoming': upcoming
        }
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def main():
    if len(sys.argv) != 3:
        print("Usage: python canvas_fetcher.py <canvas_url> <api_token>")
        print("Example: python canvas_fetcher.py https://yourschool.instructure.com your_api_token")
        sys.exit(1)
    
    canvas_url = sys.argv[1]
    api_token = sys.argv[2]
    
    data = fetch_canvas_data(canvas_url, api_token)
    
    if data:
        # Save to file for debugging
        with open('canvas_data.json', 'w') as f:
            json.dump(data, f, indent=2, default=str)
        print(f"\n💾 Data saved to canvas_data.json")
    else:
        print("\n❌ Failed to fetch Canvas data")
        sys.exit(1)

if __name__ == "__main__":
    main()
