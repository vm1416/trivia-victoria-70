import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './lib/supabase';
import { questions } from './lib/questions';
import type { Question } from './lib/questions';
import {
  Trophy,
  Clock,
  Play,
  Crown,
  Star,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Medal,
  Camera,
  RotateCcw,
} from 'lucide-react';

type Screen = 'welcome' | 'quiz' | 'results' | 'ranking' | 'gallery';

const TIMER_SECONDS = 15;

const GALLERY_IMAGES = [
  {
    url: 'https://images.pexels.com/photos/1314595/pexels-photo-1314595.jpeg?auto=compress&cs=tinysrgb&w=600',
    caption: 'Celebrando la vida',
  },
  {
    url: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=600',
    caption: 'Momentos inolvidables',
  },
  {
    url: 'https://images.pexels.com/photos/1589261/pexels-photo-1589261.jpeg?auto=compress&cs=tinysrgb&w=600',
    caption: 'Rodeada de amor',
  },
  {
    url: 'https://images.pexels.com/photos/1096788/pexels-photo-1096788.jpeg?auto=compress&cs=tinysrgb&w=600',
    caption: 'Siempre elegante',
  },
  {
    url: 'https://images.pexels.com/photos/1674912/pexels-photo-1674912.jpeg?auto=compress&cs=tinysrgb&w=600',
    caption: 'Junto a los suyos',
  },
  {
    url: 'https://images.pexels.com/photos/331107/pexels-photo-331107.jpeg?auto=compress&cs=tinysrgb&w=600',
    caption: 'Feliz cumpleaños',
  },
];

function getScoreMessage(score: number): string {
  const pct = score / questions.length;
  if (pct === 1) return '¡Perfecto! La conoces mejor que nadie';
  if (pct >= 0.8) return '¡Excelente! Casi la conoces de memoria';
  if (pct >= 0.6) return '¡Muy bien! Sabes bastante de Victoria';
  if (pct >= 0.4) return 'No está mal, pero puedes mejorar';
  return 'Parece que necesitas conocerla más';
}

function getScoreIcon(score: number) {
  const pct = score / questions.length;
  if (pct === 1) return <Crown className="w-16 h-16 text-amber-500 mx-auto" />;
  if (pct >= 0.8) return <Star className="w-16 h-16 text-amber-500 mx-auto" />;
  if (pct >= 0.6) return <Medal className="w-16 h-16 text-amber-500 mx-auto" />;
  return <Trophy className="w-16 h-16 text-amber-500 mx-auto" />;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [playerName, setPlayerName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [rankings, setRankings] = useState<{ player_name: string; score: number }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [quizTransition, setQuizTransition] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finishQuiz = useCallback(async (finalAnswers: (number | null)[]) => {
    const computed = finalAnswers.reduce((acc, ans, i) => {
      if (ans === null) return acc;
      return acc + (ans === questions[i].correctIndex ? 1 : 0);
    }, 0);
    setScore(computed);

    try {
      await supabase.from('trivia_scores').insert({
        player_name: playerName.trim(),
        score: computed,
      });
    } catch (e) {
      console.error('Error saving score:', e);
    }
    setScreen('results');
  }, [playerName]);

  const advanceQuestion = useCallback((ans: (number | null)[], curQ: number) => {
    setQuizTransition(true);
    setTimeout(() => {
      if (curQ < questions.length - 1) {
        setCurrentQuestion(curQ + 1);
        setTimeLeft(TIMER_SECONDS);
        setSelectedAnswer(null);
        setShowCorrect(false);
      } else {
        finishQuiz(ans);
      }
      setQuizTransition(false);
    }, 300);
  }, [finishQuiz]);

  const handleTimeUp = useCallback(() => {
    setShowCorrect(true);
    const delay = questions[currentQuestion].explanation ? 4000 : 1500;
    setTimeout(() => advanceQuestion(answers, currentQuestion), delay);
  }, [answers, currentQuestion, advanceQuestion]);

  useEffect(() => {
    if (screen !== 'quiz' || showCorrect) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen, currentQuestion, showCorrect, handleTimeUp]);

  const startQuiz = () => {
    if (!playerName.trim()) return;
    const freshAnswers = Array(questions.length).fill(null);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers(freshAnswers);
    setTimeLeft(TIMER_SECONDS);
    setSelectedAnswer(null);
    setShowCorrect(false);
    setScreen('quiz');
  };

  const selectAnswer = (index: number) => {
    if (selectedAnswer !== null || showCorrect) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);
    setSelectedAnswer(index);
    setShowCorrect(true);

    if (index === questions[currentQuestion].correctIndex) {
      setScore((s) => s + 1);
    }

    const delay = questions[currentQuestion].explanation ? 4000 : 1500;
    setTimeout(() => advanceQuestion(newAnswers, currentQuestion), delay);
  };

  const loadRankings = async () => {
    const { data } = await supabase
      .from('trivia_scores')
      .select('player_name, score')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10);
    if (data) setRankings(data);
    setScreen('ranking');
  };

  const resetGame = () => {
    setPlayerName('');
    setScreen('welcome');
  };

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 7 ? '#b8860b' : timeLeft > 3 ? '#d4a017' : '#c0392b';

  // ── WELCOME ──
  if (screen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 w-60 h-60 bg-orange-100/20 rounded-full blur-3xl -translate-x-1/2" />

        <div className="relative max-w-md w-full text-center">
          <div className="mb-8">
            <Sparkles className="w-14 h-14 mx-auto text-amber-600 mb-4 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-900 mb-3 leading-tight tracking-tight">
              ¿Cuánto sabes
              <br />
              de Victoria?
            </h1>
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
            </div>
            <p className="mt-5 text-amber-800/70 text-lg leading-relaxed">
              Un juego de trivia para celebrar
              <br />
              sus <span className="font-semibold text-amber-900">70 años</span>
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-7 shadow-xl shadow-amber-200/30 border border-amber-200/50">
            <label className="block text-left text-amber-900 font-semibold mb-2.5 text-sm tracking-wide uppercase">
              Tu nombre
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startQuiz()}
              placeholder="Escribe tu nombre aquí..."
              className="w-full px-5 py-3.5 rounded-2xl border-2 border-amber-200 bg-amber-50/40 text-amber-900 placeholder-amber-400/70 focus:border-amber-500 focus:ring-2 focus:ring-amber-200/60 outline-none transition-all text-center text-lg"
            />
            <button
              onClick={startQuiz}
              disabled={!playerName.trim()}
              className="mt-5 w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-lg flex items-center justify-center gap-2.5 hover:from-amber-700 hover:to-amber-800 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-400/30"
            >
              <Play className="w-5 h-5" />
              Comenzar
            </button>
          </div>

          <p className="mt-8 text-amber-700/50 text-sm tracking-wide">
            18 preguntas &middot; 15 segundos por pregunta
          </p>
        </div>
      </div>
    );
  }

  // ── QUIZ ──
  if (screen === 'quiz') {
    const q: Question = questions[currentQuestion];
    const progressPct = ((currentQuestion + 1) / questions.length) * 100;
    const labels = ['A', 'B', 'C', 'D'];

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex flex-col">
        {/* Header bar */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-800/80 font-semibold text-sm">
              Pregunta {currentQuestion + 1} de {questions.length}
            </span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" style={{ color: timerColor }} />
              <span className="font-bold text-lg tabular-nums" style={{ color: timerColor }}>
                {timeLeft}s
              </span>
            </div>
            <span className="text-amber-800/80 font-semibold text-sm flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500" />
              {score}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Timer bar */}
          <div className="mt-2 h-1.5 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
            />
          </div>
        </div>

        {/* Question area */}
        <div
          className={`flex-1 flex flex-col items-center justify-center px-4 py-4 transition-opacity duration-300 ${
            quizTransition ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="max-w-lg w-full">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-amber-200/30 border border-amber-200/50 mb-5">
              {q.image && (
                <div className="mb-4 rounded-xl overflow-hidden border border-amber-200/40">
                  <img
                    src={q.image}
                    alt=""
                    className="w-full max-h-[500px] object-contain bg-white"
                  />
                </div>
              )}
              <p className="text-amber-900 text-xl font-serif font-semibold text-center leading-relaxed">
                {q.question}
              </p>
            </div>

            <div className="space-y-3">
              {q.options.map((opt, i) => {
                let btnClass = 'bg-white/60 border-amber-200/50 hover:border-amber-400 hover:bg-amber-50/70';
                let labelBg = 'bg-amber-100 text-amber-700';

                if (showCorrect) {
                  if (i === q.correctIndex) {
                    btnClass = 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300';
                    labelBg = 'bg-emerald-500 text-white';
                  } else if (selectedAnswer === i) {
                    btnClass = 'bg-red-50 border-red-400 ring-1 ring-red-300';
                    labelBg = 'bg-red-500 text-white';
                  } else {
                    btnClass = 'bg-white/30 border-amber-100 opacity-50';
                    labelBg = 'bg-amber-50 text-amber-300';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    disabled={selectedAnswer !== null || showCorrect}
                    className={`w-full px-4 py-3.5 rounded-xl border-2 text-left flex items-center gap-3 transition-all duration-200 ${btnClass} disabled:cursor-default`}
                  >
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${labelBg}`}
                    >
                      {labels[i]}
                    </span>
                    <span className="font-medium text-amber-900">{opt}</span>
                  </button>
                );
              })}
            </div>

            {showCorrect && q.explanation && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-amber-100/80 border border-amber-300/60 text-amber-900 text-sm leading-relaxed text-center">
                {q.explanation}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if (screen === 'results') {
    const pct = Math.round((score / questions.length) * 100);
    const circumference = 2 * Math.PI * 52;
    const offset = circumference * (1 - pct / 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-40 h-40 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-yellow-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-md w-full text-center">
          <div className="mb-5">{getScoreIcon(score)}</div>
          <h2 className="text-3xl font-serif font-bold text-amber-900 mb-1">¡Terminaste!</h2>
          <p className="text-amber-800/60 text-lg mb-7">{playerName}</p>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl shadow-amber-200/30 border border-amber-200/50 mb-6">
            <div className="relative w-36 h-36 mx-auto mb-5">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#fef3c7" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#b8860b"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-amber-900">{score}</span>
                <span className="text-sm text-amber-600">de {questions.length}</span>
              </div>
            </div>

            <p className="text-amber-800 font-semibold text-lg">{pct}% de aciertos</p>
            <p className="text-amber-700/60 mt-2 text-base">{getScoreMessage(score)}</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={loadRankings}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-lg flex items-center justify-center gap-2.5 hover:from-amber-700 hover:to-amber-800 active:scale-[0.98] transition-all shadow-lg shadow-amber-400/30"
            >
              <Trophy className="w-5 h-5" />
              Ver Ranking
            </button>
            <button
              onClick={() => setScreen('gallery')}
              className="w-full py-4 rounded-2xl bg-white/70 border-2 border-amber-300/70 text-amber-800 font-bold text-lg flex items-center justify-center gap-2.5 hover:bg-amber-50 active:scale-[0.98] transition-all"
            >
              <Camera className="w-5 h-5" />
              Galería de Fotos
            </button>
            <button
              onClick={resetGame}
              className="w-full py-3 rounded-2xl text-amber-700/70 font-semibold hover:text-amber-900 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Jugar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RANKING ──
  if (screen === 'ranking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex flex-col items-center p-6 pt-10">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-serif font-bold text-amber-900 text-center mb-2 flex items-center justify-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-500" />
            Top 10
          </h2>
          <p className="text-amber-700/50 text-center mb-6">
            Los que más conocen a Victoria
          </p>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl shadow-amber-200/30 border border-amber-200/50 overflow-hidden">
            {rankings.length === 0 ? (
              <div className="p-10 text-center text-amber-600/60">
                <Trophy className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>Aún no hay puntuaciones registradas</p>
              </div>
            ) : (
              <div className="divide-y divide-amber-100/60">
                {rankings.map((r, i) => {
                  const isTop3 = i < 3;
                  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
                  const rowBg =
                    i === 0
                      ? 'bg-amber-50/80'
                      : i === 1
                        ? 'bg-orange-50/40'
                        : i === 2
                          ? 'bg-yellow-50/40'
                          : '';
                  const isCurrentPlayer = r.player_name === playerName;

                  return (
                    <div
                      key={i}
                      className={`flex items-center px-5 py-4 ${rowBg} ${
                        isCurrentPlayer ? 'ring-2 ring-amber-400 ring-inset bg-amber-50/60' : ''
                      }`}
                    >
                      <span className="w-10 text-center shrink-0">
                        {medal ? (
                          <span className="text-xl">{medal}</span>
                        ) : (
                          <span className="text-amber-600/60 font-bold text-lg">{i + 1}</span>
                        )}
                      </span>
                      <span className="flex-1 font-semibold text-amber-900 truncate">
                        {r.player_name}
                        {isCurrentPlayer && (
                          <span className="ml-2 text-xs font-medium text-amber-500 bg-amber-100 px-1.5 py-0.5 rounded-md">
                            Tú
                          </span>
                        )}
                      </span>
                      <span className="text-amber-700 font-bold tabular-nums">
                        {r.score}/{questions.length}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={() => setScreen('gallery')}
              className="w-full py-4 rounded-2xl bg-white/70 border-2 border-amber-300/70 text-amber-800 font-bold text-lg flex items-center justify-center gap-2.5 hover:bg-amber-50 active:scale-[0.98] transition-all"
            >
              <Camera className="w-5 h-5" />
              Galería de Fotos
            </button>
            <button
              onClick={resetGame}
              className="w-full py-3 rounded-2xl text-amber-700/70 font-semibold hover:text-amber-900 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Jugar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── GALLERY ──
  if (screen === 'gallery') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 pt-10">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-serif font-bold text-amber-900 text-center mb-2 flex items-center justify-center gap-2.5">
            <ImageIcon className="w-7 h-7 text-amber-500" />
            Galería
          </h2>
          <p className="text-amber-700/50 text-center mb-6">
            Momentos especiales de Victoria
          </p>

          <div className="grid grid-cols-2 gap-3">
            {GALLERY_IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className={`rounded-2xl overflow-hidden shadow-md shadow-amber-200/25 border border-amber-200/40 hover:shadow-xl hover:scale-[1.02] transition-all ${
                  i === 0 ? 'col-span-2' : ''
                }`}
              >
                <div className="relative group">
                  <img
                    src={img.url}
                    alt={img.caption}
                    className={`w-full object-cover group-hover:brightness-95 transition-all ${
                      i === 0 ? 'h-56' : 'h-44'
                    }`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <p className="absolute bottom-2.5 left-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {img.caption}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={loadRankings}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-lg flex items-center justify-center gap-2.5 hover:from-amber-700 hover:to-amber-800 active:scale-[0.98] transition-all shadow-lg shadow-amber-400/30"
            >
              <Trophy className="w-5 h-5" />
              Ver Ranking
            </button>
            <button
              onClick={resetGame}
              className="w-full py-3 rounded-2xl text-amber-700/70 font-semibold hover:text-amber-900 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Jugar de nuevo
            </button>
          </div>
        </div>

        {/* Lightbox overlay */}
        {lightboxIndex !== null && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-5 right-5 text-white/70 hover:text-white p-2 transition-colors"
              onClick={() => setLightboxIndex(null)}
            >
              <X className="w-7 h-7" />
            </button>

            {lightboxIndex > 0 && (
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex - 1);
                }}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {lightboxIndex < GALLERY_IMAGES.length - 1 && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex + 1);
                }}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={GALLERY_IMAGES[lightboxIndex].url}
                alt={GALLERY_IMAGES[lightboxIndex].caption}
                className="w-full rounded-2xl shadow-2xl"
              />
              <p className="text-white text-center mt-4 font-medium text-lg">
                {GALLERY_IMAGES[lightboxIndex].caption}
              </p>
              <p className="text-white/50 text-center mt-1 text-sm">
                {lightboxIndex + 1} de {GALLERY_IMAGES.length}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
