'use client';

import React, { useState, useCallback } from 'react';
import { Upload, Heart, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { healthDataImporter } from '@/lib/biometrics/HealthDataImporter';
import { biometricStorage } from '@/lib/biometrics/BiometricStorage';
import type { ParsedHealthData } from '@/lib/biometrics/HealthDataImporter';

export const HealthDataUploader: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importedData, setImportedData] = useState<ParsedHealthData | null>(null);
  const [hasExistingData, setHasExistingData] = useState(false);

  // Check for existing data on mount
  React.useEffect(() => {
    biometricStorage.hasHealthData().then(setHasExistingData);
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔵 File input changed!', event);

    const file = event.target.files?.[0];
    console.log('📁 Selected file:', file);

    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    console.log('✅ File details:', {
      name: file.name,
      size: file.size,
      sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: file.type,
      lastModified: new Date(file.lastModified).toLocaleString()
    });

    // Check if file is empty
    if (file.size === 0) {
      setErrorMessage('The selected file is empty (0 bytes). Please make sure you selected the correct export.xml file from your Apple Health export.');
      setUploadStatus('error');
      return;
    }

    // Warn if file seems too small (Apple Health exports are usually > 1MB)
    if (file.size < 1024 * 100) { // Less than 100KB
      console.warn('⚠️ File seems very small for an Apple Health export. Expected size is usually several MB.');
    }

    // Validate filename
    if (!file.name.toLowerCase().endsWith('.xml')) {
      setErrorMessage('Please select an XML file. The file should be named "export.xml" from your Apple Health export.');
      setUploadStatus('error');
      return;
    }

    setIsProcessing(true);
    setUploadStatus('processing');
    setErrorMessage(null);

    try {
      // Check if file is too large for browser memory (> 100 MB)
      const fileSizeMB = file.size / (1024 * 1024);

      // For large files, use server-side processing
      if (fileSizeMB > 100) {
        console.log(`📤 File is large (${fileSizeMB.toFixed(0)} MB), using server-side processing...`);

        // Upload to server for filtering
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/health/import', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Server-side processing failed');
        }

        // Get filtered XML from server
        const filteredXML = await response.text();
        console.log(`✅ Server filtered the data. Processing ${filteredXML.length} characters...`);

        // Now process the filtered XML in the browser
        const data = await healthDataImporter.parseHealthXML(filteredXML);

        console.log('📦 Parsed data:', {
          hrv: data.hrv.length,
          heartRate: data.heartRate.length,
          sleep: data.sleep.length,
          respiratory: data.respiratory.length
        });

        // Store locally
        await biometricStorage.storeHealthData(data);
        setImportedData(data);
        setUploadStatus('success');
        setHasExistingData(true);
        console.log('✅ Health data imported successfully (via server)');

        return; // Exit early, we're done
      }

      // Read file using FileReader (with progress tracking for large files)
      console.log('📖 Reading file as text...');
      console.log(`📦 File size: ${fileSizeMB.toFixed(2)} MB`);

      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadstart = () => {
          console.log('📥 FileReader started reading...');
        };

        reader.onload = (e) => {
          console.log('🎯 FileReader onload fired');
          const result = e.target?.result;
          console.log('📦 Result type:', typeof result);
          console.log('📦 Result is string:', typeof result === 'string');

          if (typeof result === 'string') {
            console.log('✅ File read successfully, length:', result.length);

            // Log first 200 characters to verify content
            if (result.length > 0) {
              console.log('📄 First 200 chars:', result.substring(0, 200));
            } else {
              console.error('⚠️ WARNING: File read but content is empty!');
            }

            resolve(result);
          } else {
            console.error('❌ Result is not a string:', result);
            reject(new Error('Failed to read file as text'));
          }
        };

        reader.onerror = () => {
          console.error('❌ FileReader error:', reader.error);
          reject(new Error(`File reading failed: ${reader.error?.message || 'Unknown error'}`));
        };

        reader.onabort = () => {
          console.error('❌ FileReader aborted');
          reject(new Error('File reading was aborted'));
        };

        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            console.log(`📊 Reading progress: ${percentComplete.toFixed(1)}% (${e.loaded}/${e.total} bytes)`);
          }
        };

        // Start reading
        console.log('🚀 Starting FileReader.readAsText()...');
        reader.readAsText(file);
      });

      // Double-check text is not empty
      if (!text || text.length === 0) {
        console.error('❌ File was read but text is empty!');
        console.error('File object:', file);
        console.error('File size:', file.size);
        console.error('File name:', file.name);
        console.error('File type:', file.type);

        throw new Error(
          `File read as empty (0 characters).\n\n` +
          `File details:\n` +
          `- Name: ${file.name}\n` +
          `- Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB (${file.size} bytes)\n` +
          `- Type: ${file.type || 'unknown'}\n\n` +
          `This usually means:\n` +
          `1. You selected the wrong file (should be export.xml, not export_cda.xml)\n` +
          `2. The file is corrupted\n` +
          `3. Browser security is blocking file access\n\n` +
          `Try:\n` +
          `1. Re-export your data from Apple Health\n` +
          `2. Make sure you extract export.xml from the .zip file\n` +
          `3. Try a different browser (Chrome, Safari, or Firefox)`
        );
      }

      // Log XML structure to verify
      console.log('📊 Parsing Apple Health data...');
      console.log('📄 Text length:', text.length, 'characters');
      console.log('📄 First line:', text.split('\n')[0]);

      const data = await healthDataImporter.parseHealthXML(text);

      console.log('📦 Parsed data:', {
        hrv: data.hrv.length,
        heartRate: data.heartRate.length,
        sleep: data.sleep.length,
        respiratory: data.respiratory.length
      });

      // Validate data - provide helpful feedback
      if (data.hrv.length === 0) {
        const hasHeartRate = data.heartRate.length > 0;
        const hasSleep = data.sleep.length > 0;
        const hasRecords = data.rawRecords.length > 0;

        if (!hasRecords) {
          throw new Error('No health records found. Make sure you uploaded export.xml from Apple Health (not export_cda.xml).');
        }

        // List what we DID find
        const found = [];
        if (hasHeartRate) found.push(`${data.heartRate.length} heart rate readings`);
        if (hasSleep) found.push(`${data.sleep.length} sleep sessions`);

        const message = found.length > 0
          ? `No HRV data found, but found: ${found.join(', ')}. HRV requires an Apple Watch. Make sure your watch is syncing HRV data to your iPhone.`
          : `No HRV data found in export. HRV requires an Apple Watch with HRV tracking enabled. Check Health app → Browse → Heart → Heart Rate Variability.`;

        throw new Error(message);
      }

      // Store locally (privacy-first)
      await biometricStorage.storeHealthData(data);

      setImportedData(data);
      setUploadStatus('success');
      setHasExistingData(true);

      console.log('✅ Health data imported successfully');
    } catch (error) {
      console.error('❌ Failed to import health data:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleClearData = useCallback(async () => {
    if (!confirm('Are you sure you want to delete all imported health data? This cannot be undone.')) {
      return;
    }

    try {
      await biometricStorage.clearAllData();
      setImportedData(null);
      setHasExistingData(false);
      setUploadStatus('idle');
      console.log('🗑️ Health data cleared');
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
      alert('Failed to clear data. Please try again.');
    }
  }, []);

  return (
    <Card className="w-full max-w-2xl bg-white/60 backdrop-blur-lg border-2 border-dune-rose-gold/40 shadow-2xl">
      <CardHeader className="bg-gradient-to-br from-dune-sunset-blush/20 to-dune-spice-pink/20 border-b-2 border-dune-rose-gold/30">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-dune-heart-coral" />
          <CardTitle className="text-2xl text-dune-wellness-crimson">Apple Watch Integration</CardTitle>
        </div>
        <CardDescription className="text-dune-deep-sand font-medium">
          Import your Apple Health data to enable biometric-responsive presence states
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Privacy Notice */}
        <div className="bg-gradient-to-br from-dune-arrakis-mauve/20 to-dune-sunset-blush/20 border-2 border-dune-spice-trance-pink/40 rounded-xl p-5 shadow-lg">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-dune-wellness-crimson mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-dune-wellness-crimson mb-2 text-lg">
                Privacy First
              </h4>
              <p className="text-sm text-dune-deep-sand leading-relaxed">
                Your health data is stored <strong className="text-dune-rose-deep">only on your device</strong> (IndexedDB).
                It never leaves your browser unless you explicitly opt into Field contribution.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3 bg-gradient-to-br from-white/50 to-dune-spice-pink/20 rounded-xl p-5 border border-dune-rose-gold/30">
          <h4 className="font-semibold text-base text-dune-deep-sand">How to export from Apple Health:</h4>
          <ol className="text-sm text-dune-deep-sand space-y-2 list-decimal list-inside leading-relaxed">
            <li>Open <strong className="text-dune-wellness-crimson">Health</strong> app on iPhone</li>
            <li>Tap your <strong className="text-dune-wellness-crimson">profile picture</strong> (top right)</li>
            <li>Tap <strong className="text-dune-wellness-crimson">Export All Health Data</strong></li>
            <li>Wait for export to complete (may take a few minutes)</li>
            <li>Extract the <code className="bg-dune-sunset-blush/40 px-2 py-0.5 rounded text-dune-rose-deep font-mono">export.xml</code> file from the zip</li>
            <li>Upload it here <span className="text-xs text-dune-rose-deep">(large files are automatically filtered on the server)</span></li>
          </ol>
        </div>

        {/* Upload Area */}
        <div className="space-y-4">
          {uploadStatus === 'idle' || uploadStatus === 'error' ? (
            <div className="border-2 border-dashed border-dune-rose-gold/50 rounded-xl p-10 text-center bg-gradient-to-br from-white/40 to-dune-sunset-blush/30 hover:border-dune-heart-coral hover:bg-dune-spice-pink/20 transition-all shadow-lg">
              <input
                type="file"
                id="health-data-upload"
                accept=".xml,text/xml,application/xml"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
              />
              <label
                htmlFor="health-data-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload className="w-10 h-10 text-dune-wellness-crimson" />
                <span className="text-base font-semibold text-dune-deep-sand">
                  {hasExistingData ? 'Upload new export (replaces existing)' : 'Click to upload export.xml'}
                </span>
                <span className="text-sm text-dune-rose-deep font-medium">
                  Apple Health XML export
                </span>
                <span className="text-xs text-dune-deep-sand mt-2 opacity-70">
                  File uploads automatically when selected (no separate upload button)
                </span>
              </label>
            </div>
          ) : uploadStatus === 'processing' ? (
            <div className="border-2 border-dune-heart-coral rounded-xl p-10 text-center bg-gradient-to-br from-dune-sunset-blush/40 to-dune-spice-pink/40 shadow-lg">
              <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-dune-wellness-crimson mx-auto mb-3" />
              <p className="text-base font-semibold text-dune-deep-sand">Processing health data...</p>
              <p className="text-sm text-dune-rose-deep mt-2 font-medium">
                This may take a few seconds
              </p>
            </div>
          ) : uploadStatus === 'success' && importedData ? (
            <div className="border-2 border-green-500 bg-green-50 dark:bg-green-950/20 rounded-lg p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-3">
                Health data imported successfully!
              </p>

              {/* Data Summary */}
              <div className="grid grid-cols-2 gap-4 text-left bg-white dark:bg-gray-900 rounded-lg p-4 mb-4">
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">HRV Readings</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{importedData.hrv.length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Heart Rate</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{importedData.heartRate.length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Sleep Sessions</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{importedData.sleep.length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Respiratory Rate</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{importedData.respiratory.length}</div>
                </div>
              </div>

              {/* Latest HRV */}
              {importedData.hrv.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Most Recent HRV</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round(importedData.hrv[0].value)} ms
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {new Date(importedData.hrv[0].startDate).toLocaleString()}
                  </div>
                </div>
              )}

              {/* Readiness Score */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Readiness Score</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {healthDataImporter.calculateReadiness(importedData)}/100
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Based on HRV, sleep, and resting heart rate
                </div>
              </div>
            </div>
          ) : null}

          {/* Error Message */}
          {uploadStatus === 'error' && errorMessage && (
            <div className="border-2 border-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">
                    Import Failed
                  </h4>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {hasExistingData && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearData}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              Clear Imported Data
            </Button>
          </div>
        )}

        {/* Next Steps */}
        {uploadStatus === 'success' && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              ✨ What happens next:
            </h4>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 list-disc list-inside">
              <li>MAIA will use your HRV to suggest presence states (Dialogue/Patient/Scribe)</li>
              <li>The interface will respond to your coherence level automatically</li>
              <li>Your readiness score helps MAIA know when to go deep vs. gentle</li>
              <li>All data stays private on your device unless you opt into Field contribution</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
