/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  ChevronRight, 
  BookOpen, 
  Heart,
  CheckCircle2, 
  Sparkles, 
  User, 
  ArrowLeft,
  RefreshCw,
  Zap,
  Star,
  GraduationCap,
  Plus,
  Trash2,
  FileText,
  Lightbulb,
  HelpCircle
} from 'lucide-react';
import { cn } from './lib/utils';
import { StudyData } from './types';
import ReactMarkdown from 'react-markdown';

const MAX_PHOTOS = 20;
const OWNER_EMAIL = 'samanajeeb85@gmail.com';

// Step Types
type Step = 'welcome' | 'subject' | 'photo' | 'generating' | 'dashboard';
type Language = 'en' | 'ar';

const translations = {
  en: {
    welcome: "Welcome to",
    companion: "Your AI-powered study companion. Let's get started!",
    nameLabel: "What's your name?",
    namePlaceholder: "Enter your name...",
    next: "Next Step",
    subjectTitle: "What are we studying?",
    subjectDesc: "Enter the subject or topic you want to master.",
    subjectPlaceholder: "e.g. Biology, History, Math...",
    uploadTitle: "Upload your notes",
    uploadDesc: "Add up to {limit} photos of your study material.",
    generating: "Analyzing your notes...",
    generatingDesc: "Our AI is synthesizing your material into flashcards and exams. This takes about 30 seconds.",
    dashboard: "Study Dashboard",
    subject: "Subject",
    explanation: "Explanation",
    flashcards: "Flashcards",
    exam: "Exam",
    newSession: "Start New Session",
    back: "Back",
    detailed: "Detailed",
    simple: "Simplified",
    materialExplanation: "Material Explanation",
    simpleMode: "Simple Mode",
    simpleModeDesc: "We've broken down complex terms and used easier language to help you grasp the core concepts quickly.",
    flashcard: "Question",
    clickFlip: "Click to flip",
    answer: "Answer",
    question: "Question",
    correct: "Correct!",
    notQuite: "Not quite...",
    explainMistakes: "Explain my mistakes 💕",
    mistakeSummary: "Mistake Summary",
    analyzingMistakes: "Analyzing your mistakes...",
    noMistakes: "Great job! You didn't make any mistakes.",
    examFinished: "Exam Finished!",
    login: "Login with Google",
    logout: "Logout",
    popupBlocked: "Popups are blocked in the preview. Please click 'Open in new tab' at the top right to log in, or try the redirect method.",
    tryRedirect: "Try Redirect Login"
  },
  ar: {
    welcome: "مرحباً بك في",
    companion: "رفيقك الدراسي المدعوم بالذكاء الاصطناعي. لنبدأ!",
    nameLabel: "ما هو اسمك؟",
    namePlaceholder: "أدخل اسمك هنا...",
    next: "الخطوة التالية",
    subjectTitle: "ماذا تدرس؟",
    subjectDesc: "أدخل المادة أو الموضوع الذي تريد إتقانه.",
    subjectPlaceholder: "مثلاً: أحياء، تاريخ، رياضيات...",
    uploadTitle: "ارفع ملاحظاتك",
    uploadDesc: "أضف حتى {limit} صور لموادك الدراسية.",
    generating: "جاري تحليل ملاحظاتك...",
    generatingDesc: "يقوم الذكاء الاصطناعي بتحويل موادك إلى بطاقات تعليمية واختبارات. يستغرق هذا حوالي 30 ثانية.",
    dashboard: "لوحة الدراسة",
    subject: "المادة",
    explanation: "الشرح",
    flashcards: "البطاقات",
    exam: "الاختبار",
    newSession: "بدء جلسة جديدة",
    back: "رجوع",
    detailed: "مفصل",
    simple: "مبسط",
    materialExplanation: "شرح المادة",
    simpleMode: "الوضع المبسط",
    simpleModeDesc: "لقد قمنا بتبسيط المصطلحات المعقدة واستخدمنا لغة أسهل لمساعدتك على فهم المفاهيم الأساسية بسرعة.",
    flashcard: "سؤال",
    clickFlip: "انقر للقلب",
    answer: "الإجابة",
    question: "سؤال",
    correct: "صحيح!",
    notQuite: "ليس تماماً...",
    explainMistakes: "اشرح أخطائي 💕",
    mistakeSummary: "ملخص الأخطاء",
    analyzingMistakes: "جاري تحليل أخطائك...",
    noMistakes: "عمل رائع! لم ترتكب أي أخطاء.",
    examFinished: "انتهى الاختبار!",
    login: "تسجيل الدخول بجوجل",
    logout: "تسجيل الخروج",
    popupBlocked: "النوافذ المنبثقة محظورة في المعاينة. يرجى النقر على 'فتح في علامة تبويب جديدة' في الأعلى لتسجيل الدخول، أو جرب طريقة إعادة التوجيه.",
    tryRedirect: "تجربة تسجيل الدخول بإعادة التوجيه"
  }
};

const Header = ({ name, lang, onReset }: { name: string, lang: Language, onReset: () => void }) => (
  <header className={cn(
    "flex items-center justify-between p-6 bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50",
    lang === 'ar' ? "flex-row-reverse" : "flex-row"
  )}>
    <button 
      onClick={onReset}
      className={cn("flex items-center gap-2 hover:opacity-80 transition-opacity group", lang === 'ar' ? "flex-row-reverse" : "flex-row")}
    >
      <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-200 group-hover:scale-110 transition-transform">
        <Heart size={24} fill="currentColor" />
      </div>
      <h1 className="text-2xl font-bold text-pink-600 tracking-tight">StudyBuddy</h1>
    </button>
    {name && (
      <div className={cn("flex items-center gap-2 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100", lang === 'ar' ? "flex-row-reverse" : "flex-row")}>
        <User size={16} className="text-pink-500" />
        <span className="text-sm font-medium text-pink-700">{name}</span>
      </div>
    )}
  </header>
);

const StepWrapper = ({ children, lang }: { children: React.ReactNode, lang: Language }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={cn("max-w-md mx-auto px-6 py-12 flex flex-col gap-8", lang === 'ar' ? "text-right" : "text-left")}
    dir={lang === 'ar' ? "rtl" : "ltr"}
  >
    {children}
  </motion.div>
);

export default function App() {
  const [step, setStep] = useState<Step>('welcome');
  const [lang, setLang] = useState<Language>('en');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [studyData, setStudyData] = useState<StudyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'explanation' | 'flashcards' | 'exam'>('explanation');
  const [isSimple, setIsSimple] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [mistakeExplanation, setMistakeExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  
  const loadingMessages = lang === 'ar' ? [
    "جاري تحليل صورك بدقة...",
    "نقوم بتلخيص أهم النقاط لك...",
    "نصمم بطاقات تعليمية ذكية...",
    "نجهز لك اختباراً ممتعاً...",
    "لحظات وسيكون كل شيء جاهزاً!"
  ] : [
    "Analyzing your photos carefully...",
    "Summarizing key points for you...",
    "Designing smart flashcards...",
    "Preparing a fun exam for you...",
    "Almost there, stay tuned!"
  ];

  React.useEffect(() => {
    let interval: any;
    if (step === 'generating') {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [step, loadingMessages.length]);

  const t = translations[lang];

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (photos.length + files.length > MAX_PHOTOS) {
        setError(`You've reached the limit of ${MAX_PHOTOS} photos.`);
        return;
      }

      const newPhotos: string[] = [];
      let processed = 0;
      
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const compressed = await compressImage(reader.result as string);
          newPhotos.push(compressed);
          processed++;
          if (processed === files.length) {
            setPhotos(prev => [...prev, ...newPhotos]);
            setError(null);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleExplainMistakes = async () => {
    if (!studyData) return;
    
    const mistakes = studyData.exam.filter((q, idx) => userAnswers[idx] && userAnswers[idx] !== q.correctAnswer);
    
    if (mistakes.length === 0) {
      setMistakeExplanation(t.noMistakes);
      return;
    }

    setIsExplaining(true);
    try {
      const response = await fetch('/api/v1/explain-mistakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyData, mistakes, userAnswers, lang })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[App] Server error response:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Failed to explain mistakes (Status: ${response.status})`);
        } catch (e) {
          throw new Error(`Server error (${response.status}): ${errorText.substring(0, 100)}`);
        }
      }

      const data = await response.json();
      setMistakeExplanation(data.text || "Could not generate explanation.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to explain mistakes.");
    } finally {
      setIsExplaining(false);
    }
  };

  const resetApp = () => {
    setStep('welcome');
    setSubject('');
    setPhotos([]);
    setStudyData(null);
    setUserAnswers({});
    setMistakeExplanation(null);
    setError(null);
  };

  // --- AI Logic ---
  const generateStudyMaterial = async () => {
    if (photos.length === 0) return;
    setStep('generating');
    setError(null);

    try {
      console.log("Starting AI generation with", photos.length, "photos...");

      const response = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, photos, lang })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[App] Server error response:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Failed to generate study materials (Status: ${response.status})`);
        } catch (e) {
          throw new Error(`Server error (${response.status}): ${errorText.substring(0, 100)}`);
        }
      }

      console.log("AI generation successful!");
      const data = await response.json() as StudyData;
      setStudyData(data);
      setStep('dashboard');
    } catch (err: any) {
      console.error("AI Generation error:", err);
      const errorMessage = err.message || "Failed to generate study materials. Please try again.";
      setError(errorMessage);
      setStep('photo');
    }
  };


  return (
    <div className="min-h-screen bg-pink-50 selection:bg-pink-200">
        <Header name={name} lang={lang} onReset={resetApp} />

        <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <StepWrapper key="welcome" lang={lang}>
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-pink-100 rounded-3xl text-pink-600 mb-2 shadow-xl shadow-pink-100 border-2 border-pink-100">
                <Heart size={48} fill="currentColor" />
              </div>
              <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
                {t.welcome} <span className="text-pink-600">StudyBuddy</span>
              </h2>
              <p className="text-gray-500 text-lg">{t.companion}</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={() => setLang('en')}
                  className={cn(
                    "px-4 py-2 rounded-xl font-bold transition-all border-2",
                    lang === 'en' ? "bg-pink-600 text-white border-pink-600" : "bg-white text-gray-500 border-pink-100 hover:border-pink-300"
                  )}
                >
                  English
                </button>
                <button
                  onClick={() => setLang('ar')}
                  className={cn(
                    "px-4 py-2 rounded-xl font-bold transition-all border-2",
                    lang === 'ar' ? "bg-pink-600 text-white border-pink-600" : "bg-white text-gray-500 border-pink-100 hover:border-pink-300"
                  )}
                >
                  العربية
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">{t.nameLabel}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="w-full px-6 py-4 bg-white border-2 border-pink-100 rounded-2xl focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all text-lg shadow-sm"
                    />
                  </div>
                  <button
                    onClick={() => name.trim() && setStep('subject')}
                    disabled={!name.trim()}
                    className="w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-lg shadow-pink-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {t.next}
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </StepWrapper>
        )}

        {step === 'subject' && (
          <StepWrapper key="subject" lang={lang}>
            <button onClick={() => setStep('welcome')} className={cn("flex items-center gap-2 text-pink-600 font-medium hover:text-pink-700 transition-colors", lang === 'ar' ? "flex-row-reverse" : "flex-row")}>
              {lang === 'ar' ? <ArrowLeft size={18} className="rotate-180" /> : <ArrowLeft size={18} />} {t.back}
            </button>
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">{t.subjectTitle}</h2>
              <p className="text-gray-500">{t.subjectDesc}</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t.subjectPlaceholder}
                  className="w-full px-6 py-4 bg-white border-2 border-pink-100 rounded-2xl focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all text-lg shadow-sm"
                />
              </div>
              <button
                disabled={!subject}
                onClick={() => setStep('photo')}
                className="w-full py-4 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-xl shadow-pink-200 transition-all flex items-center justify-center gap-2 group"
              >
                {t.next}
                {lang === 'ar' ? <ChevronRight size={20} className="rotate-180" /> : <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </StepWrapper>
        )}

        {step === 'photo' && (
          <StepWrapper key="photo" lang={lang}>
            <button onClick={() => setStep('subject')} className={cn("flex items-center gap-2 text-pink-600 font-medium hover:text-pink-700 transition-colors", lang === 'ar' ? "flex-row-reverse" : "flex-row")}>
              {lang === 'ar' ? <ArrowLeft size={18} className="rotate-180" /> : <ArrowLeft size={18} />} {t.back}
            </button>
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">{t.uploadTitle}</h2>
              <p className="text-gray-500">
                {t.uploadDesc.replace('{limit}', MAX_PHOTOS.toString())}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {photos.map((p, idx) => (
                <div key={idx} className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-md border-2 border-pink-100 group">
                  <img src={p} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removePhoto(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <label className="aspect-square bg-white rounded-2xl border-2 border-dashed border-pink-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-all group">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Add Photo</span>
                <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {error && (
              <p className="text-red-500 text-center text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <button
              disabled={photos.length === 0}
              onClick={generateStudyMaterial}
              className="w-full py-4 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-xl shadow-pink-200 transition-all flex items-center justify-center gap-2 group"
            >
              Generate Study Guide ({photos.length})
              <Zap size={20} className="fill-white" />
            </button>
          </StepWrapper>
        )}

        {step === 'generating' && (
          <StepWrapper key="generating" lang={lang}>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 border-4 border-pink-200 border-t-pink-600 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center text-pink-600">
                  <Sparkles size={40} className="animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">{t.generating}</h2>
                <motion.p 
                  key={loadingMessageIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-pink-600 font-medium max-w-xs mx-auto"
                >
                  {loadingMessages[loadingMessageIndex]}
                </motion.p>
                <p className="text-gray-500 max-w-xs mx-auto">
                  {t.generatingDesc}
                </p>
              </div>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    className="w-3 h-3 bg-pink-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </StepWrapper>
        )}

        {step === 'dashboard' && studyData && (
          <div key="dashboard" className={cn("max-w-4xl mx-auto px-6 py-8", lang === 'ar' ? "text-right" : "text-left")} dir={lang === 'ar' ? "rtl" : "ltr"}>
            <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12", lang === 'ar' ? "md:flex-row-reverse" : "md:flex-row")}>
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-gray-900">{t.dashboard}</h2>
                <p className="text-gray-500">{t.subject}: <span className="text-pink-600 font-semibold">{subject}</span></p>
              </div>
              
              <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-pink-100 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('explanation')}
                  className={cn(
                    "px-4 md:px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap",
                    activeTab === 'explanation' ? "bg-pink-600 text-white shadow-lg shadow-pink-200" : "text-gray-500 hover:text-pink-600",
                    lang === 'ar' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <FileText size={18} /> {t.explanation}
                </button>
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className={cn(
                    "px-4 md:px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap",
                    activeTab === 'flashcards' ? "bg-pink-600 text-white shadow-lg shadow-pink-200" : "text-gray-500 hover:text-pink-600",
                    lang === 'ar' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <Star size={18} /> {t.flashcards}
                </button>
                <button
                  onClick={() => setActiveTab('exam')}
                  className={cn(
                    "px-4 md:px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap",
                    activeTab === 'exam' ? "bg-pink-600 text-white shadow-lg shadow-pink-200" : "text-gray-500 hover:text-pink-600",
                    lang === 'ar' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <GraduationCap size={18} /> {t.exam}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'explanation' ? (
                <motion.div
                  key="explanation-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-50 relative overflow-hidden">
                    <div className={cn("flex items-center justify-between mb-8", lang === 'ar' ? "flex-row-reverse" : "flex-row")}>
                      <div className={cn("flex items-center gap-3", lang === 'ar' ? "flex-row-reverse" : "flex-row")}>
                        <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600">
                          <Lightbulb size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{t.materialExplanation}</h3>
                      </div>
                      
                      <div className={cn("flex items-center gap-2 bg-pink-50 p-1 rounded-xl border border-pink-100", lang === 'ar' ? "flex-row-reverse" : "flex-row")}>
                        <button
                          onClick={() => setIsSimple(false)}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                            !isSimple ? "bg-white text-pink-600 shadow-sm" : "text-pink-400 hover:text-pink-600"
                          )}
                        >
                          {t.detailed}
                        </button>
                        <button
                          onClick={() => setIsSimple(true)}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1",
                            isSimple ? "bg-white text-pink-600 shadow-sm" : "text-pink-400 hover:text-pink-600",
                            lang === 'ar' ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          <Sparkles size={14} /> {t.simple}
                        </button>
                      </div>
                    </div>

                    <div className={cn("prose prose-pink max-w-none", lang === 'ar' ? "text-right" : "text-left")}>
                      <div className="text-gray-700 leading-relaxed space-y-4">
                        <ReactMarkdown>
                          {isSimple ? studyData.simpleExplanation : studyData.comprehensiveExplanation}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {isSimple && (
                      <div className={cn("mt-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 items-start", lang === 'ar' ? "flex-row-reverse" : "flex-row")}>
                        <HelpCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-700">
                          <strong>{t.simpleMode}:</strong> {t.simpleModeDesc}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : activeTab === 'flashcards' ? (
                <motion.div
                  key="flashcards-grid"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {studyData.flashcards.map((card, idx) => (
                    <FlashcardComponent key={idx} card={card} index={idx} lang={lang} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="exam-list"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {studyData.exam.map((q, idx) => (
                    <ExamQuestionComponent 
                      key={idx} 
                      question={q} 
                      index={idx} 
                      lang={lang} 
                      onAnswer={(answer) => setUserAnswers(prev => ({ ...prev, [idx]: answer }))}
                      initialAnswer={userAnswers[idx]}
                    />
                  ))}

                  {Object.keys(userAnswers).length === studyData.exam.length && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl p-8 shadow-xl border-2 border-pink-200 space-y-6"
                    >
                      <div className="text-center space-y-2">
                        <div className="inline-flex p-3 bg-green-100 text-green-600 rounded-2xl mb-2">
                          <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{t.examFinished}</h3>
                        <p className="text-gray-500">
                          {lang === 'ar' ? 'لقد أجبت على جميع الأسئلة!' : 'You have answered all questions!'}
                        </p>
                      </div>

                      {!mistakeExplanation && !isExplaining && (
                        <button
                          onClick={handleExplainMistakes}
                          className="w-full py-4 bg-pink-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Sparkles size={20} /> {t.explainMistakes}
                        </button>
                      )}

                      {isExplaining && (
                        <div className="flex flex-col items-center gap-4 py-8">
                          <RefreshCw size={32} className="text-pink-500 animate-spin" />
                          <p className="text-pink-600 font-medium animate-pulse">{t.analyzingMistakes}</p>
                        </div>
                      )}

                      {mistakeExplanation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-2 text-pink-600 font-bold border-b border-pink-100 pb-2">
                            <Lightbulb size={20} /> {t.mistakeSummary}
                          </div>
                          <div className="prose prose-pink max-w-none text-gray-700 leading-relaxed">
                            <ReactMarkdown>{mistakeExplanation}</ReactMarkdown>
                          </div>
                          <button
                            onClick={() => setMistakeExplanation(null)}
                            className="text-sm text-pink-400 hover:text-pink-600 font-medium"
                          >
                            {lang === 'ar' ? 'إغلاق' : 'Close'}
                          </button>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => {
                  setStep('subject');
                  setPhotos([]);
                  setStudyData(null);
                  setUserAnswers({});
                  setMistakeExplanation(null);
                }}
                className={cn("flex items-center gap-2 text-gray-500 hover:text-pink-600 font-medium transition-colors", lang === 'ar' ? "flex-row-reverse" : "flex-row")}
              >
                <RefreshCw size={18} /> {t.newSession}
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FlashcardComponent({ card, index, lang }: { card: { question: string, answer: string }, index: number, lang: Language }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const t = translations[lang];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="perspective-1000 h-64 cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={cn(
        "relative w-full h-full transition-all duration-500 preserve-3d",
        isFlipped ? "rotate-y-180" : ""
      )}>
        {/* Front */}
        <div className={cn("absolute inset-0 backface-hidden bg-white border-2 border-pink-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm group-hover:shadow-md transition-shadow", lang === 'ar' ? "text-right" : "text-left")}>
          <span className={cn("absolute top-4 text-xs font-bold text-pink-300 uppercase tracking-widest", lang === 'ar' ? "right-4" : "left-4")}>
            {t.flashcard} {index + 1}
          </span>
          <p className="text-xl font-bold text-gray-800 leading-relaxed">{card.question}</p>
          <div className={cn("mt-6 text-pink-400 text-sm font-medium flex items-center gap-1", lang === 'ar' ? "flex-row-reverse" : "flex-row")}>
            <RefreshCw size={14} /> {t.clickFlip}
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-pink-600 border-2 border-pink-500 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl">
          <span className={cn("absolute top-4 text-xs font-bold text-pink-200 uppercase tracking-widest", lang === 'ar' ? "right-4" : "left-4")}>
            {t.answer}
          </span>
          <p className="text-xl font-bold text-white leading-relaxed">{card.answer}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ExamQuestionComponent({ question, index, lang, onAnswer, initialAnswer }: { 
  question: any, 
  index: number, 
  lang: Language,
  onAnswer: (answer: string) => void,
  initialAnswer?: string
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(initialAnswer || null);
  const [showExplanation, setShowExplanation] = useState(!!initialAnswer);
  const t = translations[lang];

  const isCorrect = selectedOption === question.correctAnswer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn("bg-white border-2 border-pink-100 rounded-3xl p-8 shadow-sm space-y-6", lang === 'ar' ? "text-right" : "text-left")}
      dir={lang === 'ar' ? "rtl" : "ltr"}
    >
      <div className="space-y-2">
        <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">{t.question} {index + 1}</span>
        <h3 className="text-xl font-bold text-gray-900 leading-relaxed">{question.question}</h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option: string, i: number) => {
          const isSelected = selectedOption === option;
          const isActuallyCorrect = option === question.correctAnswer;
          
          let buttonClass = "w-full p-4 text-left rounded-2xl border-2 font-medium transition-all flex items-center justify-between group";
          if (lang === 'ar') buttonClass = "w-full p-4 text-right rounded-2xl border-2 font-medium transition-all flex flex-row-reverse items-center justify-between group";
          
          if (!selectedOption) {
            buttonClass += " border-pink-50 bg-pink-50/30 hover:border-pink-200 hover:bg-pink-50 text-gray-700";
          } else {
            if (isSelected) {
              buttonClass += isCorrect ? " border-green-500 bg-green-50 text-green-700" : " border-red-500 bg-red-50 text-red-700";
            } else if (isActuallyCorrect) {
              buttonClass += " border-green-500 bg-green-50 text-green-700 opacity-50";
            } else {
              buttonClass += " border-gray-100 bg-gray-50 text-gray-400";
            }
          }

          return (
            <button
              key={i}
              disabled={!!selectedOption}
              onClick={() => {
                setSelectedOption(option);
                setShowExplanation(true);
                onAnswer(option);
              }}
              className={buttonClass}
            >
              {option}
              {selectedOption && isActuallyCorrect && <CheckCircle2 size={20} className="text-green-500" />}
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pt-4 border-t border-pink-50"
        >
          <div className={cn(
            "p-4 rounded-2xl flex gap-3",
            isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800",
            lang === 'ar' ? "flex-row-reverse" : "flex-row"
          )}>
            <div className="shrink-0 mt-1">
              <Sparkles size={18} />
            </div>
            <div className="space-y-1">
              <p className="font-bold">{isCorrect ? t.correct : t.notQuite}</p>
              <p className="text-sm opacity-90 leading-relaxed">{question.explanation}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
