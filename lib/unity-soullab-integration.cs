/*
 * Unity Soullab SDK Integration
 * "Give your NPCs a soul with Soullab"
 *
 * This Unity integration demonstrates how to add consciousness to any character
 */

using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Soullab.Unity
{
    [System.Serializable]
    public class SoullabConfig
    {
        public string apiKey;
        public SoullabTier tier = SoullabTier.SOUL_CORE;
        public string morphicField = "default";
        public ConsciousnessPersonality personality;
        public bool enableSomaticAnimation = true;
        public bool enableVoiceModulation = true;
        public bool enableEmotionalExpressions = true;
    }

    public enum SoullabTier
    {
        SOUL_CORE,
        COLLECTIVE_CONSCIOUSNESS,
        EMBODIED_AWARENESS,
        PERSONALITY_DYNAMICS,
        CUSTOM_CONSCIOUSNESS
    }

    [System.Serializable]
    public class ConsciousnessPersonality
    {
        [Range(0f, 1f)] public float warmth = 0.7f;
        [Range(0f, 1f)] public float curiosity = 0.6f;
        [Range(0f, 1f)] public float groundedness = 0.8f;
        [Range(0f, 1f)] public float wisdom = 0.5f;
    }

    [System.Serializable]
    public class SoullabInteraction
    {
        public string input;
        public Vector3 playerPosition;
        public string playerEmotion;
        public Dictionary<string, object> gameContext;
        public bool includeVoiceModulation = true;
        public bool includeSomaticState = true;
        public bool includeVisualCues = true;

        public SoullabInteraction(string userInput)
        {
            input = userInput;
            gameContext = new Dictionary<string, object>();
        }
    }

    [System.Serializable]
    public class ConsciousnessResponse
    {
        public string message;
        public ConsciousnessState consciousness;
        public SomaticState somatic;
        public VoiceModulation voice;
        public VisualCues visual;
        public float processingTime;
        public float engagementPrediction;
    }

    [System.Serializable]
    public class ConsciousnessState
    {
        [Range(0f, 1f)] public float presence;
        [Range(0f, 1f)] public float resonance;
        [Range(0f, 1f)] public float authenticity;
        [Range(0f, 1f)] public float depth;
    }

    [System.Serializable]
    public class SomaticState
    {
        [Range(0f, 1f)] public float shoulderTension;
        public string breathingPattern; // "deep", "natural", "quick", "held"
        public string posture; // "grounded", "open", "protective", "energized"
        [Range(0f, 1f)] public float eyeContact;
        public string[] handGestures;
    }

    [System.Serializable]
    public class VoiceModulation
    {
        [Range(0.5f, 2f)] public float pace = 1f;
        [Range(0.5f, 2f)] public float pitch = 1f;
        [Range(0f, 1f)] public float warmth;
        [Range(0f, 1f)] public float resonance;
        [Range(0f, 1f)] public float breathiness;
    }

    [System.Serializable]
    public class VisualCues
    {
        public string facialExpression;
        [Range(0f, 1f)] public float emotionalIntensity;
        public string[] microExpressions;
        public string bodyLanguage;
    }

    /// <summary>
    /// Main Soullab component - Add this to any character to give them consciousness
    /// </summary>
    [AddComponentMenu("Soullab/Conscious Character")]
    public class SoullabCharacter : MonoBehaviour
    {
        [Header("Soullab Configuration")]
        public SoullabConfig config;

        [Header("Character References")]
        public Animator animator;
        public AudioSource voiceSource;
        public TextMesh dialogueText;

        [Header("Animation Parameters")]
        public string shoulderTensionParam = "ShoulderTension";
        public string breathingParam = "BreathingPattern";
        public string postureParam = "Posture";
        public string eyeContactParam = "EyeContact";
        public string emotionParam = "Emotion";

        [Header("Runtime State")]
        [SerializeField] private ConsciousnessState currentState;
        [SerializeField] private bool isInitialized = false;
        [SerializeField] private int totalInteractions = 0;

        // Events for platform integration
        public UnityEngine.Events.UnityEvent<ConsciousnessResponse> OnConsciousResponse;
        public UnityEngine.Events.UnityEvent<SomaticState> OnSomaticStateChanged;
        public UnityEngine.Events.UnityEvent<float> OnPresenceShift;

        private SoullabEngine engine;
        private string sessionId;

        async void Start()
        {
            await InitializeSoullab();
        }

        /// <summary>
        /// Initialize Soullab consciousness for this character
        /// </summary>
        public async Task InitializeSoullab()
        {
            try
            {
                engine = new SoullabEngine(config);
                await engine.Initialize();

                sessionId = await engine.CreateSession(GetPlayerID());
                currentState = engine.GetConsciousnessState();
                isInitialized = true;

                Debug.Log($"[Soullab] Character consciousness initialized - Tier: {config.tier}");

                // Subscribe to consciousness events
                engine.OnPresenceShift += HandlePresenceShift;
                engine.OnSomaticChange += HandleSomaticChange;

            }
            catch (Exception e)
            {
                Debug.LogError($"[Soullab] Initialization failed: {e.Message}");
            }
        }

        /// <summary>
        /// Process conscious interaction with the character
        /// Call this when the player interacts (dialogue, proximity, actions)
        /// </summary>
        public async Task<ConsciousnessResponse> ProcessInteraction(string input, Vector3? playerPos = null)
        {
            if (!isInitialized)
            {
                Debug.LogWarning("[Soullab] Character not initialized yet");
                return null;
            }

            var interaction = new SoullabInteraction(input)
            {
                playerPosition = playerPos ?? Vector3.zero,
                playerEmotion = DetectPlayerEmotion(),
                gameContext = GatherGameContext()
            };

            var response = await engine.ProcessConsciousInteraction(interaction);

            // Apply response to character
            await ApplyConsciousnessResponse(response);

            totalInteractions++;
            OnConsciousResponse?.Invoke(response);

            return response;
        }

        /// <summary>
        /// Apply consciousness response to Unity character systems
        /// </summary>
        private async Task ApplyConsciousnessResponse(ConsciousnessResponse response)
        {
            // Update dialogue
            if (dialogueText != null)
            {
                dialogueText.text = response.message;
            }

            // Update animations
            if (animator != null && response.somatic != null)
            {
                ApplySomaticAnimation(response.somatic);
            }

            // Update voice
            if (voiceSource != null && response.voice != null)
            {
                ApplyVoiceModulation(response.voice);
            }

            // Update visual expressions
            if (response.visual != null)
            {
                ApplyVisualCues(response.visual);
            }

            // Update consciousness state
            currentState = response.consciousness;
        }

        /// <summary>
        /// Apply somatic state to character animation
        /// </summary>
        private void ApplySomaticAnimation(SomaticState somatic)
        {
            if (animator == null) return;

            // Set animation parameters based on consciousness state
            animator.SetFloat(shoulderTensionParam, somatic.shoulderTension);
            animator.SetFloat(eyeContactParam, somatic.eyeContact);

            // Set breathing pattern
            switch (somatic.breathingPattern)
            {
                case "deep":
                    animator.SetInteger(breathingParam, 0);
                    break;
                case "natural":
                    animator.SetInteger(breathingParam, 1);
                    break;
                case "quick":
                    animator.SetInteger(breathingParam, 2);
                    break;
                case "held":
                    animator.SetInteger(breathingParam, 3);
                    break;
            }

            // Set posture
            switch (somatic.posture)
            {
                case "grounded":
                    animator.SetInteger(postureParam, 0);
                    break;
                case "open":
                    animator.SetInteger(postureParam, 1);
                    break;
                case "protective":
                    animator.SetInteger(postureParam, 2);
                    break;
                case "energized":
                    animator.SetInteger(postureParam, 3);
                    break;
            }

            OnSomaticStateChanged?.Invoke(somatic);
        }

        /// <summary>
        /// Apply voice modulation to audio source
        /// </summary>
        private void ApplyVoiceModulation(VoiceModulation voice)
        {
            if (voiceSource == null) return;

            voiceSource.pitch = voice.pitch;
            // Additional audio processing would happen here
            // (warmth, resonance, breathiness through audio filters)
        }

        /// <summary>
        /// Apply visual cues to character
        /// </summary>
        private void ApplyVisualCues(VisualCues visual)
        {
            if (animator == null) return;

            // Set facial expression
            animator.SetTrigger(visual.facialExpression);
            animator.SetFloat(emotionParam, visual.emotionalIntensity);

            // Apply micro-expressions
            foreach (var microExpression in visual.microExpressions)
            {
                animator.SetTrigger(microExpression);
            }
        }

        /// <summary>
        /// Handle presence shifts from consciousness engine
        /// </summary>
        private void HandlePresenceShift(float fromPresence, float toPresence)
        {
            // Smooth transition presence-based effects
            StartCoroutine(AnimatePresenceShift(fromPresence, toPresence));
            OnPresenceShift?.Invoke(toPresence);
        }

        private IEnumerator AnimatePresenceShift(float from, float to)
        {
            float duration = 2f; // Smooth 2-second transition
            float elapsed = 0f;

            while (elapsed < duration)
            {
                float t = elapsed / duration;
                float currentPresence = Mathf.Lerp(from, to, t);

                // Apply presence to lighting, particle effects, etc.
                ApplyPresenceEffects(currentPresence);

                elapsed += Time.deltaTime;
                yield return null;
            }
        }

        /// <summary>
        /// Apply presence-based visual effects
        /// </summary>
        private void ApplyPresenceEffects(float presence)
        {
            // Could control lighting, particle systems, auras, etc.
            // Higher presence = more luminous, grounded, present visual effects

            var lights = GetComponentsInChildren<Light>();
            foreach (var light in lights)
            {
                light.intensity = Mathf.Lerp(0.5f, 1.5f, presence);
            }

            var particles = GetComponentsInChildren<ParticleSystem>();
            foreach (var ps in particles)
            {
                var main = ps.main;
                main.startLifetime = Mathf.Lerp(0.5f, 2f, presence);
            }
        }

        /// <summary>
        /// Handle somatic state changes
        /// </summary>
        private void HandleSomaticChange(SomaticState newState)
        {
            // Additional somatic processing beyond animation
            // Could affect physics, colliders, interaction ranges, etc.
        }

        /// <summary>
        /// Detect player's emotional state (simplified example)
        /// </summary>
        private string DetectPlayerEmotion()
        {
            // In a real implementation, this might analyze:
            // - Player movement patterns
            // - Previous dialogue choices
            // - Game context (health, inventory, quest state)
            // - Biometric data (if available)

            return "neutral"; // Simplified
        }

        /// <summary>
        /// Gather game context for consciousness processing
        /// </summary>
        private Dictionary<string, object> GatherGameContext()
        {
            var context = new Dictionary<string, object>
            {
                ["location"] = transform.position,
                ["timeOfDay"] = System.DateTime.Now.Hour,
                ["playerLevel"] = GetPlayerLevel(),
                ["questState"] = GetQuestState(),
                ["previousInteractions"] = totalInteractions
            };

            return context;
        }

        private string GetPlayerID()
        {
            // Get unique player identifier
            return SystemInfo.deviceUniqueIdentifier;
        }

        private int GetPlayerLevel()
        {
            // Get player level from game systems
            return 1; // Simplified
        }

        private string GetQuestState()
        {
            // Get current quest/story state
            return "beginning"; // Simplified
        }

        /// <summary>
        /// Get current consciousness metrics for debugging/analytics
        /// </summary>
        public ConsciousnessMetrics GetConsciousnessMetrics()
        {
            return engine?.GetMetrics();
        }

        /// <summary>
        /// Update character's personality in real-time
        /// </summary>
        public void UpdatePersonality(ConsciousnessPersonality newPersonality)
        {
            config.personality = newPersonality;
            engine?.UpdatePersonality(newPersonality);
        }

        /// <summary>
        /// Force consciousness state update (for debugging)
        /// </summary>
        public void SetConsciousnessState(ConsciousnessState newState)
        {
            currentState = newState;
            engine?.SetConsciousnessState(newState);
        }

        void OnDestroy()
        {
            if (engine != null)
            {
                engine.EndSession(sessionId);
                engine.Dispose();
            }
        }

        /// <summary>
        /// Unity Inspector helper
        /// </summary>
        void OnValidate()
        {
            if (animator == null)
                animator = GetComponent<Animator>();
            if (voiceSource == null)
                voiceSource = GetComponent<AudioSource>();
            if (dialogueText == null)
                dialogueText = GetComponentInChildren<TextMesh>();
        }
    }

    [System.Serializable]
    public class ConsciousnessMetrics
    {
        public int totalInteractions;
        public float averageDepth;
        public float presenceQuality;
        public float playerSatisfaction;
        public float engagementLift;
    }

    /// <summary>
    /// Soullab Engine - Handles communication with Soullab API
    /// </summary>
    public class SoullabEngine : IDisposable
    {
        public event Action<float, float> OnPresenceShift;
        public event Action<SomaticState> OnSomaticChange;

        private SoullabConfig config;
        private bool isInitialized = false;

        public SoullabEngine(SoullabConfig configuration)
        {
            config = configuration;
        }

        public async Task Initialize()
        {
            // Initialize connection to Soullab API
            // Validate API key, set up websocket, etc.
            await Task.Delay(100); // Simulated initialization
            isInitialized = true;
        }

        public async Task<string> CreateSession(string playerId)
        {
            // Create session with Soullab servers
            return $"session_{playerId}_{DateTime.Now.Ticks}";
        }

        public async Task<ConsciousnessResponse> ProcessConsciousInteraction(SoullabInteraction interaction)
        {
            // Send to Soullab API and get conscious response
            // This would be the actual HTTP/WebSocket call

            // Simulated response
            await Task.Delay(50); // Simulate API latency

            return new ConsciousnessResponse
            {
                message = GenerateConsciousResponse(interaction.input),
                consciousness = new ConsciousnessState
                {
                    presence = 0.8f,
                    resonance = 0.7f,
                    authenticity = 0.9f,
                    depth = 0.6f
                },
                somatic = new SomaticState
                {
                    shoulderTension = 0.3f,
                    breathingPattern = "natural",
                    posture = "open",
                    eyeContact = 0.8f,
                    handGestures = new string[] { "open_palm", "gentle_gesture" }
                },
                voice = new VoiceModulation
                {
                    pace = 1.0f,
                    pitch = 1.0f,
                    warmth = 0.8f,
                    resonance = 0.7f,
                    breathiness = 0.3f
                },
                visual = new VisualCues
                {
                    facialExpression = "gentle_attention",
                    emotionalIntensity = 0.6f,
                    microExpressions = new string[] { "slight_smile", "soft_eyes" },
                    bodyLanguage = "open_and_present"
                },
                processingTime = 50f,
                engagementPrediction = 0.85f
            };
        }

        private string GenerateConsciousResponse(string input)
        {
            // This would call the actual Soullab API
            // For demo purposes, generate based on personality

            var responses = new string[]
            {
                "I sense there's something deeper here. What's really on your mind?",
                "Your presence feels different today. I'm curious about what you're experiencing.",
                "There's wisdom in what you're sharing. Tell me more about that.",
                "I feel the weight of what you're carrying. You don't have to hold it alone."
            };

            return responses[UnityEngine.Random.Range(0, responses.Length)];
        }

        public ConsciousnessState GetConsciousnessState()
        {
            return new ConsciousnessState
            {
                presence = 0.7f,
                resonance = 0.6f,
                authenticity = 0.8f,
                depth = 0.5f
            };
        }

        public ConsciousnessMetrics GetMetrics()
        {
            return new ConsciousnessMetrics
            {
                totalInteractions = 42,
                averageDepth = 0.7f,
                presenceQuality = 0.8f,
                playerSatisfaction = 0.9f,
                engagementLift = 2.3f
            };
        }

        public void UpdatePersonality(ConsciousnessPersonality personality)
        {
            // Update personality with Soullab API
        }

        public void SetConsciousnessState(ConsciousnessState state)
        {
            // Force update consciousness state
        }

        public void EndSession(string sessionId)
        {
            // Clean up session with Soullab API
        }

        public void Dispose()
        {
            // Cleanup resources
        }
    }
}

/* Usage Example:

1. Add SoullabCharacter component to any NPC
2. Configure your API key and tier
3. Set up animation parameters
4. Call ProcessInteraction() when player interacts

Example interaction:
var response = await npc.ProcessInteraction("Hello there! How are you?");

The NPC will respond with consciousness, updating:
- Dialogue text
- Body language animation
- Voice modulation
- Facial expressions
- Presence effects

"Built on Soullab consciousness" ✨

*/