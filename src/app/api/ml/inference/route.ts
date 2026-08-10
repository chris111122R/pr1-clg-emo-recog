import { NextResponse } from 'next/server'

// In a real production environment, this would be an environment variable.
const ML_BACKEND_URL = process.env.ML_BACKEND_URL || 'http://localhost:8000'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const modality = formData.get('modality') as string
    
    let endpoint = ''
    if (modality === 'text') endpoint = '/api/inference/text'
    else if (modality === 'image') endpoint = '/api/inference/image'
    else if (modality === 'audio') endpoint = '/api/inference/audio'
    else return NextResponse.json({ error: 'Invalid modality' }, { status: 400 })

    // If it's text, we send JSON. If it's image/audio, we send the file as multipart/form-data.
    const fetchOptions: RequestInit = { method: 'POST' }

    if (modality === 'text') {
      fetchOptions.headers = { 'Content-Type': 'application/json' }
      fetchOptions.body = JSON.stringify({ text: formData.get('text') })
    } else {
      const file = formData.get('file')
      if (!file) return NextResponse.json({ error: 'File missing' }, { status: 400 })
      
      const mlFormData = new FormData()
      mlFormData.append('file', file)
      fetchOptions.body = mlFormData
    }

    // Proxy request to Python backend
    const res = await fetch(`${ML_BACKEND_URL}${endpoint}`, fetchOptions)
    
    if (!res.ok) {
      const errorText = await res.text()
      return NextResponse.json({ error: 'ML Backend error', details: errorText }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("ML Proxy Error:", error)
    const details = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Internal Server Error', details }, { status: 500 })
  }
}
