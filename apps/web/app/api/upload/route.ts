import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";


// Stub memory store
const memoryStore = {
  isInitialized: false,
  init: async (dbPath: string) => {},
  getMemories: async (userId: string, limit: number) => [],
  getJournalEntries: async (userId: string, limit: number) => [],
  getUploads: async (userId: string, limit: number) => [],
  getVoiceNotes: async (userId: string, limit: number) => [],
  getVoiceNote: async (id: string) => null,
  saveVoiceNote: async (data: any) => ({ id: Date.now().toString(), ...data }),
  createMemory: async (data: any) => ({ id: Date.now().toString(), ...data }),
  addMemory: async (userId: string, type: string, value: number, content: string) => Date.now().toString()
};

// Stub llama service
const llamaService = {
  isInitialized: false,
  init: async () => {},
  process: async (text: string) => ({ processed: text }),
  processVoice: async (audio: any) => ({ transcript: 'Voice processing not available in beta' }),
  addMemory: async (userId: string, content: string) => {}
};
const DATA_DIR = join(process.cwd(), "tmp");
const UPLOADS_DIR = join(DATA_DIR, "uploads");
const UPLOADS_FILE = join(DATA_DIR, "uploads.json");

// Ensure directories exist
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface UploadedFile {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  summary: string;
  timestamp: string;
}

function readUploadsData(): UploadedFile[] {
  if (!existsSync(UPLOADS_FILE)) {
    return [];
  }
  try {
    const data = readFileSync(UPLOADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading uploads data:", error);
    return [];
  }
}

function writeUploadsData(uploads: UploadedFile[]): void {
  try {
    writeFileSync(UPLOADS_FILE, JSON.stringify(uploads, null, 2));
  } catch (error) {
    console.error("Error writing uploads data:", error);
    throw error;
  }
}

function generateSummary(filename: string, type: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'pdf':
      return "PDF document - content will be analyzed by your Oracle";
    case 'txt':
      return "Text document - ready for Oracle analysis";
    case 'md':
      return "Markdown document - formatted text for Oracle review";
    case 'mp3':
    case 'wav':
    case 'm4a':
      return "Audio file - will be transcribed and analyzed";
    case 'jpg':
    case 'jpeg':
    case 'png':
      return "Image file - visual content for Oracle insight";
    default:
      return "File uploaded - ready for Oracle analysis";
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user";

    const allUploads = readUploadsData();
    const userUploads = allUploads.filter(upload => upload.userId === userId);

    return NextResponse.json({ 
      success: true,
      files: userUploads.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    });

  } catch (error) {
    console.error("Error getting uploads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get uploads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string || "demo-user";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Get file buffer for processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    const allowedExtensions = ['pdf', 'txt', 'md', 'mp3', 'wav', 'm4a', 'jpg', 'jpeg', 'png'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExtension || '')) {
      return NextResponse.json(
        { success: false, error: "File type not supported. Please upload PDF, TXT, MP3, or image files." },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size too large. Maximum 10MB allowed." },
        { status: 400 }
      );
    }

    // Extract text content based on file type
    let textContent = "";

    try {
      if (fileExtension === 'pdf') {
        // Dynamic import to avoid build-time test code execution
        const pdfParse = (await import('pdf-parse')).default;
        const pdfData = await pdfParse(buffer);
        textContent = pdfData.text;
      } else if (['txt', 'md'].includes(fileExtension || '')) {
        textContent = buffer.toString('utf-8');
      } else if (['jpg', 'jpeg', 'png'].includes(fileExtension || '')) {
        textContent = `[Image file: ${file.name} - visual content uploaded for Oracle analysis]`;
      } else if (['mp3', 'wav', 'm4a'].includes(fileExtension || '')) {
        textContent = `[Audio file: ${file.name} - awaiting transcription]`;
      } else {
        textContent = `[File: ${file.name} - ${file.type}]`;
      }
    } catch (extractError) {
      console.error("Error extracting text:", extractError);
      textContent = `[File: ${file.name} - content extraction failed]`;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const filename = `${timestamp}_${randomId}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filepath = join(UPLOADS_DIR, filename);

    // Save file
    writeFileSync(filepath, buffer);

    // Create file record
    const newFile: UploadedFile = {
      id: timestamp.toString() + randomId,
      userId,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      summary: generateSummary(file.name, file.type),
      timestamp: new Date().toISOString()
    };

    // Save to uploads index
    const allUploads = readUploadsData();
    allUploads.push(newFile);
    writeUploadsData(allUploads);

    // Save to memory store
    const memoryContent = `File Upload: ${file.name}\nType: ${file.type}\nSize: ${(file.size / 1024).toFixed(2)} KB\n\n${textContent}`;
    const entryId = await memoryStore.addMemory(
      userId,
      "upload",
      0,
      memoryContent
    );

    // Index in LlamaIndex
    await llamaService.addMemory(userId, memoryContent);

    return NextResponse.json({ 
      success: true,
      file: newFile,
      message: "File uploaded successfully",
      entryId,
      textSummary: textContent.slice(0, 500) + (textContent.length > 500 ? "..." : "")
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("id");
    const userId = searchParams.get("userId") || "demo-user";

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: "File ID is required" },
        { status: 400 }
      );
    }

    const allUploads = readUploadsData();
    const updatedUploads = allUploads.filter(
      upload => !(upload.id === fileId && upload.userId === userId)
    );

    writeUploadsData(updatedUploads);

    return NextResponse.json({ 
      success: true,
      message: "File deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 }
    );
  }
}