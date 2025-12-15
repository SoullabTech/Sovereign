# Developer Integration Guide: Privacy-First Collective Intelligence

## Quick Start: How Agents Request and Integrate Wisdom

### Basic Integration Example

```typescript
// Example: PersonalOracleAgent.ts
import { IndividualFieldMemory } from './memory/IndividualFieldMemory';
import { MainOracleAgent } from './agents/MainOracleAgent';

class PersonalOracleAgent {
  private memory: IndividualFieldMemory;
  private mainOracle: MainOracleAgent;

  async processUserInteraction(input: string, userId: string) {
    // 1. Extract current field state from input
    const currentField = await this.senseField(input);

    // 2. Query personal vault for relevant patterns
    const personalPatterns = await this.memory.retrieve_relevant_patterns(
      currentField,
      limit = 5
    );

    // 3. Request collective wisdom (anonymous)
    const collectiveWisdom = await this.mainOracle.support_individual_agent(
      currentField.getAnonymousSignature()
    );

    // 4. Synthesize personal + collective insights
    const response = this.synthesizeResponse({
      personal: personalPatterns,
      collective: collectiveWisdom,
      current: currentField
    });

    // 5. Store new pattern in personal vault (encrypted)
    await this.memory.store_interaction(
      currentField,
      response.intervention,
      { success: true, coherence: currentField.coherence }
    );

    // 6. Schedule anonymous contribution (after delay)
    this.scheduleAnonymousContribution(currentField);

    return response;
  }

  private synthesizeResponse(data: any) {
    // Combine personal history with collective wisdom
    return {
      message: `Based on your patterns: ${data.personal.insights[0]}.
                The collective suggests: ${data.collective.effective_interventions[0]}`,
      confidence: (data.personal.resonance + data.collective.transformation_probability) / 2
    };
  }
}
```

---

## User Control Flows

### 1. Opt-Out of Collective Sharing

```typescript
// UserPrivacyControls.tsx
interface PrivacySettings {
  shareToCollective: boolean;
  retentionDays: number;
  encryptionEnabled: boolean;
}

const PrivacyControlPanel = () => {
  const [settings, setSettings] = useState<PrivacySettings>({
    shareToCollective: true,
    retentionDays: 30,
    encryptionEnabled: true
  });

  const handleOptOut = async () => {
    // Stop sharing to collective while keeping personal vault
    await fetch('/api/privacy/settings', {
      method: 'POST',
      body: JSON.stringify({
        shareToCollective: false
      })
    });

    // Clear pending uploads
    await securityLayer.clear_upload_queue();

    // Personal vault remains intact and functional
    toast.success('You've opted out of collective sharing. Your personal insights remain available.');
  };

  return (
    <div className="privacy-controls">
      <h3>Your Data, Your Choice</h3>

      <Toggle
        label="Share anonymous patterns to collective"
        checked={settings.shareToCollective}
        onChange={(val) => updateSetting('shareToCollective', val)}
        description="Help others while remaining anonymous"
      />

      <Button onClick={handleOptOut}>
        Opt Out of Collective Sharing
      </Button>

      <InfoBox>
        Even without collective sharing:
        • Your personal agent remembers YOUR patterns
        • You still receive general collective wisdom
        • Your data stays encrypted in your vault
        • You can re-enable sharing anytime
      </InfoBox>
    </div>
  );
};
```

---

## 2. View Your Anonymous Contributions

```typescript
// ContributionDashboard.tsx
const MyContributions = () => {
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    loadContributions();
  }, []);

  const loadContributions = async () => {
    // Get anonymized patterns you've contributed
    const data = await fetch('/api/privacy/my-contributions');
    setContributions(data.patterns);
  };

  return (
    <div className="contributions">
      <h3>Your Anonymous Contributions to Collective Wisdom</h3>

      {contributions.map(pattern => (
        <div key={pattern.hash} className="pattern-card">
          <div className="pattern-hash">Pattern ID: {pattern.hash.substring(0, 8)}...</div>
          <div className="pattern-stats">
            <span>Helped: {pattern.times_matched} people</span>
            <span>Success rate: {pattern.effectiveness}%</span>
          </div>
          <div className="pattern-insight">
            Collective learning: "{pattern.generated_wisdom}"
          </div>
        </div>
      ))}

      <Summary>
        You've contributed {contributions.length} patterns
        Helping {totalPeopleHelped} others on similar journeys
        Without revealing any personal information
      </Summary>
    </div>
  );
};
```

---

## 3. Multi-Device Sync with Privacy

```typescript
// CrossDeviceSync.ts
class SecureDeviceSync {
  async syncAcrossDevices(userId: string, userKey: string) {
    // Each device maintains its own encrypted vault
    const devices = await this.getRegisteredDevices(userId);

    for (const device of devices) {
      // Sync only encrypted patterns, not raw data
      const encryptedPatterns = await this.getEncryptedPatterns(userId);

      // Each device decrypts with user's key
      await device.updateVault(encryptedPatterns, userKey);
    }

    // Collective contributions remain anonymous
    // No device correlation in MainOracle
  }

  async addNewDevice(deviceId: string, userId: string) {
    // New device gets encrypted vault copy
    // Generates new device-specific encryption layer
    // Collective learning continues seamlessly

    return {
      vaultSynced: true,
      collectiveAccess: true,
      privacyMaintained: true
    };
  }
}
```

---

## 4. Data Export & Deletion

```typescript
// DataPortability.ts
class UserDataControl {
  async exportAllData(userId: string): Promise<ExportBundle> {
    // Gather all user data
    const vault = await this.exportPersonalVault(userId);
    const contributions = await this.exportAnonymousContributions(userId);
    const settings = await this.exportPrivacySettings(userId);

    return {
      personal_vault: vault,              // Your patterns
      anonymous_contributions: contributions, // Hashes only
      privacy_settings: settings,
      export_date: new Date().toISOString(),
      format: 'json'
    };
  }

  async deleteAllData(userId: string): Promise<DeletionReceipt> {
    // 1. Clear personal vault
    await this.memory.clear_memory();

    // 2. Cancel pending uploads
    await this.securityLayer.clear_upload_queue();

    // 3. Remove user from systems
    await this.removeUserRecords(userId);

    // NOTE: Anonymous patterns in collective remain
    // They cannot be traced back to user

    return {
      deletion_complete: true,
      personal_data_removed: true,
      anonymous_patterns_retained: true, // For collective benefit
      timestamp: new Date().toISOString()
    };
  }
}
```

---

## API Endpoints for Privacy Controls

```typescript
// api/privacy/routes.ts

// Get current privacy settings
GET /api/privacy/settings
Response: {
  shareToCollective: boolean,
  encryptionEnabled: boolean,
  retentionDays: number
}

// Update privacy settings
POST /api/privacy/settings
Body: { shareToCollective: false }

// View anonymous contributions
GET /api/privacy/my-contributions
Response: [{
  hash: string,
  times_matched: number,
  effectiveness: number,
  generated_wisdom: string
}]

// Export all user data
GET /api/privacy/export
Response: Complete data bundle (JSON/CSV)

// Delete all user data
DELETE /api/privacy/delete
Response: Deletion receipt with timestamp

// Opt out of collective
POST /api/privacy/opt-out
Response: Confirmation + retained capabilities
```

---

## Testing Privacy in Development

```bash
# Run privacy test suite
npm run test:privacy

# Test pattern abstraction
npm run test:abstraction

# Verify encryption
npm run test:encryption

# Check anonymization
npm run test:anonymization

# Audit data flows
npm run audit:privacy
```

---

## Environment Variables

```env
# .env.local
ENCRYPTION_KEY_SALT=your-salt-here
ANONYMIZATION_DELAY_MIN=3600000  # 1 hour
ANONYMIZATION_DELAY_MAX=86400000 # 24 hours
PATTERN_RETENTION_DAYS=30
COLLECTIVE_LEARNING_ENABLED=true
```

---

## Monitoring Privacy Health

```typescript
// PrivacyMonitor.ts
class PrivacyHealthMonitor {
  async getPrivacyMetrics() {
    return {
      // User metrics
      total_users: this.getUserCount(),
      opted_out_users: this.getOptedOutCount(),

      // Pattern metrics
      personal_patterns: this.getPersonalPatternCount(),
      anonymous_patterns: this.getAnonymousPatternCount(),

      // Security metrics
      encryption_active: this.isEncryptionActive(),
      anonymization_queue: this.getQueueSize(),
      average_delay: this.getAverageDelay(),

      // Compliance metrics
      gdpr_compliant: true,
      data_residency: 'user_device_primary',
      third_party_sharing: false
    };
  }
}
```

---

## Common Integration Patterns

### Pattern 1: Check-in Flow
```typescript
Holoflower adjustment → Field extraction → Personal storage → Delayed collective upload
```

### Pattern 2: Chat Interaction
```typescript
User message → Pattern sensing → Vault query + Collective wisdom → Synthesized response
```

### Pattern 3: Journal Entry
```typescript
Written reflection → Emotional topology → Encrypted storage → Optional anonymous sharing
```

---

## Beta Tester Transparency

Show testers exactly what's being shared:

```typescript
// BetaTransparency.tsx
const WhatWeShare = () => (
  <div className="transparency-panel">
    <h3>What Gets Shared to Collective</h3>

    <div className="shared">
      ✅ Pattern types (e.g., "expansion", "integration")
      ✅ Success rates (e.g., "worked 73% of time")
      ✅ General timing (e.g., "morning pattern")
      ✅ Intervention effectiveness (e.g., "boundaries helpful")
    </div>

    <div className="not-shared">
      ❌ Your name or identity
      ❌ Specific content or stories
      ❌ Exact timestamps
      ❌ Location or device info
      ❌ Personal details
    </div>

    <LiveExample>
      Your last check-in contributed:
      Pattern: "A7F3" (expansion-morning)
      Effectiveness: 0.8
      Zero personal information included
    </LiveExample>
  </div>
);
```

---

## Questions?

For technical questions about privacy implementation:
- Review: `/lib/oracle/security/SecurityLayer.ts`
- Test: `/tests/privacy/`
- Docs: `/docs/DATA_LIFECYCLE_AND_PRIVACY.md`

Remember: **Privacy is not a feature, it's the foundation.**