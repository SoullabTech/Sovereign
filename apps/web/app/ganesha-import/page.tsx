'use client';

/**
 * Ganesha Contact Import Tool - Manual Entry Interface
 * Easy way to add your 50+ consciousness pioneers to the Ganesha system
 */

import { useState } from 'react';
import { motion } from 'framer-motion';

interface RawContact {
  name: string;
  email: string;
}

export default function GaneshaImportPage() {
  const [rawContacts, setRawContacts] = useState('');
  const [convertedContacts, setConvertedContacts] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [stats, setStats] = useState({ count: 0, valid: 0, invalid: 0 });

  const parseRawContacts = (input: string): RawContact[] => {
    const lines = input.split('\n').filter(line => line.trim());
    const contacts: RawContact[] = [];

    for (const line of lines) {
      // Try multiple formats
      let name = '', email = '';

      // Format 1: "Name <email@domain.com>"
      const emailInBrackets = line.match(/(.+?)\s*<(.+?@.+?)>/);
      if (emailInBrackets) {
        name = emailInBrackets[1].trim();
        email = emailInBrackets[2].trim();
      }
      // Format 2: "Name, email@domain.com" or "Name - email@domain.com"
      else if (line.includes(',') || line.includes(' - ')) {
        const separator = line.includes(',') ? ',' : ' - ';
        const parts = line.split(separator);
        if (parts.length >= 2) {
          name = parts[0].trim();
          email = parts[1].trim();
        }
      }
      // Format 3: Just email (will extract name from email)
      else if (line.includes('@')) {
        email = line.trim();
        name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
      }
      // Format 4: Try to find email anywhere in the line
      else {
        const emailMatch = line.match(/([\\w.-]+@[\\w.-]+\\.\\w+)/);
        if (emailMatch) {
          email = emailMatch[1];
          name = line.replace(emailMatch[1], '').trim() ||
                 email.split('@')[0].replace(/[._-]/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
        }
      }

      if (email && name) {
        contacts.push({ name, email });
      }
    }

    return contacts;
  };

  const generateGaneshaCode = (contacts: RawContact[]): string => {
    if (contacts.length === 0) return '';

    const ganeshaContacts = contacts.map((contact, index) => {
      const id = `beta-${String(index + 1).padStart(3, '0')}`;
      return `  {
    id: '${id}',
    name: '${contact.name}',
    email: '${contact.email}',
    joinDate: '2024-01-01',
    status: 'active',
    groups: ['beta-testers', 'consciousness-pioneers', 'newsletter'] as ContactGroup[],
    tags: ['early-adopter', 'consciousness-pioneer'],
    metadata: {
      source: 'beta-program-manual-import',
      contribution: 'Early consciousness exploration and platform feedback',
      preferences: {
        newsletters: true,
        updates: true,
        events: true
      }
    }
  }`;
    });

    return `// 🧠 Ganesha Contacts - Generated from manual import
// Add these to your ganeshaContacts array in lib/ganesha/contacts.ts

${ganeshaContacts.join(',\\n\\n')}`;
  };

  const handleConvert = () => {
    setIsConverting(true);

    try {
      const contacts = parseRawContacts(rawContacts);
      const validContacts = contacts.filter(c => c.email.includes('@') && c.email.includes('.'));
      const code = generateGaneshaCode(validContacts);

      setConvertedContacts(code);
      setStats({
        count: contacts.length,
        valid: validContacts.length,
        invalid: contacts.length - validContacts.length
      });
    } catch (error) {
      console.error('Conversion error:', error);
    }

    setIsConverting(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(convertedContacts);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 to-teal-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-emerald-100 mb-4">
            🧠 Ganesha Contact Import Tool
          </h1>
          <p className="text-emerald-300 text-lg">
            Import your 50+ consciousness pioneers into the organized Ganesha system
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-emerald-900/30 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30"
          >
            <h2 className="text-2xl font-semibold text-emerald-100 mb-4">
              📝 Paste Your Beta Tester List
            </h2>

            <div className="mb-4">
              <p className="text-emerald-300 mb-2">Supported formats:</p>
              <ul className="text-emerald-400 text-sm space-y-1">
                <li>• John Smith &lt;john@email.com&gt;</li>
                <li>• Jane Doe, jane@email.com</li>
                <li>• Alex Johnson - alex@email.com</li>
                <li>• just@email.com (will extract name)</li>
              </ul>
            </div>

            <textarea
              value={rawContacts}
              onChange={(e) => setRawContacts(e.target.value)}
              placeholder="Paste your beta tester list here...
Example:
Kelly Nezat <kelly@soullab.life>
Pioneer One, pioneer1@email.com
Jane Smith - jane@consciousness.com
john@example.com"
              className="w-full h-64 bg-emerald-950/50 border border-emerald-700 rounded-lg p-4 text-emerald-100 placeholder-emerald-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConvert}
              disabled={!rawContacts.trim() || isConverting}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              {isConverting ? '🔄 Converting...' : '✨ Convert to Ganesha Format'}
            </motion.button>

            {stats.count > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-emerald-950/30 rounded-lg"
              >
                <p className="text-emerald-300">
                  📊 <strong>{stats.valid}</strong> valid contacts found
                  {stats.invalid > 0 && (
                    <span className="text-amber-300"> ({stats.invalid} invalid)</span>
                  )}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-emerald-900/30 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30"
          >
            <h2 className="text-2xl font-semibold text-emerald-100 mb-4">
              🚀 Generated Ganesha Code
            </h2>

            {convertedContacts ? (
              <>
                <div className="mb-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopyCode}
                    className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    📋 Copy Code
                  </motion.button>
                </div>

                <div className="bg-emerald-950/50 border border-emerald-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-emerald-200 text-sm whitespace-pre-wrap">
                    {convertedContacts}
                  </pre>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-teal-950/30 rounded-lg border border-teal-700/30"
                >
                  <h3 className="text-teal-200 font-semibold mb-2">📋 Next Steps:</h3>
                  <ol className="text-teal-300 text-sm space-y-1">
                    <li>1. Copy the generated code above</li>
                    <li>2. Open <code className="bg-teal-900/50 px-1 rounded">lib/ganesha/contacts.ts</code></li>
                    <li>3. Replace the <code className="bg-teal-900/50 px-1 rounded">ganeshaContacts</code> array content</li>
                    <li>4. Save the file - your Ganesha email system is ready!</li>
                  </ol>
                </motion.div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-emerald-400">
                <p>Converted code will appear here...</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-emerald-900/20 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/20"
        >
          <h3 className="text-xl font-semibold text-emerald-100 mb-4">
            🧠 How This Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-emerald-300">
            <div>
              <h4 className="font-semibold text-emerald-200 mb-2">1. Import</h4>
              <p className="text-sm">
                Paste your beta tester list in any common format. The tool automatically detects names and emails.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-200 mb-2">2. Convert</h4>
              <p className="text-sm">
                Converts your raw data into the structured Ganesha contact format with metadata and groupings.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-200 mb-2">3. Integrate</h4>
              <p className="text-sm">
                Copy the generated code into your contacts file and start using Ganesha email system immediately.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}