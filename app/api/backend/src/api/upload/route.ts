import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import { memoryStore } from "../../services/memory/MemoryStore";
import { llamaService } from "../../services/memory/LlamaService";
import { logger } from "../../utils/logger";

// Disable Next.js body parsing for file uploads
export const config = { 
  api: { 
    bodyParser: false 
  } 
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.md', '.json'];
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/soullab-uploads';

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureUploadDir();

    // Parse form data
    const form = formidable({ 
      multiples: false, 
      uploadDir: UPLOAD_DIR, 
      keepExtensions: true,
      maxFileSize: MAX_FILE_SIZE
    });

    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    // Extract file and userId
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;

    if (!file) {
      return NextResponse.json({ 
        error: "No file uploaded" 
      }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ 
        error: "userId is required" 
      }, { status: 400 });
    }

    // Validate file extension
    const originalName = file.originalFilename || file.name || 'unknown';
    const ext = path.extname(originalName).toLowerCase();
    
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      // Clean up uploaded file
      await fs.unlink(file.filepath).catch(() => {});
      return NextResponse.json({ 
        error: `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` 
      }, { status: 400 });
    }

    // Extract content based on file type
    let extractedContent = "";
    let metadata: any = {
      filename: originalName,
      fileType: ext,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };

    try {
      if (ext === ".pdf") {
        const buffer = await fs.readFile(file.filepath);
        const data = await pdf(buffer);
        extractedContent = data.text;
        metadata.pages = data.numpages;
        metadata.info = data.info;
      } else if ([".txt", ".md"].includes(ext)) {
        extractedContent = await fs.readFile(file.filepath, "utf-8");
      } else if (ext === ".json") {
        const jsonContent = await fs.readFile(file.filepath, "utf-8");
        const parsed = JSON.parse(jsonContent);
        extractedContent = JSON.stringify(parsed, null, 2);
        metadata.jsonStructure = Object.keys(parsed);
      }
    } catch (extractError: any) {
      logger.error("Content extraction error:", extractError);
      await fs.unlink(file.filepath).catch(() => {});
      return NextResponse.json({ 
        error: `Failed to extract content: ${extractError.message}` 
      }, { status: 500 });
    }

    // Clean up the temporary file
    await fs.unlink(file.filepath).catch(() => {});

    // Initialize memory services
    const dbPath = process.env.MEMORY_DB_PATH || './data/soullab.sqlite';
    await memoryStore.init(dbPath);
    await llamaService.init();

    // Save to SQLite
    const fileId = await memoryStore.saveUpload(
      userId, 
      originalName, 
      extractedContent,
      metadata
    );

    // Index in LlamaIndex for semantic search
    await llamaService.addMemory(userId, {
      id: fileId,
      type: "upload",
      content: extractedContent,
      meta: metadata
    });

    // Generate a summary for preview
    const summary = extractedContent.length > 500
      ? extractedContent.slice(0, 497) + "..."
      : extractedContent;

    logger.info("File uploaded and indexed", {
      userId: userId.substring(0, 8) + '...',
      fileId,
      filename: originalName,
      contentLength: extractedContent.length
    });

    return NextResponse.json({ 
      success: true, 
      fileId, 
      filename: originalName,
      summary,
      metadata,
      message: "File uploaded and indexed for Oracle memory"
    });

  } catch (err: any) {
    logger.error("Upload error:", err);
    return NextResponse.json({ 
      error: err.message 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);
    const fileType = req.nextUrl.searchParams.get("fileType");

    if (!userId) {
      return NextResponse.json({ 
        error: "userId parameter is required" 
      }, { status: 400 });
    }

    // Initialize memory store
    const dbPath = process.env.MEMORY_DB_PATH || './data/soullab.sqlite';
    await memoryStore.init(dbPath);

    const uploads = await memoryStore.getUploads(userId, limit, fileType);

    return NextResponse.json({ 
      success: true, 
      uploads,
      count: uploads.length
    });

  } catch (err: any) {
    logger.error("Upload list error:", err);
    return NextResponse.json({ 
      error: err.message 
    }, { status: 500 });
  }
}

// Get a specific upload
export async function getUpload(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ 
        error: "userId parameter is required" 
      }, { status: 400 });
    }

    const dbPath = process.env.MEMORY_DB_PATH || './data/soullab.sqlite';
    await memoryStore.init(dbPath);

    const upload = await memoryStore.getUpload(userId, params.id);
    
    if (!upload) {
      return NextResponse.json({ 
        error: "Upload not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      upload 
    });

  } catch (err: any) {
    logger.error("Upload retrieval error:", err);
    return NextResponse.json({ 
      error: err.message 
    }, { status: 500 });
  }
}