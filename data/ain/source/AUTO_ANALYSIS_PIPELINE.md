# 🌸 Auto-Analysis Pipeline Enhancement

## Real-time Document Blooming

When users upload documents, they should bloom into the Sacred Library with elemental resonance visible within seconds, not requiring manual analysis trigger.

## Implementation Strategy

### 1. Upload → Analysis Chain (Already Implemented) ✅
The upload route already triggers analysis automatically:

```typescript
// In /api/upload/route.ts (line 71-77)
// Trigger async analysis (non-blocking)
fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/documents/analyze`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ documentId: data.id }),
}).catch(console.error); // Don't block on analysis
```

### 2. Real-time UI Updates

Create a WebSocket or Server-Sent Events system for live updates:

```typescript
// components/upload/DocumentUploadStatus.tsx
import { useEffect, useState } from 'react';

export function DocumentUploadStatus({ documentId }: { documentId: string }) {
  const [status, setStatus] = useState<'uploading' | 'analyzing' | 'blooming' | 'complete'>('uploading');
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/documents/analyze?id=${documentId}`);
        const data = await response.json();
        
        if (data.status === 'analyzed') {
          setStatus('complete');
          setAnalysis(data.analysis);
        } else if (data.status === 'analyzing') {
          setStatus('analyzing');
          // Poll again in 2 seconds
          setTimeout(checkStatus, 2000);
        } else {
          setStatus('analyzing');
          setTimeout(checkStatus, 1000);
        }
      } catch (error) {
        console.error('Status check failed:', error);
        setTimeout(checkStatus, 3000); // Retry
      }
    };

    if (documentId) {
      checkStatus();
    }
  }, [documentId]);

  return (
    <div className="upload-status">
      {status === 'uploading' && (
        <div className="flex items-center gap-2">
          <div className="animate-pulse w-4 h-4 bg-blue-500 rounded-full"></div>
          <span>Uploading...</span>
        </div>
      )}
      
      {status === 'analyzing' && (
        <div className="flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          <span>Oracle analyzing elemental resonance...</span>
        </div>
      )}
      
      {status === 'blooming' && (
        <div className="flex items-center gap-2">
          <div className="animate-pulse w-4 h-4 bg-green-500 rounded-full"></div>
          <span>Blooming into Sacred Library...</span>
        </div>
      )}
      
      {status === 'complete' && analysis && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
          <span>Complete! Primary element: {analysis.primary_element}</span>
          <ElementBadge element={analysis.primary_element} />
        </div>
      )}
    </div>
  );
}
```

### 3. Enhanced Upload Component

```typescript
// components/upload/SacredUploader.tsx
import { useState } from 'react';
import { DocumentUploadStatus } from './DocumentUploadStatus';

export function SacredUploader() {
  const [uploads, setUploads] = useState<string[]>([]);
  
  const handleUpload = async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.status === 'ok') {
        setUploads(prev => [...prev, result.id]);
        
        // Show success message
        toast.success('Document uploaded! Oracle analyzing...');
      }
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  return (
    <div className="sacred-uploader">
      {/* Drag & Drop Zone */}
      <div className="upload-zone border-2 border-dashed border-purple-300 rounded-lg p-8 text-center">
        <input 
          type="file" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const type = detectFileType(file);
              handleUpload(file, type);
            }
          }}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-6xl mb-4">🌸</div>
          <h3 className="text-lg font-medium mb-2">Drop files to bloom in Sacred Library</h3>
          <p className="text-gray-600">Supports text, audio, video, images</p>
        </label>
      </div>

      {/* Active Uploads */}
      <div className="upload-progress mt-6 space-y-4">
        {uploads.map(documentId => (
          <DocumentUploadStatus key={documentId} documentId={documentId} />
        ))}
      </div>
    </div>
  );
}

function detectFileType(file: File): string {
  if (file.type.startsWith('text/')) return 'text';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf') return 'document';
  return 'document';
}
```

### 4. Optimized Analysis Performance

```typescript
// Enhance /api/documents/analyze/route.ts with streaming
export async function POST(req: Request) {
  // ... existing code ...

  // For immediate feedback, update status to "analyzing"
  await supabase
    .from("documents")
    .update({ status: "analyzing" })
    .eq("id", documentId);

  try {
    // Run analysis
    const analysis = await analyzeElementalResonance(content);

    // Update with results
    await supabase
      .from("documents")
      .update({
        status: "analyzed",
        analysis: analysis,
        analyzed_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    // Create library asset immediately
    await supabase
      .from("library_assets")
      .insert({
        user_id: document.user_id,
        title: document.filename,
        type: mapDocumentTypeToAssetType(document.type),
        element: analysis.primary_element,
        // ... rest of asset data
      });

    return NextResponse.json({
      status: "analyzed",
      analysis,
      message: "Document bloomed into Sacred Library! 🌸"
    });

  } catch (error) {
    // Mark as failed for retry
    await supabase
      .from("documents")
      .update({ status: "failed" })
      .eq("id", documentId);
    
    throw error;
  }
}
```

### 5. Sacred Library Integration

```typescript
// hooks/useRealtimeLibrary.ts
import { useEffect, useState } from 'react';
import { useSupabase } from './useSupabase';

export function useRealtimeLibrary() {
  const [assets, setAssets] = useState([]);
  const supabase = useSupabase();

  useEffect(() => {
    // Subscribe to library_assets changes
    const subscription = supabase
      .channel('library_updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'library_assets' },
        (payload) => {
          setAssets(prev => [payload.new, ...prev]);
          
          // Show bloom animation
          toast.success(`${payload.new.title} bloomed into your Library! 🌸`, {
            icon: getElementIcon(payload.new.element),
          });
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [supabase]);

  return assets;
}
```

## Benefits

1. **Instant Feedback**: Users see progress immediately
2. **Sacred Experience**: Documents "bloom" rather than just "upload"
3. **Elemental Awareness**: Primary element visible within seconds
4. **Library Integration**: Assets appear in real-time
5. **Performance Optimized**: Non-blocking, progressive enhancement

## User Journey

```
1. User drops file → Upload starts
2. File uploaded → "Oracle analyzing elemental resonance..."
3. Analysis running → Spinning holoflower animation
4. Analysis complete → "Blooming into Sacred Library..."
5. Asset created → "Complete! Primary element: Fire 🔥"
6. Library updates → New asset appears with element badge
```

This creates a magical, responsive experience where documents transform from raw files into sacred, analyzed wisdom within seconds! 🌸