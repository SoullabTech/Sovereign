/**
 * Multi-language support for MAIA
 * Safe, non-breaking implementation that defaults to English
 */

import React from 'react';

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  voiceLanguage: string; // For speech recognition
  voiceSpeed: number;    // TTS speed adjustment
  available: boolean;    // Whether translations are ready
  beta?: boolean;        // Beta language support
}

// Available languages with safe defaults
export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    voiceLanguage: 'en-US',
    voiceSpeed: 0.95,
    available: true
  },
  'es': {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    voiceLanguage: 'es-ES',
    voiceSpeed: 1.0,
    available: true
  },
  'fr': {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    voiceLanguage: 'fr-FR',
    voiceSpeed: 0.9,
    available: true
  },
  'fr-ca': {
    code: 'fr-ca',
    name: 'Cajun French',
    nativeName: 'Français Cadien',
    flag: '⚜️',  // Fleur-de-lis for Louisiana
    direction: 'ltr',
    voiceLanguage: 'fr-CA',  // Canadian French as closest available
    voiceSpeed: 0.95,
    available: true
  },
  'de': {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    voiceLanguage: 'de-DE',
    voiceSpeed: 0.95,
    available: true
  },
  'it': {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    direction: 'ltr',
    voiceLanguage: 'it-IT',
    voiceSpeed: 1.0,
    available: true
  },
  'pt': {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    direction: 'ltr',
    voiceLanguage: 'pt-BR',
    voiceSpeed: 0.95,
    available: true
  },
  'nl': {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    direction: 'ltr',
    voiceLanguage: 'nl-NL',
    voiceSpeed: 0.95,
    available: true
  },
  'ja': {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    voiceLanguage: 'ja-JP',
    voiceSpeed: 0.85,
    available: true,
    beta: true
  },
  'zh': {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    direction: 'ltr',
    voiceLanguage: 'zh-CN',
    voiceSpeed: 0.9,
    available: true,
    beta: true
  },
  'ko': {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    direction: 'ltr',
    voiceLanguage: 'ko-KR',
    voiceSpeed: 0.9,
    available: true,
    beta: true
  },
  'ar': {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    voiceLanguage: 'ar-SA',
    voiceSpeed: 0.95,
    available: false, // Coming soon
    beta: true
  },
  'hi': {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    direction: 'ltr',
    voiceLanguage: 'hi-IN',
    voiceSpeed: 0.95,
    available: true
  },
  'ta': {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    direction: 'ltr',
    voiceLanguage: 'ta-IN',
    voiceSpeed: 0.95,
    available: true
  },
  'te': {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    direction: 'ltr',
    voiceLanguage: 'te-IN',
    voiceSpeed: 0.95,
    available: true
  },
  'mr': {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    direction: 'ltr',
    voiceLanguage: 'mr-IN',
    voiceSpeed: 0.95,
    available: true
  },
  'gu': {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    direction: 'ltr',
    voiceLanguage: 'gu-IN',
    voiceSpeed: 0.95,
    available: true
  },
  'bn': {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇧🇩',
    direction: 'ltr',
    voiceLanguage: 'bn-IN',
    voiceSpeed: 0.95,
    available: true
  },
  'pa': {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    direction: 'ltr',
    voiceLanguage: 'pa-IN',
    voiceSpeed: 0.95,
    available: true,
    beta: true
  },
  'kn': {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    direction: 'ltr',
    voiceLanguage: 'kn-IN',
    voiceSpeed: 0.95,
    available: true,
    beta: true
  },
  'ml': {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳',
    direction: 'ltr',
    voiceLanguage: 'ml-IN',
    voiceSpeed: 0.95,
    available: true,
    beta: true
  },
  'ur': {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇵🇰',
    direction: 'rtl',
    voiceLanguage: 'ur-PK',
    voiceSpeed: 0.95,
    available: true,
    beta: true
  },
  'ne': {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    flag: '🇳🇵',
    direction: 'ltr',
    voiceLanguage: 'ne-NP',
    voiceSpeed: 0.95,
    available: true
  },
  'dz': {
    code: 'dz',
    name: 'Dzongkha',
    nativeName: 'རྫོང་ཁ',
    flag: '🇧🇹',
    direction: 'ltr',
    voiceLanguage: 'dz-BT',
    voiceSpeed: 0.9,
    available: true,
    beta: true
  },
  'si': {
    code: 'si',
    name: 'Sinhala',
    nativeName: 'සිංහල',
    flag: '🇱🇰',
    direction: 'ltr',
    voiceLanguage: 'si-LK',
    voiceSpeed: 0.95,
    available: true,
    beta: true
  },
  'ru': {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    direction: 'ltr',
    voiceLanguage: 'ru-RU',
    voiceSpeed: 0.95,
    available: true,
    beta: true
  },
  'el': {
    code: 'el',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    flag: '🇬🇷',
    direction: 'ltr',
    voiceLanguage: 'el-GR',
    voiceSpeed: 0.95,
    available: true
  },
  'ga': {
    code: 'ga',
    name: 'Irish Gaelic',
    nativeName: 'Gaeilge',
    flag: '🇮🇪',
    direction: 'ltr',
    voiceLanguage: 'ga-IE',
    voiceSpeed: 0.9,
    available: true,
    beta: true
  },
  'gd': {
    code: 'gd',
    name: 'Scottish Gaelic',
    nativeName: 'Gàidhlig',
    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    direction: 'ltr',
    voiceLanguage: 'gd-GB',
    voiceSpeed: 0.9,
    available: true,
    beta: true
  }
};

// UI Translations - Safe with fallbacks
export const translations = {
  en: {
    greeting: "Hello, I'm Maia",
    listening: "Listening...",
    thinking: "Reflecting...",
    speaking: "Speaking...",
    welcome: "Welcome back",
    newConversation: "New conversation",
    settings: "Settings",
    language: "Language",
    voice: "Voice",
    chat: "Chat",
    clickToActivate: "Click to activate",
    shareThoughts: "Share your thoughts with Maia...",
    maiaReflecting: "Maia is reflecting...",
    send: "Send",
    voiceOn: "Voice On",
    voiceOff: "Voice Off",
    showText: "Show Text",
    hideText: "Hide Text",
    download: "Download Transcript",
    profile: "Your Profile",
    labNotes: "Lab Notes",
    journal: "Sacred Journal",
    favorites: "Favorites",
    uploadFiles: "Upload files for Maia to explore",
    betaLanguage: "Beta - Help us improve translations"
  },
  es: {
    greeting: "Hola, soy Maia",
    listening: "Escuchando...",
    thinking: "Reflexionando...",
    speaking: "Hablando...",
    welcome: "Bienvenido de nuevo",
    newConversation: "Nueva conversación",
    settings: "Configuración",
    language: "Idioma",
    voice: "Voz",
    chat: "Chat",
    clickToActivate: "Haz clic para activar",
    shareThoughts: "Comparte tus pensamientos con Maia...",
    maiaReflecting: "Maia está reflexionando...",
    send: "Enviar",
    voiceOn: "Voz Activada",
    voiceOff: "Voz Desactivada",
    showText: "Mostrar Texto",
    hideText: "Ocultar Texto",
    download: "Descargar Transcripción",
    profile: "Tu Perfil",
    labNotes: "Notas del Laboratorio",
    journal: "Diario Sagrado",
    favorites: "Favoritos",
    uploadFiles: "Subir archivos para que Maia explore",
    betaLanguage: "Beta - Ayúdanos a mejorar las traducciones"
  },
  fr: {
    greeting: "Bonjour, je suis Maia",
    listening: "J'écoute...",
    thinking: "Je réfléchis...",
    speaking: "Je parle...",
    welcome: "Bon retour",
    newConversation: "Nouvelle conversation",
    settings: "Paramètres",
    language: "Langue",
    voice: "Voix",
    chat: "Discussion",
    clickToActivate: "Cliquez pour activer",
    shareThoughts: "Partagez vos pensées avec Maia...",
    maiaReflecting: "Maia réfléchit...",
    send: "Envoyer",
    voiceOn: "Voix Activée",
    voiceOff: "Voix Désactivée",
    showText: "Afficher le Texte",
    hideText: "Masquer le Texte",
    download: "Télécharger la Transcription",
    profile: "Votre Profil",
    labNotes: "Notes du Laboratoire",
    journal: "Journal Sacré",
    favorites: "Favoris",
    uploadFiles: "Télécharger des fichiers pour que Maia explore",
    betaLanguage: "Bêta - Aidez-nous à améliorer les traductions"
  },
  de: {
    greeting: "Hallo, ich bin Maia",
    listening: "Ich höre zu...",
    thinking: "Ich denke nach...",
    speaking: "Ich spreche...",
    welcome: "Willkommen zurück",
    newConversation: "Neues Gespräch",
    settings: "Einstellungen",
    language: "Sprache",
    voice: "Stimme",
    chat: "Chat",
    clickToActivate: "Zum Aktivieren klicken",
    shareThoughts: "Teile deine Gedanken mit Maia...",
    maiaReflecting: "Maia denkt nach...",
    send: "Senden",
    voiceOn: "Stimme Ein",
    voiceOff: "Stimme Aus",
    showText: "Text Anzeigen",
    hideText: "Text Verbergen",
    download: "Transkript Herunterladen",
    profile: "Dein Profil",
    labNotes: "Labor-Notizen",
    journal: "Heiliges Tagebuch",
    favorites: "Favoriten",
    uploadFiles: "Dateien für Maia zum Erkunden hochladen",
    betaLanguage: "Beta - Helfen Sie uns, die Übersetzungen zu verbessern"
  },
  it: {
    greeting: "Ciao, sono Maia",
    listening: "Sto ascoltando...",
    thinking: "Sto riflettendo...",
    speaking: "Sto parlando...",
    welcome: "Bentornato",
    newConversation: "Nuova conversazione",
    settings: "Impostazioni",
    language: "Lingua",
    voice: "Voce",
    chat: "Chat",
    clickToActivate: "Clicca per attivare",
    shareThoughts: "Condividi i tuoi pensieri con Maia...",
    maiaReflecting: "Maia sta riflettendo...",
    send: "Invia",
    voiceOn: "Voce Attiva",
    voiceOff: "Voce Disattiva",
    showText: "Mostra Testo",
    hideText: "Nascondi Testo",
    download: "Scarica Trascrizione",
    profile: "Il Tuo Profilo",
    labNotes: "Note del Laboratorio",
    journal: "Diario Sacro",
    favorites: "Preferiti",
    uploadFiles: "Carica file per Maia da esplorare",
    betaLanguage: "Beta - Aiutaci a migliorare le traduzioni"
  },
  pt: {
    greeting: "Olá, eu sou Maia",
    listening: "Ouvindo...",
    thinking: "Refletindo...",
    speaking: "Falando...",
    welcome: "Bem-vindo de volta",
    newConversation: "Nova conversa",
    settings: "Configurações",
    language: "Idioma",
    voice: "Voz",
    chat: "Bate-papo",
    clickToActivate: "Clique para ativar",
    shareThoughts: "Compartilhe seus pensamentos com Maia...",
    maiaReflecting: "Maia está refletindo...",
    send: "Enviar",
    voiceOn: "Voz Ativada",
    voiceOff: "Voz Desativada",
    showText: "Mostrar Texto",
    hideText: "Ocultar Texto",
    download: "Baixar Transcrição",
    profile: "Seu Perfil",
    labNotes: "Notas do Laboratório",
    journal: "Diário Sagrado",
    favorites: "Favoritos",
    uploadFiles: "Enviar arquivos para Maia explorar",
    betaLanguage: "Beta - Ajude-nos a melhorar as traduções"
  },
  nl: {
    greeting: "Hallo, ik ben Maia",
    listening: "Luisteren...",
    thinking: "Nadenken...",
    speaking: "Spreken...",
    welcome: "Welkom terug",
    newConversation: "Nieuw gesprek",
    settings: "Instellingen",
    language: "Taal",
    voice: "Stem",
    chat: "Chat",
    clickToActivate: "Klik om te activeren",
    shareThoughts: "Deel je gedachten met Maia...",
    maiaReflecting: "Maia denkt na...",
    send: "Versturen",
    voiceOn: "Stem Aan",
    voiceOff: "Stem Uit",
    showText: "Tekst Tonen",
    hideText: "Tekst Verbergen",
    download: "Transcript Downloaden",
    profile: "Jouw Profiel",
    labNotes: "Lab Notities",
    journal: "Heilig Dagboek",
    favorites: "Favorieten",
    uploadFiles: "Upload bestanden voor Maia om te verkennen",
    betaLanguage: "Beta - Help ons de vertalingen te verbeteren"
  },
  ja: {
    greeting: "こんにちは、マイアです",
    listening: "聞いています...",
    thinking: "考えています...",
    speaking: "話しています...",
    welcome: "おかえりなさい",
    newConversation: "新しい会話",
    settings: "設定",
    language: "言語",
    voice: "音声",
    chat: "チャット",
    clickToActivate: "クリックして開始",
    shareThoughts: "マイアとあなたの思いを共有してください...",
    maiaReflecting: "マイアが考えています...",
    send: "送信",
    voiceOn: "音声オン",
    voiceOff: "音声オフ",
    showText: "テキスト表示",
    hideText: "テキスト非表示",
    download: "文字起こしをダウンロード",
    profile: "プロフィール",
    labNotes: "ラボノート",
    journal: "神聖な日記",
    favorites: "お気に入り",
    uploadFiles: "マイアが探索するファイルをアップロード",
    betaLanguage: "ベータ版 - 翻訳の改善にご協力ください"
  },
  zh: {
    greeting: "你好，我是Maia",
    listening: "正在聆听...",
    thinking: "正在思考...",
    speaking: "正在说话...",
    welcome: "欢迎回来",
    newConversation: "新对话",
    settings: "设置",
    language: "语言",
    voice: "语音",
    chat: "聊天",
    clickToActivate: "点击激活",
    shareThoughts: "与Maia分享你的想法...",
    maiaReflecting: "Maia正在思考...",
    send: "发送",
    voiceOn: "语音开启",
    voiceOff: "语音关闭",
    showText: "显示文本",
    hideText: "隐藏文本",
    download: "下载对话记录",
    profile: "个人资料",
    labNotes: "实验室笔记",
    journal: "神圣日记",
    favorites: "收藏",
    uploadFiles: "上传文件供Maia探索",
    betaLanguage: "测试版 - 帮助我们改进翻译"
  },
  ko: {
    greeting: "안녕하세요, 저는 마이아입니다",
    listening: "듣고 있습니다...",
    thinking: "생각하고 있습니다...",
    speaking: "말하고 있습니다...",
    welcome: "다시 오신 것을 환영합니다",
    newConversation: "새 대화",
    settings: "설정",
    language: "언어",
    voice: "음성",
    chat: "채팅",
    clickToActivate: "활성화하려면 클릭",
    shareThoughts: "마이아와 생각을 공유하세요...",
    maiaReflecting: "마이아가 생각하고 있습니다...",
    send: "보내기",
    voiceOn: "음성 켜기",
    voiceOff: "음성 끄기",
    showText: "텍스트 표시",
    hideText: "텍스트 숨기기",
    download: "대화록 다운로드",
    profile: "프로필",
    labNotes: "실험실 노트",
    journal: "신성한 일기",
    favorites: "즐겨찾기",
    uploadFiles: "마이아가 탐색할 파일 업로드",
    betaLanguage: "베타 - 번역 개선을 도와주세요"
  },
  hi: {
    greeting: "नमस्ते, मैं माया हूं",
    listening: "सुन रही हूं...",
    thinking: "सोच रही हूं...",
    speaking: "बोल रही हूं...",
    welcome: "वापस स्वागत है",
    newConversation: "नई बातचीत",
    settings: "सेटिंग्स",
    language: "भाषा",
    voice: "आवाज़",
    chat: "चैट",
    clickToActivate: "सक्रिय करने के लिए क्लिक करें",
    shareThoughts: "माया के साथ अपने विचार साझा करें...",
    maiaReflecting: "माया सोच रही है...",
    send: "भेजें",
    voiceOn: "आवाज़ चालू",
    voiceOff: "आवाज़ बंद",
    showText: "टेक्स्ट दिखाएं",
    hideText: "टेक्स्ट छुपाएं",
    download: "ट्रांसक्रिप्ट डाउनलोड करें",
    profile: "आपकी प्रोफ़ाइल",
    labNotes: "लैब नोट्स",
    journal: "पवित्र डायरी",
    favorites: "पसंदीदा",
    uploadFiles: "माया के लिए फ़ाइलें अपलोड करें",
    betaLanguage: "बीटा - अनुवाद सुधारने में हमारी मदद करें"
  },
  ta: {
    greeting: "வணக்கம், நான் மாயா",
    listening: "கேட்கிறேன்...",
    thinking: "யோசிக்கிறேன்...",
    speaking: "பேசுகிறேன்...",
    welcome: "மீண்டும் வரவேற்கிறேன்",
    newConversation: "புதிய உரையாடல்",
    settings: "அமைப்புகள்",
    language: "மொழி",
    voice: "குரல்",
    chat: "அரட்டை",
    clickToActivate: "செயல்படுத்த கிளிக் செய்க",
    shareThoughts: "மாயாவுடன் உங்கள் எண்ணங்களைப் பகிருங்கள்...",
    maiaReflecting: "மாயா சிந்திக்கிறாள்...",
    send: "அனுப்பு",
    voiceOn: "குரல் இயக்கு",
    voiceOff: "குரல் நிறுத்து",
    showText: "உரையைக் காட்டு",
    hideText: "உரையை மறை",
    download: "டிரான்ஸ்கிரிப்ட் பதிவிறக்கு",
    profile: "உங்கள் சுயவிவரம்",
    labNotes: "ஆய்வக குறிப்புகள்",
    journal: "புனித நாட்குறிப்பு",
    favorites: "பிடித்தவை",
    uploadFiles: "மாயா ஆராய கோப்புகளைப் பதிவேற்று",
    betaLanguage: "பீட்டா - மொழிபெயர்ப்புகளை மேம்படுத்த உதவுங்கள்"
  },
  te: {
    greeting: "నమస్తే, నేను మాయా",
    listening: "వింటున్నాను...",
    thinking: "ఆలోచిస్తున్నాను...",
    speaking: "మాట్లాడుతున్నాను...",
    welcome: "తిరిగి స్వాగతం",
    newConversation: "కొత్త సంభాషణ",
    settings: "సెట్టింగ్‌లు",
    language: "భాష",
    voice: "వాయిస్",
    chat: "చాట్",
    clickToActivate: "యాక్టివేట్ చేయడానికి క్లిక్ చేయండి",
    shareThoughts: "మాయాతో మీ ఆలోచనలను పంచుకోండి...",
    maiaReflecting: "మాయా ఆలోచిస్తోంది...",
    send: "పంపు",
    voiceOn: "వాయిస్ ఆన్",
    voiceOff: "వాయిస్ ఆఫ్",
    showText: "టెక్స్ట్ చూపించు",
    hideText: "టెక్స్ట్ దాచు",
    download: "ట్రాన్స్‌క్రిప్ట్ డౌన్‌లోడ్ చేయండి",
    profile: "మీ ప్రొఫైల్",
    labNotes: "ల్యాబ్ నోట్స్",
    journal: "పవిత్ర డైరీ",
    favorites: "ఇష్టమైనవి",
    uploadFiles: "మాయా అన్వేషించడానికి ఫైల్‌లను అప్‌లోడ్ చేయండి",
    betaLanguage: "బీటా - అనువాదాలను మెరుగుపరచడంలో సహాయం చేయండి"
  },
  mr: {
    greeting: "नमस्कार, मी माया आहे",
    listening: "ऐकत आहे...",
    thinking: "विचार करत आहे...",
    speaking: "बोलत आहे...",
    welcome: "परत स्वागत आहे",
    newConversation: "नवीन संभाषण",
    settings: "सेटिंग्ज",
    language: "भाषा",
    voice: "आवाज",
    chat: "गप्पा",
    clickToActivate: "सक्रिय करण्यासाठी क्लिक करा",
    shareThoughts: "मायासोबत तुमचे विचार शेअर करा...",
    maiaReflecting: "माया विचार करत आहे...",
    send: "पाठवा",
    voiceOn: "आवाज चालू",
    voiceOff: "आवाज बंद",
    showText: "मजकूर दाखवा",
    hideText: "मजकूर लपवा",
    download: "ट्रान्सक्रिप्ट डाउनलोड करा",
    profile: "तुमची प्रोफाईल",
    labNotes: "लॅब नोट्स",
    journal: "पवित्र डायरी",
    favorites: "आवडते",
    uploadFiles: "माया साठी फाईल्स अपलोड करा",
    betaLanguage: "बीटा - भाषांतर सुधारण्यात मदत करा"
  },
  gu: {
    greeting: "નમસ્તે, હું માયા છું",
    listening: "સાંભળું છું...",
    thinking: "વિચારું છું...",
    speaking: "બોલું છું...",
    welcome: "ફરી સ્વાગત છે",
    newConversation: "નવી વાતચીત",
    settings: "સેટિંગ્સ",
    language: "ભાષા",
    voice: "અવાજ",
    chat: "ચેટ",
    clickToActivate: "સક્રિય કરવા માટે ક્લિક કરો",
    shareThoughts: "માયા સાથે તમારા વિચારો શેર કરો...",
    maiaReflecting: "માયા વિચારી રહી છે...",
    send: "મોકલો",
    voiceOn: "અવાજ ચાલુ",
    voiceOff: "અવાજ બંધ",
    showText: "ટેક્સ્ટ બતાવો",
    hideText: "ટેક્સ્ટ છુપાવો",
    download: "ટ્રાન્સક્રિપ્ટ ડાઉનલોડ કરો",
    profile: "તમારી પ્રોફાઇલ",
    labNotes: "લેબ નોટ્સ",
    journal: "પવિત્ર ડાયરી",
    favorites: "મનપસંદ",
    uploadFiles: "માયા માટે ફાઇલ અપલોડ કરો",
    betaLanguage: "બીટા - અનુવાદ સુધારવામાં મદદ કરો"
  },
  bn: {
    greeting: "নমস্কার, আমি মায়া",
    listening: "শুনছি...",
    thinking: "ভাবছি...",
    speaking: "বলছি...",
    welcome: "আবার স্বাগতম",
    newConversation: "নতুন কথোপকথন",
    settings: "সেটিংস",
    language: "ভাষা",
    voice: "কণ্ঠস্বর",
    chat: "চ্যাট",
    clickToActivate: "সক্রিয় করতে ক্লিক করুন",
    shareThoughts: "মায়ার সাথে আপনার চিন্তাভাবনা শেয়ার করুন...",
    maiaReflecting: "মায়া ভাবছে...",
    send: "পাঠান",
    voiceOn: "ভয়েস চালু",
    voiceOff: "ভয়েস বন্ধ",
    showText: "টেক্সট দেখান",
    hideText: "টেক্সট লুকান",
    download: "ট্রান্সক্রিপ্ট ডাউনলোড করুন",
    profile: "আপনার প্রোফাইল",
    labNotes: "ল্যাব নোট",
    journal: "পবিত্র ডায়েরি",
    favorites: "পছন্দসমূহ",
    uploadFiles: "মায়ার জন্য ফাইল আপলোড করুন",
    betaLanguage: "বিটা - অনুবাদ উন্নত করতে সাহায্য করুন"
  },
  pa: {
    greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ਮਾਯਾ ਹਾਂ",
    listening: "ਸੁਣ ਰਹੀ ਹਾਂ...",
    thinking: "ਸੋਚ ਰਹੀ ਹਾਂ...",
    speaking: "ਬੋਲ ਰਹੀ ਹਾਂ...",
    welcome: "ਵਾਪਸ ਜੀ ਆਇਆਂ ਨੂੰ",
    newConversation: "ਨਵੀਂ ਗੱਲਬਾਤ",
    settings: "ਸੈਟਿੰਗਾਂ",
    language: "ਭਾਸ਼ਾ",
    voice: "ਆਵਾਜ਼",
    chat: "ਚੈਟ",
    clickToActivate: "ਸਰਗਰਮ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ",
    shareThoughts: "ਮਾਯਾ ਨਾਲ ਆਪਣੇ ਵਿਚਾਰ ਸਾਂਝੇ ਕਰੋ...",
    maiaReflecting: "ਮਾਯਾ ਸੋਚ ਰਹੀ ਹੈ...",
    send: "ਭੇਜੋ",
    voiceOn: "ਆਵਾਜ਼ ਚਾਲੂ",
    voiceOff: "ਆਵਾਜ਼ ਬੰਦ",
    showText: "ਟੈਕਸਟ ਦਿਖਾਓ",
    hideText: "ਟੈਕਸਟ ਲੁਕਾਓ",
    download: "ਟ੍ਰਾਂਸਕ੍ਰਿਪਟ ਡਾਊਨਲੋਡ ਕਰੋ",
    profile: "ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ",
    labNotes: "ਲੈਬ ਨੋਟਸ",
    journal: "ਪਵਿੱਤਰ ਡਾਇਰੀ",
    favorites: "ਪਸੰਦੀਦਾ",
    uploadFiles: "ਮਾਯਾ ਲਈ ਫਾਈਲਾਂ ਅੱਪਲੋਡ ਕਰੋ",
    betaLanguage: "ਬੀਟਾ - ਅਨੁਵਾਦ ਸੁਧਾਰਨ ਵਿੱਚ ਮਦਦ ਕਰੋ"
  },
  kn: {
    greeting: "ನಮಸ್ತೆ, ನಾನು ಮಾಯಾ",
    listening: "ಕೇಳುತ್ತಿದ್ದೇನೆ...",
    thinking: "ಯೋಚಿಸುತ್ತಿದ್ದೇನೆ...",
    speaking: "ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ...",
    welcome: "ಮರಳಿ ಸ್ವಾಗತ",
    newConversation: "ಹೊಸ ಸಂಭಾಷಣೆ",
    settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    language: "ಭಾಷೆ",
    voice: "ಧ್ವನಿ",
    chat: "ಚಾಟ್",
    clickToActivate: "ಸಕ್ರಿಯಗೊಳಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
    shareThoughts: "ಮಾಯಾ ಜೊತೆ ನಿಮ್ಮ ಆಲೋಚನೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ...",
    maiaReflecting: "ಮಾಯಾ ಚಿಂತಿಸುತ್ತಿದ್ದಾಳೆ...",
    send: "ಕಳುಹಿಸಿ",
    voiceOn: "ಧ್ವನಿ ಆನ್",
    voiceOff: "ಧ್ವನಿ ಆಫ್",
    showText: "ಪಠ್ಯ ತೋರಿಸು",
    hideText: "ಪಠ್ಯ ಮರೆಮಾಡು",
    download: "ಟ್ರಾನ್ಸ್‌ಕ್ರಿಪ್ಟ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    profile: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್",
    labNotes: "ಲ್ಯಾಬ್ ಟಿಪ್ಪಣಿಗಳು",
    journal: "ಪವಿತ್ರ ಡೈರಿ",
    favorites: "ಮೆಚ್ಚಿನವುಗಳು",
    uploadFiles: "ಮಾಯಾಗೆ ಫೈಲ್‌ಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    betaLanguage: "ಬೀಟಾ - ಅನುವಾದಗಳನ್ನು ಸುಧಾರಿಸಲು ಸಹಾಯ ಮಾಡಿ"
  },
  ml: {
    greeting: "നമസ്കാരം, ഞാൻ മായ",
    listening: "കേൾക്കുന്നു...",
    thinking: "ചിന്തിക്കുന്നു...",
    speaking: "സംസാരിക്കുന്നു...",
    welcome: "തിരികെ സ്വാഗതം",
    newConversation: "പുതിയ സംഭാഷണം",
    settings: "ക്രമീകരണങ്ങൾ",
    language: "ഭാഷ",
    voice: "ശബ്ദം",
    chat: "ചാറ്റ്",
    clickToActivate: "സജീവമാക്കാൻ ക്ലിക്ക് ചെയ്യുക",
    shareThoughts: "മായയുമായി നിങ്ങളുടെ ചിന്തകൾ പങ്കിടുക...",
    maiaReflecting: "മായ ചിന്തിക്കുന്നു...",
    send: "അയയ്ക്കുക",
    voiceOn: "ശബ്ദം ഓൺ",
    voiceOff: "ശബ്ദം ഓഫ്",
    showText: "ടെക്സ്റ്റ് കാണിക്കുക",
    hideText: "ടെക്സ്റ്റ് മറയ്ക്കുക",
    download: "ട്രാൻസ്ക്രിപ്റ്റ് ഡൗൺലോഡ് ചെയ്യുക",
    profile: "നിങ്ങളുടെ പ്രൊഫൈൽ",
    labNotes: "ലാബ് കുറിപ്പുകൾ",
    journal: "പവിത്ര ഡയറി",
    favorites: "പ്രിയങ്കരങ്ങൾ",
    uploadFiles: "മായയ്ക്കായി ഫയലുകൾ അപ്‌ലോഡ് ചെയ്യുക",
    betaLanguage: "ബീറ്റ - വിവർത്തനങ്ങൾ മെച്ചപ്പെടുത്താൻ സഹായിക്കുക"
  },
  ur: {
    greeting: "السلام علیکم، میں مایا ہوں",
    listening: "سن رہی ہوں...",
    thinking: "سوچ رہی ہوں...",
    speaking: "بول رہی ہوں...",
    welcome: "واپس آنے پر خوش آمدید",
    newConversation: "نئی گفتگو",
    settings: "ترتیبات",
    language: "زبان",
    voice: "آواز",
    chat: "چیٹ",
    clickToActivate: "فعال کرنے کے لیے کلک کریں",
    shareThoughts: "مایا کے ساتھ اپنے خیالات شیئر کریں...",
    maiaReflecting: "مایا سوچ رہی ہے...",
    send: "بھیجیں",
    voiceOn: "آواز آن",
    voiceOff: "آواز آف",
    showText: "ٹیکسٹ دکھائیں",
    hideText: "ٹیکسٹ چھپائیں",
    download: "ٹرانسکرپٹ ڈاؤن لوڈ کریں",
    profile: "آپ کی پروفائل",
    labNotes: "لیب نوٹس",
    journal: "مقدس ڈائری",
    favorites: "پسندیدہ",
    uploadFiles: "مایا کے لیے فائلیں اپ لوڈ کریں",
    betaLanguage: "بیٹا - ترجمے بہتر بنانے میں مدد کریں"
  },
  ne: {
    greeting: "नमस्ते, म माया हुँ",
    listening: "सुन्दै छु...",
    thinking: "सोच्दै छु...",
    speaking: "बोल्दै छु...",
    welcome: "फेरि स्वागत छ",
    newConversation: "नयाँ कुराकानी",
    settings: "सेटिङहरू",
    language: "भाषा",
    voice: "आवाज",
    chat: "च्याट",
    clickToActivate: "सक्रिय गर्न क्लिक गर्नुहोस्",
    shareThoughts: "मायासँग आफ्ना विचारहरू साझा गर्नुहोस्...",
    maiaReflecting: "माया सोच्दै छिन्...",
    send: "पठाउनुहोस्",
    voiceOn: "आवाज खुला",
    voiceOff: "आवाज बन्द",
    showText: "पाठ देखाउनुहोस्",
    hideText: "पाठ लुकाउनुहोस्",
    download: "ट्रान्सक्रिप्ट डाउनलोड गर्नुहोस्",
    profile: "तपाईंको प्रोफाइल",
    labNotes: "ल्याब नोटहरू",
    journal: "पवित्र डायरी",
    favorites: "मनपर्नेहरू",
    uploadFiles: "मायाको लागि फाइलहरू अपलोड गर्नुहोस्",
    betaLanguage: "बिटा - अनुवाद सुधार्न मद्दत गर्नुहोस्"
  },
  dz: {
    greeting: "བཀྲ་ཤིས་བདེ་ལེགས། ང་ མཱ་ཡ་ ཨིན།",
    listening: "ཉན་དོ་ཡོད...",
    thinking: "བསམ་དོ་ཡོད...",
    speaking: "སླབ་དོ་ཡོད...",
    welcome: "ལོག་སྟེ་བྱོན་པ་ལེགས་སོ།",
    newConversation: "གླེང་མོལ་གསརཔ།",
    settings: "སྒྲིག་སྟངས།",
    language: "སྐད་ཡིག",
    voice: "སྐད་སྒྲ།",
    chat: "གླེང་མོལ།",
    clickToActivate: "ཤུགས་ལྡན་བཟོ་ནིའི་དོན་ལུ་ཨེབ་གཏང་།",
    shareThoughts: "མཱ་ཡ་ལུ་ཁྱོད་ཀྱི་བསམ་པ་བཤེར་རོགས...",
    maiaReflecting: "མཱ་ཡ་གིས་བསམ་དོ་ཡོད...",
    send: "གཏང་།",
    voiceOn: "སྐད་སྒྲ་ཁ།",
    voiceOff: "སྐད་སྒྲ་བསྡམས།",
    showText: "ཡིག་ཆ་སྟོན།",
    hideText: "ཡིག་ཆ་སྦ།",
    download: "ཐོ་བཤུས་ཕབ་ལེན་འབད།",
    profile: "ཁྱོད་ཀྱི་ཁ་བྱང་།",
    labNotes: "ལེབ་ཟིན་བྲིས།",
    journal: "དམ་པའི་ཉིན་དེབ།",
    favorites: "དགའ་མི་ཚུ།",
    uploadFiles: "མཱ་ཡ་གི་དོན་ལུ་ཡིག་སྣོད་བསྐྱེལ།",
    betaLanguage: "བི་ཊ་ - སྐད་བསྒྱུར་ལེགས་བཅོས་ལུ་རོགས་རམ་འབད།"
  },
  si: {
    greeting: "ආයුබෝවන්, මම මායා",
    listening: "අසමින්...",
    thinking: "සිතමින්...",
    speaking: "කතා කරමින්...",
    welcome: "නැවත සාදරයෙන් පිළිගනිමු",
    newConversation: "නව සංවාදය",
    settings: "සැකසුම්",
    language: "භාෂාව",
    voice: "හඬ",
    chat: "කතාබස්",
    clickToActivate: "සක්‍රීය කිරීමට ක්ලික් කරන්න",
    shareThoughts: "මායා සමඟ ඔබේ සිතුවිලි බෙදාගන්න...",
    maiaReflecting: "මායා සිතමින්...",
    send: "යවන්න",
    voiceOn: "හඬ සක්‍රීය",
    voiceOff: "හඬ අක්‍රීය",
    showText: "පෙළ පෙන්වන්න",
    hideText: "පෙළ සඟවන්න",
    download: "පිටපත බාගන්න",
    profile: "ඔබේ පැතිකඩ",
    labNotes: "විද්‍යාගාර සටහන්",
    journal: "පූජනීය දිනපොත",
    favorites: "ප්‍රියතම",
    uploadFiles: "මායා සඳහා ගොනු උඩුගත කරන්න",
    betaLanguage: "බීටා - පරිවර්තන වැඩිදියුණු කිරීමට උදව් කරන්න"
  },
  ru: {
    greeting: "Привет, я Майя",
    listening: "Слушаю...",
    thinking: "Размышляю...",
    speaking: "Говорю...",
    welcome: "С возвращением",
    newConversation: "Новый разговор",
    settings: "Настройки",
    language: "Язык",
    voice: "Голос",
    chat: "Чат",
    clickToActivate: "Нажмите для активации",
    shareThoughts: "Поделитесь своими мыслями с Майей...",
    maiaReflecting: "Майя размышляет...",
    send: "Отправить",
    voiceOn: "Голос включен",
    voiceOff: "Голос выключен",
    showText: "Показать текст",
    hideText: "Скрыть текст",
    download: "Скачать стенограмму",
    profile: "Ваш профиль",
    labNotes: "Лабораторные заметки",
    journal: "Священный дневник",
    favorites: "Избранное",
    uploadFiles: "Загрузить файлы для изучения Майей",
    betaLanguage: "Бета - Помогите нам улучшить перевод"
  },
  el: {
    greeting: "Γεια σου, είμαι η Μάια",
    listening: "Ακούω...",
    thinking: "Σκέφτομαι...",
    speaking: "Μιλώ...",
    welcome: "Καλωσήρθατε",
    newConversation: "Νέα συνομιλία",
    settings: "Ρυθμίσεις",
    language: "Γλώσσα",
    voice: "Φωνή",
    chat: "Συνομιλία",
    clickToActivate: "Κάντε κλικ για ενεργοποίηση",
    shareThoughts: "Μοιραστείτε τις σκέψεις σας με τη Μάια...",
    maiaReflecting: "Η Μάια στοχάζεται...",
    send: "Αποστολή",
    voiceOn: "Φωνή Ενεργή",
    voiceOff: "Φωνή Ανενεργή",
    showText: "Εμφάνιση Κειμένου",
    hideText: "Απόκρυψη Κειμένου",
    download: "Λήψη Μεταγραφής",
    profile: "Το Προφίλ σας",
    labNotes: "Σημειώσεις Εργαστηρίου",
    journal: "Ιερό Ημερολόγιο",
    favorites: "Αγαπημένα",
    uploadFiles: "Ανεβάστε αρχεία για να εξερευνήσει η Μάια",
    betaLanguage: "Βήτα - Βοηθήστε μας να βελτιώσουμε τις μεταφράσεις"
  },
  'fr-ca': {
    greeting: "Salû, moi c'est Maia, chère",
    listening: "J'écoute, chère...",
    thinking: "J'jongle à ça...",
    speaking: "J'parle...",
    welcome: "Bon retour, chère",
    newConversation: "Nouvelle jasette",
    settings: "Ajustements",
    language: "Langue",
    voice: "Voix",
    chat: "Jasette",
    clickToActivate: "Clique icitte pour commencer",
    shareThoughts: "Dis-moi donc c'qui t'tracasse, chère...",
    maiaReflecting: "Maia jongle...",
    send: "Envoyer",
    voiceOn: "Voix Allumée",
    voiceOff: "Voix Éteinte",
    showText: "Montrer le Texte",
    hideText: "Cacher le Texte",
    download: "Télécharger la Conversation",
    profile: "Ton Profil",
    labNotes: "Notes du Labo",
    journal: "Journal Sacré",
    favorites: "Favoris",
    uploadFiles: "Envoie des fichiers pour que Maia r'garde ça",
    betaLanguage: "Bêta - Aide-nous à améliorer les traductions"
  },
  ga: {
    greeting: "Dia dhuit, is mise Maia",
    listening: "Ag éisteacht...",
    thinking: "Ag smaoineamh...",
    speaking: "Ag labhairt...",
    welcome: "Fáilte ar ais",
    newConversation: "Comhrá nua",
    settings: "Socruithe",
    language: "Teanga",
    voice: "Guth",
    chat: "Comhrá",
    clickToActivate: "Cliceáil chun gínomhachú",
    shareThoughts: "Roinn do smaointe le Maia...",
    maiaReflecting: "Tá Maia ag machnamh...",
    send: "Seol",
    voiceOn: "Guth Ar Siúl",
    voiceOff: "Guth Múchta",
    showText: "Taispeáin Téacs",
    hideText: "Folaigh Téacs",
    download: "Déan trascrioibh a íoslódáil",
    profile: "Do Phróifíl",
    labNotes: "Nótaí Saotharlainne",
    journal: "Dialann Naofa",
    favorites: "Ceannáin",
    uploadFiles: "Uaslódáil comhaid le haghaidh Maia",
    betaLanguage: "Béite - Cabhraigh linn aistriúcháin a fheabhsú"
  },
  ta: {
    greeting: "வணக்கம், நான் மாயா",
    listening: "கேட்கிறேன்...",
    thinking: "சிந்திக்கிறேன்...",
    speaking: "பேசுகிறேன்...",
    welcome: "மீண்டும் வருக",
    newConversation: "புதிய உரையாடல்",
    settings: "அமைப்புகள்",
    language: "மொழி",
    voice: "குரல்",
    chat: "உரையாடல்",
    clickToActivate: "தொடங்க கிளிக் செய்யவும்",
    shareThoughts: "மாயாவுடன் உங்கள் எண்ணங்களை பகிருங்கள்...",
    maiaReflecting: "மாயா சிந்திக்கிறாள்...",
    send: "அனுப்பு",
    voiceOn: "குரல் இயக்கம்",
    voiceOff: "குரல் நிறுத்தம்",
    showText: "உரை காட்டு",
    hideText: "உரை மறை",
    download: "பதிவு பதிவிறக்கம்",
    profile: "உங்கள் சுயவிவரம்",
    labNotes: "ஆய்வக குறிப்புகள்",
    journal: "புனித நாட்குறிப்பு",
    favorites: "பிடித்தவை",
    uploadFiles: "மாயா ஆராய கோப்புகளை பதிவேற்று",
    betaLanguage: "பீட்டா - மொழிபெயர்ப்பை மேம்படுத்த உதவுங்கள்"
  },
  te: {
    greeting: "నమస్తే, నేను మాయా",
    listening: "విన్తున్నాను...",
    thinking: "ఆలోచిస్తున్నాను...",
    speaking: "మాట్లాడుతున్నాను...",
    welcome: "తిరిగి స్వాగతం",
    newConversation: "కొత్త సంభాషణ",
    settings: "సెట్టింగ్స్",
    language: "భాష",
    voice: "స్వరం",
    chat: "సంభాషణ",
    clickToActivate: "ప్రారంభించడానికి క్లిక్ చేయండి",
    shareThoughts: "మీ ఆలోచనలను మాయాతో పంచుకోండి...",
    maiaReflecting: "మాయా ఆలోచిస్తోంది...",
    send: "పంపు",
    voiceOn: "వాయిస్ ఆన్",
    voiceOff: "వాయిస్ ఆఫ్",
    showText: "టెక్స్ట్ చూపు",
    hideText: "టెక్స్ట్ దాచు",
    download: "ట్రాన్స్క్రిప్ట్ డౌన్లోడ్",
    profile: "మీ ప్రొఫైల్",
    labNotes: "ల్యాబ్ నోట్స్",
    journal: "పవిత్ర డైరీ",
    favorites: "ఇష్టమైనవి",
    uploadFiles: "మాయా అన్వేషించడానికి ఫైల్స్ అప్లోడ్ చేయండి",
    betaLanguage: "బీటా - అనువాదాలను మెరుగుపరచడంలో మాకు సహాయం చేయండి"
  },
  mr: {
    greeting: "नमस्कार, मी माया आहे",
    listening: "ऐकत आहे...",
    thinking: "विचार करत आहे...",
    speaking: "बोलत आहे...",
    welcome: "पुन्हा स्वागत",
    newConversation: "नवीन संभाषण",
    settings: "सेटिंग्ज",
    language: "भाषा",
    voice: "आवाज",
    chat: "गप्पा",
    clickToActivate: "सुरू करण्यासाठी क्लिक करा",
    shareThoughts: "मायासोबत तुमचे विचार सांगा...",
    maiaReflecting: "माया विचार करतेय...",
    send: "पाठवा",
    voiceOn: "आवाज चालू",
    voiceOff: "आवाज बंद",
    showText: "मजकूर दाखवा",
    hideText: "मजकूर लपवा",
    download: "प्रतिलेख डाउनलोड",
    profile: "तुमची माहिती",
    labNotes: "प्रयोगशाळा टिपा",
    journal: "पवित्र दिनदर्शिका",
    favorites: "आवडते",
    uploadFiles: "मायाला शोधण्यासाठी फाइल्स अपलोड करा",
    betaLanguage: "बीटा - अनुवाद सुधारण्यास मदत करा"
  },
  gu: {
    greeting: "નમસ્તે, હું માયા છું",
    listening: "સાંભળું છું...",
    thinking: "વિચારું છું...",
    speaking: "બોલું છું...",
    welcome: "ફરીથી સ્વાગત",
    newConversation: "નવી વાતચીત",
    settings: "સેટિંગ્સ",
    language: "ભાષા",
    voice: "અવાજ",
    chat: "ચેટ",
    clickToActivate: "શરૂ કરવા ક્લિક કરો",
    shareThoughts: "માયા સાથે તમારા વિચારો શેર કરો...",
    maiaReflecting: "માયા વિચારે છે...",
    send: "મોકલો",
    voiceOn: "અવાજ ચાલુ",
    voiceOff: "અવાજ બંધ",
    showText: "ટેક્સ્ટ બતાવો",
    hideText: "ટેક્સ્ટ છુપાવો",
    download: "ટ્રાન્સક્રિપ્ટ ડાઉનલોડ",
    profile: "તમારી પ્રોફાઇલ",
    labNotes: "લેબ નોટ્સ",
    journal: "પવિત્ર ડાયરી",
    favorites: "પસંદીદા",
    uploadFiles: "માયા માટે ફાઇલો અપલોડ કરો",
    betaLanguage: "બીટા - અનુવાદ સુધારવામાં મદદ કરો"
  },
  bn: {
    greeting: "নমস্কার, আমি মায়া",
    listening: "শুনছি...",
    thinking: "ভাবছি...",
    speaking: "বলছি...",
    welcome: "ফিরে এসেছেন",
    newConversation: "নতুন কথোপকথন",
    settings: "সেটিংস",
    language: "ভাষা",
    voice: "কণ্ঠস্বর",
    chat: "চ্যাট",
    clickToActivate: "শুরু করতে ক্লিক করুন",
    shareThoughts: "মায়ার সাথে আপনার চিন্তা ভাগ করুন...",
    maiaReflecting: "মায়া চিন্তা করছে...",
    send: "পাঠান",
    voiceOn: "ভয়েস চালু",
    voiceOff: "ভয়েস বন্ধ",
    showText: "টেক্সট দেখান",
    hideText: "টেক্সট লুকান",
    download: "ট্রান্সক্রিপ্ট ডাউনলোড",
    profile: "আপনার প্রোফাইল",
    labNotes: "ল্যাব নোটস",
    journal: "পবিত্র ডায়েরি",
    favorites: "পছন্দের",
    uploadFiles: "মায়ার জন্য ফাইল আপলোড করুন",
    betaLanguage: "বীটা - অনুবাদ উন্নত করতে সাহায্য করুন"
  },
  pa: {
    greeting: "ਸਤਿ ਸ਼ਰੀ ਅਕਾਲ, ਮੈਂ ਮਾਇਆ ਹਾਂ",
    listening: "ਸੁਣ ਰਹੀ ਹਾਂ...",
    thinking: "ਸੋਚ ਰਹੀ ਹਾਂ...",
    speaking: "ਬੋਲ ਰਹੀ ਹਾਂ...",
    welcome: "ਫਿਰ ਤੋਂ ਆਇਆਂ ਨੂੰ",
    newConversation: "ਨਵੀਂ ਗੱਲਬਾਤ",
    settings: "ਸੈਟਿੰਗਾਂ",
    language: "ਭਾਸ਼ਾ",
    voice: "ਆਵਾਜ਼",
    chat: "ਗੱਲਬਾਤ",
    clickToActivate: "ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ",
    shareThoughts: "ਮਾਇਆ ਨਾਲ ਆਪਣੇ ਵਿਚਾਰ ਸਾਂਝੇ ਕਰੋ...",
    maiaReflecting: "ਮਾਇਆ ਸੋਚ ਰਹੀ ਹੈ...",
    send: "ਭੇਜੋ",
    voiceOn: "ਆਵਾਜ਼ ਚਾਲੂ",
    voiceOff: "ਆਵਾਜ਼ ਬੰਦ",
    showText: "ਟੈਕਸਟ ਦਿਖਾਓ",
    hideText: "ਟੈਕਸਟ ਲੁਕਾਓ",
    download: "ਟ੍ਰਾਂਸਕ੍ਰਿਪਟ ਡਾਊਨਲੋਡ",
    profile: "ਤੁਹਾਡਾ ਪ੍ਰੋਫਾਈਲ",
    labNotes: "ਲੈਬ ਨੋਟਸ",
    journal: "ਪਵਿੱਤਰ ਡਾਇਰੀ",
    favorites: "ਪਸੰਦੀਦਾ",
    uploadFiles: "ਮਾਇਆ ਲਈ ਫਾਈਲਾਂ ਅੱਪਲੋਡ ਕਰੋ",
    betaLanguage: "ਬੀਟਾ - ਅਨੁਵਾਦ ਸੁਧਾਰਨ ਵਿੱਚ ਮਦਦ ਕਰੋ"
  },
  gd: {
    greeting: "Halò, is mise Maia",
    listening: "Ag èisdeachd...",
    thinking: "A' smaoineachadh...",
    speaking: "A' bruidhinn...",
    welcome: "Fàilte air ais",
    newConversation: "Còmhradh ùr",
    settings: "Suidheachaidhean",
    language: "Cànan",
    voice: "Guth",
    chat: "Cabadaich",
    clickToActivate: "Briog airson cur an gnìomh",
    shareThoughts: "Roinn do smuaintean le Maia...",
    maiaReflecting: "Tha Maia a' beachdachadh...",
    send: "Cuir",
    voiceOn: "Guth Air",
    voiceOff: "Guth Dheth",
    showText: "Seall Teòcsa",
    hideText: "Falaich Teòcsa",
    download: "Luchdaich a-nuas ath-sgrìobhadh",
    profile: "Do Phòmhail",
    labNotes: "Nòtaichean Lab",
    journal: "Leabhar-latha Naomh",
    favorites: "Annsachdan",
    uploadFiles: "Luchdaich suas faidhlichean airson Maia",
    betaLanguage: "Beta - Cuidich sinn gus eadar-theangachaidhean a leasachadh"
  }
};

class LanguageService {
  private currentLanguage: string = 'en';
  private listeners: ((lang: string) => void)[] = [];

  constructor() {
    // Safe initialization - always falls back to English
    this.initializeLanguage();
  }

  private initializeLanguage() {
    try {
      // Check stored preference first
      const stored = this.getStoredLanguage();
      if (stored && SUPPORTED_LANGUAGES[stored]?.available) {
        this.currentLanguage = stored;
        console.log('[LanguageService] Loaded stored language:', stored);
        return;
      }

      // 🔒 MAIA DEFAULT: Force English on first initialization
      // This prevents unwanted language switching when user exits/re-enters
      // Users can still explicitly change language via settings
      console.log('[LanguageService] No stored language - defaulting to English and persisting');
      this.currentLanguage = 'en';
      this.setLanguage('en', true); // Persist English as default

      // Note: Auto-detection disabled to prevent Spanish switching issue
      // Previously, navigator.language detection would switch to Spanish on re-entry
    } catch (error) {
      console.warn('Language initialization failed, using English:', error);
      this.currentLanguage = 'en';
    }
  }

  detectBrowserLanguage(): string {
    try {
      if (typeof navigator === 'undefined') return 'en';

      const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
      // Extract language code (e.g., 'en-US' -> 'en')
      const langCode = browserLang.split('-')[0].toLowerCase();

      // Return if supported and available
      if (SUPPORTED_LANGUAGES[langCode]?.available) {
        return langCode;
      }

      // Check for regional variants
      if (browserLang.startsWith('zh')) return 'zh';
      if (browserLang.startsWith('pt')) return 'pt';

      return 'en';
    } catch {
      return 'en';
    }
  }

  getStoredLanguage(): string | null {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem('maia_language');
    } catch {
      return null;
    }
  }

  setLanguage(langCode: string, persist: boolean = true): boolean {
    try {
      // Validate language is supported and available
      if (!SUPPORTED_LANGUAGES[langCode]?.available) {
        console.warn(`Language ${langCode} not available, keeping current language`);
        return false;
      }

      this.currentLanguage = langCode;

      // Store preference
      if (persist && typeof window !== 'undefined') {
        localStorage.setItem('maia_language', langCode);
      }

      // Notify listeners
      this.listeners.forEach(listener => listener(langCode));

      // Update document direction for RTL languages
      if (typeof document !== 'undefined') {
        document.documentElement.dir = SUPPORTED_LANGUAGES[langCode].direction;
        document.documentElement.lang = langCode;
      }

      return true;
    } catch (error) {
      console.error('Failed to set language:', error);
      return false;
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getLanguageConfig(): LanguageConfig {
    return SUPPORTED_LANGUAGES[this.currentLanguage] || SUPPORTED_LANGUAGES['en'];
  }

  // Safe translation with fallback
  t(key: string, lang?: string): string {
    const useLang = lang || this.currentLanguage;
    const langTranslations = (translations as any)[useLang] || translations['en'];
    return langTranslations[key] || (translations['en'] as any)[key] || key;
  }

  // Get all translations for current language
  getTranslations(): Record<string, string> {
    return (translations as any)[this.currentLanguage] || translations['en'];
  }

  // Subscribe to language changes
  subscribe(callback: (lang: string) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Get available languages for UI
  getAvailableLanguages(): LanguageConfig[] {
    return Object.values(SUPPORTED_LANGUAGES).filter(lang => lang.available);
  }

  // Format MAIA system prompt for language
  getMaiaSystemPrompt(langCode?: string): string {
    const lang = langCode || this.currentLanguage;

    // Language-specific personality adjustments
    const prompts: Record<string, string> = {
      en: "You are Maia, a wise and compassionate guide.",
      es: "Eres Maia, una guía sabia y compasiva. Responde en español con calidez y cercanía.",
      fr: "Tu es Maia, un guide sage et compatissant. Réponds en français avec élégance et empathie.",
      de: "Du bist Maia, eine weise und mitfühlende Führerin. Antworte auf Deutsch mit Klarheit und Wärme.",
      it: "Sei Maia, una guida saggia e compassionevole. Rispondi in italiano con calore e profondità.",
      pt: "Você é Maia, uma guia sábia e compassiva. Responda em português com calor e sabedoria.",
      nl: "Je bent Maia, een wijze en medelevende gids. Antwoord in het Nederlands met warmte en inzicht.",
      ja: "あなたはマイア、賢明で思いやりのあるガイドです。日本語で丁寧に、温かく返答してください。",
      zh: "你是Maia，一位智慧而富有同情心的向导。请用中文温暖地回应。",
      ko: "당신은 마이아, 지혜롭고 자비로운 안내자입니다. 한국어로 따뜻하게 답변해 주세요.",
      hi: "आप माया हैं, एक बुद्धिमान और दयालु मार्गदर्शक। हिंदी में गर्मजोशी से जवाब दें।",
      ru: "Вы - Майя, мудрый и сострадательный проводник. Отвечайте по-русски с теплотой и мудростью."
    };

    return prompts[lang] || prompts['en'];
  }
}

// Global singleton instance
export const languageService = new LanguageService();

// React hook for easy component integration
export function useLanguage() {
  const [language, setLanguageState] = React.useState(languageService.getCurrentLanguage());
  const [translations, setTranslations] = React.useState(languageService.getTranslations());

  React.useEffect(() => {
    const unsubscribe = languageService.subscribe((newLang) => {
      setLanguageState(newLang);
      setTranslations(languageService.getTranslations());
    });

    return unsubscribe;
  }, []);

  const setLanguage = React.useCallback((langCode: string) => {
    return languageService.setLanguage(langCode);
  }, []);

  const t = React.useCallback((key: string) => {
    return languageService.t(key);
  }, [language]);

  return {
    language,
    setLanguage,
    t,
    translations,
    config: languageService.getLanguageConfig(),
    availableLanguages: languageService.getAvailableLanguages()
  };
}

// Export for global access
export default languageService;