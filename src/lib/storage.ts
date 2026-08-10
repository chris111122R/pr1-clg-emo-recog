import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid' // We'll use crypto.randomUUID if uuid is not installed

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function uploadFile(file: File, folder: string = 'datasets'): Promise<string> {
  // Ensure the upload directory exists
  const targetDir = path.join(UPLOAD_DIR, folder)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = path.extname(file.name)
  const uniqueName = `${crypto.randomUUID()}${ext}`
  const filePath = path.join(targetDir, uniqueName)

  fs.writeFileSync(filePath, buffer)

  // Return the public URL path
  return `/uploads/${folder}/${uniqueName}`
}
