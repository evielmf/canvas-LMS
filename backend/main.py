from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import ratemyprofessor
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Easeboard API",
    description="Backend API for Easeboard student dashboard",
    version="1.0.0"
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

class ProfessorResponse(BaseModel):
    """Response model for professor search"""
    success: bool
    professor: Optional[dict] = None
    error: Optional[str] = None

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Easeboard API is running", "status": "healthy"}

@app.get("/api/professor", response_model=ProfessorResponse)
async def search_professor(
    school_name: str = Query(..., description="Name of the school/university"),
    professor_name: str = Query(..., description="Name of the professor to search for")
):
    """
    Search for a professor on RateMyProfessor
    
    Args:
        school_name: The name of the school/university
        professor_name: The name of the professor
    
    Returns:
        Professor information including rating, difficulty, and other details
    """
    try:
        # Search for the school
        school = ratemyprofessor.get_school_by_name(school_name)
        
        if school is None:
            return ProfessorResponse(
                success=False,
                error=f"School '{school_name}' not found. Please check the spelling and try again."
            )
        
        # Search for the professor at the school
        professor = ratemyprofessor.get_professor_by_school_and_name(school, professor_name)
        
        if professor is None:
            return ProfessorResponse(
                success=False,
                error=f"Professor '{professor_name}' not found at {school_name}. They may not have ratings yet or the name might be misspelled."
            )
        
        # Build the response data
        professor_data = {
            "name": professor.name,
            "department": professor.department,
            "school": professor.school.name,
            "rating": round(professor.rating, 1) if professor.rating else "N/A",
            "difficulty": round(professor.difficulty, 1) if professor.difficulty else "N/A",
            "would_take_again": round(professor.would_take_again, 1) if professor.would_take_again is not None else "N/A",
            "num_ratings": professor.num_ratings,
        }
        
        return ProfessorResponse(
            success=True,
            professor=professor_data
        )
        
    except Exception as e:
        # Log the error (in production, use proper logging)
        print(f"Error searching for professor: {str(e)}")
        
        return ProfessorResponse(
            success=False,
            error="An unexpected error occurred while searching. Please try again."
        )

@app.get("/api/schools")
async def search_schools(name: str = Query(..., description="School name to search")):
    """
    Search for schools by name (for autocomplete functionality)
    """
    try:
        schools = ratemyprofessor.get_schools_by_name(name)
        
        if not schools:
            return {"success": False, "schools": [], "message": "No schools found"}
        
        # Limit results to top 10 for performance
        school_list = []
        for school in schools[:10]:
            school_list.append({
                "name": school.name,
                "state": getattr(school, 'state', 'N/A')
            })
        
        return {
            "success": True,
            "schools": school_list
        }
        
    except Exception as e:
        print(f"Error searching schools: {str(e)}")
        return {"success": False, "error": "Failed to search schools"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
