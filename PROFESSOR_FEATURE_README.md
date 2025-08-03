# 🎓 RateMyProfessor Integration for Easeboard

This feature adds professor rating search functionality to the Easeboard student dashboard, allowing students to search for professor ratings and reviews from RateMyProfessor.com.

## ✨ Features

- **Beautiful UI**: Clean, calming design that matches Easeboard's aesthetic
- **Real-time Search**: Search professors by school and name
- **Comprehensive Data**: Shows rating, difficulty, "would take again" percentage, and review count
- **Responsive Design**: Works perfectly on mobile and desktop
- **Error Handling**: Helpful error messages and loading states

## 🏗️ Architecture

### Backend (FastAPI)
- **Location**: `/backend/main.py`
- **API Endpoint**: `GET /api/professor?school_name=...&professor_name=...`
- **Package**: Uses `RateMyProfessorAPI` Python package
- **CORS**: Configured for Next.js frontend

### Frontend (Next.js + Tailwind + shadcn/ui)
- **Page**: `/app/dashboard/professor/page.tsx`
- **Component**: `/components/professor/ProfessorSearch.tsx`
- **Navigation**: Added to dashboard navigation

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
# Navigate to the project root
cd CANVAS-LMS-

# Install Python dependencies
pip install -r requirements.txt

# Or install individually:
pip install fastapi uvicorn RateMyProfessorAPI python-dotenv pydantic

# Start the FastAPI server
cd backend
python main.py
```

The backend will start on `http://localhost:8000`

### 2. Frontend Setup

The frontend is already integrated into the Next.js dashboard:

```bash
# Start the Next.js development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 3. Access the Feature

1. Open `http://localhost:3000` in your browser
2. Sign in to your Easeboard account
3. Navigate to "Professor" in the dashboard sidebar
4. Search for professors by entering:
   - School name (e.g., "University of California Berkeley")
   - Professor name (e.g., "John Smith")

## 📋 API Documentation

### Backend Endpoint

```
GET /api/professor
```

**Query Parameters:**
- `school_name` (required): Name of the school/university
- `professor_name` (required): Name of the professor

**Response:**
```json
{
  "success": true,
  "professor": {
    "name": "John Smith",
    "department": "Computer Science",
    "school": "University of California Berkeley",
    "rating": 4.2,
    "difficulty": 3.1,
    "would_take_again": 78.5,
    "num_ratings": 45
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Professor 'John Smith' not found at University of California Berkeley"
}
```

## 🎨 UI Components Used

- **shadcn/ui Components**: Button, Input, Card, Label
- **Icons**: Lucide React (Search, Star, TrendingUp, etc.)
- **Styling**: Tailwind CSS with custom Easeboard theme colors
- **Typography**: Font hierarchy matching Easeboard design system

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env` file in the backend directory:

```env
# Optional: Set CORS origins
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration

The frontend automatically detects the environment:
- **Development**: Uses `http://localhost:8000`
- **Production**: Uses `NEXT_PUBLIC_BACKEND_URL` environment variable

## 📱 Features Overview

### Search Form
- Two-field form (school name + professor name)
- Real-time validation
- Loading states with spinner
- Helpful placeholder text and tips

### Results Display
- **Overall Rating**: 1-5 scale with color coding
- **Difficulty Level**: 1-5 scale indicating course challenge
- **Would Take Again**: Percentage of students who'd retake
- **Review Count**: Number of student reviews
- **Summary**: Formatted description of the professor

### Error Handling
- Network connection errors
- Professor not found
- School not found
- Invalid input validation

### Mobile Responsive
- Responsive grid layout
- Touch-friendly buttons
- Optimized typography for small screens

## 🎯 Usage Tips

### For Best Results:
1. **Use exact school names**: "University of California Berkeley" not "UC Berkeley"
2. **Include full names**: "John Smith" not just "Smith"
3. **Try variations**: If first search fails, try middle initial or nickname
4. **Check spelling**: Ensure correct spelling of both school and professor names

### Common Issues:
- **School not found**: Try the official full name of the institution
- **Professor not found**: They might not have any ratings yet or use a different name
- **Network errors**: Ensure the FastAPI backend is running on port 8000

## 🔮 Future Enhancements

Possible improvements for future versions:

1. **Autocomplete**: School name suggestions as you type
2. **Multiple Results**: Show multiple professors with similar names
3. **Recent Searches**: Save and display recent professor searches
4. **Department Filter**: Filter by academic department
5. **Favorites**: Save favorite professors for quick access
6. **Detailed Reviews**: Show individual review snippets
7. **Comparison**: Compare multiple professors side by side

## 🛠️ Development Notes

### Code Structure
- Clean separation between API logic and UI components
- Error boundaries and loading states
- Responsive design principles
- Accessibility considerations (ARIA labels, keyboard navigation)

### Performance
- Debounced search to prevent API spam
- Efficient state management
- Optimized re-renders

### Security
- Input validation and sanitization
- CORS configuration
- Environment-based URL configuration

## 🎉 Success!

You now have a fully functional professor rating search feature integrated into your Easeboard dashboard! Students can make informed course decisions by researching professor ratings, difficulty levels, and student recommendations.

The feature maintains Easeboard's calm, peaceful aesthetic while providing valuable academic insights to help students succeed in their educational journey. ✨
