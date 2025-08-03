# 🤖 AI Integration Plan for Easeboard

## 🎯 Overview
This plan outlines how to integrate AI capabilities into Easeboard to enhance the student experience with intelligent study assistance, assignment help, and academic insights.

## 📊 Current Architecture Analysis

### ✅ Strengths for AI Integration
- **Rich Data Sources**: Canvas assignments, grades, courses, professor ratings
- **Modern Tech Stack**: Next.js, FastAPI, TypeScript, React Query
- **Scalable Database**: Supabase with real-time capabilities
- **Beautiful UI**: Tailwind + shadcn/ui components ready for chat interfaces
- **Security**: Already handling sensitive data with encryption

### 🔧 Required Additions
- OpenAI API integration
- Vector database for RAG (Retrieval Augmented Generation)
- AI context management system
- Token usage tracking
- Rate limiting for AI requests

## 🚀 Implementation Phases

### Phase 1: AI Study Assistant (4-6 weeks)
**Goal**: Add an AI chatbot that helps with study planning and assignment guidance

#### Backend Changes
```python
# backend/ai_service.py
from openai import OpenAI
import json

class StudyAssistant:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    def get_assignment_help(self, assignment_data, user_question):
        context = self.build_context(assignment_data)
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful study assistant..."},
                {"role": "user", "content": f"Assignment: {context}\nQuestion: {user_question}"}
            ]
        )
        return response.choices[0].message.content
```

#### Frontend Changes
```typescript
// components/ai/StudyChat.tsx
'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function StudyChat({ assignment }: { assignment: CanvasAssignment }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: assignment.id,
          message: input,
          context: 'assignment_help'
        })
      })
      const data = await response.json()
      setMessages(prev => [...prev, 
        { role: 'user', content: input },
        { role: 'assistant', content: data.response }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <h3 className="text-lg font-semibold text-blue-800 mb-4">
        📚 AI Study Assistant
      </h3>
      
      <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded-lg ${
            msg.role === 'user' 
              ? 'bg-blue-100 ml-8' 
              : 'bg-white mr-8'
          }`}>
            <p className="text-sm">{msg.content}</p>
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about this assignment..."
          className="flex-1"
        />
        <Button 
          onClick={sendMessage} 
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? '🤔' : '📤'}
        </Button>
      </div>
    </Card>
  )
}
```

#### API Routes
```typescript
// app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/api'
import { StudyAssistant } from '@/lib/ai/study-assistant'

export async function POST(request: NextRequest) {
  const { supabase, response } = createClient(request)
  const assistant = new StudyAssistant()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { assignment_id, message, context } = await request.json()
    
    // Get assignment data
    const { data: assignment } = await supabase
      .from('canvas_assignments_cache')
      .select('*')
      .eq('user_id', user.id)
      .eq('canvas_assignment_id', assignment_id)
      .single()
    
    // Generate AI response
    const aiResponse = await assistant.getAssignmentHelp(assignment, message)
    
    // Log conversation for future training
    await supabase.from('ai_conversations').insert({
      user_id: user.id,
      assignment_id: assignment_id,
      user_message: message,
      ai_response: aiResponse,
      context: context
    })
    
    return NextResponse.json({ 
      response: aiResponse,
      success: true 
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'AI service unavailable',
      details: error.message 
    }, { status: 500 })
  }
}
```

### Phase 2: Smart Study Planner (6-8 weeks)
**Goal**: AI-generated study schedules based on assignments, grades, and available time

#### Features
- **Personalized Study Plans**: Based on assignment due dates and difficulty
- **Time Management**: Optimal study session scheduling
- **Priority Matrix**: Urgent vs Important assignment classification
- **Progress Tracking**: Adaptive plans based on completion rates

### Phase 3: Grade Predictor & Academic Insights (8-10 weeks)
**Goal**: Predictive analytics for academic performance

#### Features
- **Grade Predictions**: ML models based on historical data
- **Risk Assessment**: Early warning for struggling courses
- **Improvement Suggestions**: Targeted study recommendations
- **Performance Analytics**: Detailed academic insights

## 💾 Database Schema Additions

```sql
-- AI conversation history
CREATE TABLE ai_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    assignment_id INTEGER,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    context TEXT, -- 'assignment_help', 'study_plan', 'grade_prediction'
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI usage tracking
CREATE TABLE ai_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    feature_type TEXT NOT NULL, -- 'chat', 'study_plan', 'grade_prediction'
    tokens_used INTEGER NOT NULL,
    cost_cents INTEGER, -- Track costs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study plans generated by AI
CREATE TABLE ai_study_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_data JSONB NOT NULL, -- Structured study plan
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'abandoned'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Technical Requirements

### Environment Variables
```bash
# Add to .env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=... # Optional, for Claude integration
AI_MODEL_PRIMARY=gpt-4
AI_MODEL_FALLBACK=gpt-3.5-turbo
MAX_TOKENS_PER_REQUEST=2000
DAILY_AI_LIMIT_PER_USER=100
```

### Dependencies
```json
// package.json additions
{
  "dependencies": {
    "openai": "^4.0.0",
    "@anthropic-ai/sdk": "^0.10.0",
    "tiktoken": "^1.0.0"
  }
}
```

```python
# requirements.txt additions
openai==1.3.0
anthropic==0.8.0
tiktoken==0.5.0
numpy==1.24.0
pandas==2.0.0
scikit-learn==1.3.0
```

## 🎨 UI Integration Points

### 1. Assignment Cards
Add AI helper button to existing AssignmentCard component:
```typescript
// In components/dashboard/AssignmentCard.tsx
<Button 
  variant="outline" 
  size="sm"
  onClick={() => setShowAIHelper(true)}
  className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
>
  🤖 AI Help
</Button>
```

### 2. Dashboard Overview
Add AI insights widget:
```typescript
// New component: components/ai/AIInsightsWidget.tsx
<Card className="bg-gradient-to-br from-purple-50 to-pink-50">
  <CardHeader>
    <CardTitle className="text-purple-800">🧠 AI Insights</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-purple-700">
      Based on your recent performance, I recommend focusing on 
      your Computer Science assignments this week.
    </p>
    <Button size="sm" className="mt-2">View Study Plan</Button>
  </CardContent>
</Card>
```

### 3. New AI Dashboard Page
```typescript
// app/dashboard/ai/page.tsx
export default function AIPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">🤖 AI Assistant</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StudyChatInterface />
        <StudyPlanGenerator />
        <GradeInsights />
        <AIUsageStats />
      </div>
    </div>
  )
}
```

## 💰 Cost Estimation

### OpenAI API Costs (GPT-4)
- **Input tokens**: ~$0.03 per 1K tokens
- **Output tokens**: ~$0.06 per 1K tokens
- **Estimated monthly cost per active user**: $5-15
- **For 100 users**: $500-1500/month

### Cost Optimization Strategies
1. Use GPT-3.5-turbo for simple queries
2. Implement conversation context limits
3. Cache common responses
4. User daily limits
5. Tiered pricing (free tier + premium)

## 🔒 Security & Privacy

### Data Protection
- Encrypt AI conversation history
- Anonymize data sent to AI APIs
- Implement user consent flows
- Regular data purging policies

### Rate Limiting
```typescript
// Implement per-user rate limiting
const aiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50, // 50 AI requests per day per user
  message: 'AI usage limit reached. Please try again tomorrow.'
})
```

## 🎯 Success Metrics

### Phase 1 KPIs
- **User Engagement**: AI chat sessions per user
- **Satisfaction**: User ratings of AI responses
- **Usage Patterns**: Most common question types
- **Performance**: Response time and accuracy

### Phase 2 KPIs
- **Study Plan Adoption**: % of users who follow AI plans
- **Academic Improvement**: Grade improvements with AI help
- **Time Management**: Reported productivity increases

## 🚀 Getting Started

### Week 1-2: Foundation
1. Set up OpenAI API integration
2. Create basic chat interface
3. Implement conversation storage
4. Add rate limiting

### Week 3-4: AI Features
1. Build assignment helper AI
2. Add context-aware responses
3. Implement usage tracking
4. Create AI insights widget

### Week 5-6: Polish & Testing
1. UI/UX refinements
2. Error handling improvements
3. Performance optimization
4. User testing and feedback

## 🎉 Expected Benefits

### For Students
- **Personalized Help**: AI tutor available 24/7
- **Better Planning**: Smarter study schedules
- **Academic Insights**: Data-driven improvement suggestions
- **Stress Reduction**: Proactive academic support

### For Easeboard
- **User Engagement**: Increased time spent in app
- **Premium Feature**: Monetization opportunity
- **Competitive Edge**: AI-powered student platform
- **Data Value**: Rich academic behavior insights

## 📝 Next Steps

1. **Prototype Phase 1**: Build basic AI chat in 2 weeks
2. **User Testing**: Get feedback from 10-20 students
3. **Iterate**: Refine based on feedback
4. **Scale**: Roll out to full user base
5. **Expand**: Add Phase 2 features

The AI integration is very feasible given your current architecture and would significantly enhance the student experience! 🚀
