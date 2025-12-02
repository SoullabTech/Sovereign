import React from 'react';
import { MessageCircle, User } from 'lucide-react';
import ConversationDownloadButton from '@/components/conversation/ConversationDownloadButton';

/**
 * Demo component showing how to integrate conversation download into various UI contexts
 */
export const ConversationDownloadDemo: React.FC = () => {
  const demoUserId = "demo_user_123";
  const demoSessionId = "session_demo_456";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">📥 Conversation Download Feature</h1>
        <p className="text-gray-600">Members can now download their conversations as complete documents</p>
      </div>

      {/* Header Integration Example */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold mb-3">🔗 Header Integration</h2>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6" />
              <h3 className="font-medium">Conversation with MAIA</h3>
            </div>

            {/* Download button in header */}
            <div className="flex items-center gap-2">
              <ConversationDownloadButton
                userId={demoUserId}
                sessionId={demoSessionId}
                variant="icon"
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              />
              {/* Other header buttons would go here */}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Click the download icon to export this conversation
          </div>
        </div>
      </div>

      {/* Button Variations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold mb-3">🎨 Button Variations</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Standard Button */}
          <div className="space-y-2">
            <h4 className="font-medium">Standard Button</h4>
            <ConversationDownloadButton
              userId={demoUserId}
              sessionId={demoSessionId}
              variant="button"
            />
            <p className="text-xs text-gray-500">Quick download (Markdown)</p>
          </div>

          {/* Icon Button */}
          <div className="space-y-2">
            <h4 className="font-medium">Icon Button</h4>
            <ConversationDownloadButton
              userId={demoUserId}
              sessionId={demoSessionId}
              variant="icon"
            />
            <p className="text-xs text-gray-500">Compact for toolbars</p>
          </div>

          {/* Advanced Options */}
          <div className="space-y-2">
            <h4 className="font-medium">Advanced Options</h4>
            <ConversationDownloadButton
              userId={demoUserId}
              variant="button"
              showAdvancedOptions={true}
            />
            <p className="text-xs text-gray-500">Format & date selection</p>
          </div>
        </div>
      </div>

      {/* Menu Integration Example */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold mb-3">📋 Menu Integration</h2>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h4 className="font-medium mb-2">Settings Menu</h4>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
            <ConversationDownloadButton
              userId={demoUserId}
              variant="menu-item"
              showAdvancedOptions={true}
            />
            <div className="p-3 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800">
              Other Menu Item
            </div>
            <div className="p-3 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800">
              Another Menu Item
            </div>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold mb-3">💻 Code Examples</h2>

        <div className="space-y-4">
          {/* Basic Usage */}
          <div>
            <h4 className="font-medium mb-2">Basic Usage</h4>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm font-mono overflow-x-auto">
              <pre>{`import ConversationDownloadButton from '@/components/conversation/ConversationDownloadButton';

// Quick download button
<ConversationDownloadButton
  userId="user123"
  sessionId="session456"
  variant="button"
/>`}</pre>
            </div>
          </div>

          {/* Advanced Usage */}
          <div>
            <h4 className="font-medium mb-2">Advanced Usage</h4>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm font-mono overflow-x-auto">
              <pre>{`// Advanced options with format selection
<ConversationDownloadButton
  userId="user123"
  variant="button"
  showAdvancedOptions={true}
/>

// Icon for toolbars
<ConversationDownloadButton
  userId="user123"
  sessionId="session456"
  variant="icon"
/>`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Export Formats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold mb-3">📄 Export Formats</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-blue-600 mb-2">📝 Markdown (.md)</h4>
            <p className="text-sm text-gray-600 mb-2">Beautiful, readable format</p>
            <ul className="text-xs space-y-1">
              <li>• Proper formatting & structure</li>
              <li>• Easy to read & share</li>
              <li>• Works with documentation tools</li>
            </ul>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-green-600 mb-2">⚙️ JSON (.json)</h4>
            <p className="text-sm text-gray-600 mb-2">Complete data with metadata</p>
            <ul className="text-xs space-y-1">
              <li>• Full conversation data</li>
              <li>• Includes timestamps & metadata</li>
              <li>• Perfect for developers</li>
            </ul>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-purple-600 mb-2">📄 Text (.txt)</h4>
            <p className="text-sm text-gray-600 mb-2">Universal plain text</p>
            <ul className="text-xs space-y-1">
              <li>• Works on any device</li>
              <li>• Simple & accessible</li>
              <li>• Easy to copy & paste</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Feature Status */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h3 className="font-semibold text-green-800 dark:text-green-200">✅ Fully Operational</h3>
        </div>
        <p className="text-green-700 dark:text-green-300 text-sm">
          The conversation download feature is ready to use! Members can download their conversations
          in multiple formats with advanced filtering options.
        </p>
      </div>
    </div>
  );
};

export default ConversationDownloadDemo;