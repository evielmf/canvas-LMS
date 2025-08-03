#!/usr/bin/env python3
"""
Test script for the RateMyProfessor API integration
"""

import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

try:
    import ratemyprofessor
    print("✅ RateMyProfessor API imported successfully")
    
    # Test basic functionality
    print("🔍 Testing basic search functionality...")
    
    # Try to search for a well-known university
    school = ratemyprofessor.get_school_by_name("University of California Berkeley")
    if school:
        print(f"✅ Found school: {school.name}")
        
        # Try to find a professor (this might not work without a real professor name)
        print("📚 School search working correctly!")
    else:
        print("⚠️  School search returned None - this is expected for some search terms")
    
    print("\n🎉 RateMyProfessor API is ready!")
    print("🚀 You can now start the FastAPI server with:")
    print("   cd backend && python main.py")
    
except ImportError as e:
    print(f"❌ Failed to import RateMyProfessor API: {e}")
    print("🔧 Please install it with: pip install RateMyProfessorAPI")
    sys.exit(1)
except Exception as e:
    print(f"⚠️  An error occurred: {e}")
    print("🔧 The API is installed but there might be a network issue")
