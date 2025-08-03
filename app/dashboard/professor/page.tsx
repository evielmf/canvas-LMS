'use client'

import ProfessorSearch from '@/components/professor/ProfessorSearch'

export default function ProfessorPage() {
  return (
    <div className="min-h-screen bg-gradient-calm py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfessorSearch />
      </div>
    </div>
  )
}
