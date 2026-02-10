import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addGameScore, addMatchHistory } from '../utils/localStorage';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Crosshair, Trophy, Clock, Target as TargetIcon, ArrowLeft, Info, Play } from 'lucide-react';
import { toast } from 'sonner';

const LEVEL_CONFIG = {
  easy: { time: 30, label: 'Mudah' },
  medium: { time: 20, label: 'Sedang' },
  hard: { time: 15, label: 'Sulit' }
};

const GUN_TYPES = [
  { id: 'gun1', name: 'Pistol', color: '#64748b', size: 40 },
  { id: 'gun2', name: 'Rifle', color: '#475569', size: 50 }
];

const TARGET_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export const GamePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const gameboardRef = useRef(null);
  const [gameState, setGameState] = useState('setup'); // setup, countdown, playing, paused, gameover
  const [level, setLevel] = useState('easy');
  const [selectedGun, setSelectedGun] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [countdown, setCountdown] = useState(3);
  const [showInstructions, setShowInstructions] = useState(false);
  const [shootHistory, setShootHistory] = useState([]);
  const timerRef = useRef(null);
  const targetSpawnRef = useRef(null);
  const [gunAnimation, setGunAnimation] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (gameboardRef.current) {
        const rect = gameboardRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const handleKeyDown = (e) => {
      if (gameState === 'playing') {
        if (e.key === ' ') {
          e.preventDefault();
          switchGun();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setGameState('paused');
        }
      } else if (gameState === 'paused' && e.key === 'Escape') {
        e.preventDefault();
        setGameState('playing');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      startGame();
    }
  }, [countdown, gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [gameState]);

  const spawnTarget = useCallback(() => {
    const newTarget = {
      id: Date.now() + Math.random(),
      x: Math.random() * 850 + 50,
      y: Math.random() * 450 + 50,
      color: TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)],
      size: 60
    };
    setTargets((prev) => [...prev, newTarget]);
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      targetSpawnRef.current = setInterval(() => {
        spawnTarget();
      }, 3000);

      return () => {
        if (targetSpawnRef.current) clearInterval(targetSpawnRef.current);
      };
    }
  }, [gameState, spawnTarget]);

  const startCountdown = () => {
    setGameState('countdown');
    setCountdown(3);
    setScore(0);
    setTimeLeft(LEVEL_CONFIG[level].time);
    setTargets([]);
    setShootHistory([]);
  };

  const startGame = () => {
    setGameState('playing');
    // Spawn 3 initial targets
    for (let i = 0; i < 3; i++) {
      setTimeout(() => spawnTarget(), i * 500);
    }
  };

  const switchGun = () => {
    setGunAnimation(true);
    setTimeout(() => setGunAnimation(false), 300);
    setSelectedGun((prev) => (prev + 1) % GUN_TYPES.length);
    toast.info(`Berganti ke ${GUN_TYPES[(selectedGun + 1) % GUN_TYPES.length].name}`);
  };

  const handleShoot = (e) => {
    if (gameState !== 'playing') return;

    const rect = gameboardRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let hit = false;
    setTargets((prevTargets) => {
      const newTargets = [...prevTargets];
      for (let i = 0; i < newTargets.length; i++) {
        const target = newTargets[i];
        const distance = Math.sqrt(
          Math.pow(clickX - target.x, 2) + Math.pow(clickY - target.y, 2)
        );

        if (distance <= target.size / 2) {
          hit = true;
          const points = 10;
          setScore((prev) => prev + points);
          toast.success(`+${points} poin!`);
          setShootHistory((prev) => [
            ...prev,
            { time: new Date().toISOString(), hit: true, score: points }
          ]);
          newTargets.splice(i, 1);
          return newTargets;
        }
      }
      return prevTargets;
    });

    if (!hit) {
      setTimeLeft((prev) => Math.max(0, prev - 5));
      toast.error('Meleset! -5 detik');
      setShootHistory((prev) => [
        ...prev,
        { time: new Date().toISOString(), hit: false, score: 0 }
      ]);
    }
  };

  const endGame = () => {
    setGameState('gameover');
    if (timerRef.current) clearInterval(timerRef.current);
    if (targetSpawnRef.current) clearInterval(targetSpawnRef.current);
  };

  const saveScore = () => {
    addGameScore({
      userId: currentUser.id,
      username: currentUser.username,
      score: score,
      level: level
    });

    addMatchHistory({
      userId: currentUser.id,
      username: currentUser.username,
      score: score,
      level: level,
      duration: LEVEL_CONFIG[level].time - timeLeft
    });

    toast.success('Score berhasil disimpan!');
    navigate('/dashboard');
  };

  const restartGame = () => {
    setGameState('setup');
    setScore(0);
    setTimeLeft(LEVEL_CONFIG[level].time);
    setTargets([]);
    setShootHistory([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        {gameState === 'setup' && (
          <Card className="max-w-2xl mx-auto p-8 bg-black/40 backdrop-blur-sm border-white/20">
            <div className="text-center mb-8">
              <Crosshair className="w-20 h-20 text-orange-500 mx-auto mb-4" />
              <h1 className="text-6xl font-bold text-white mb-2" style={{ fontFamily: 'Exo 2, sans-serif' }}>SHOOTER</h1>
              <p className="text-slate-300">Tembak target sebanyak mungkin!</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-white mb-2 block">Pilih Level</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger data-testid="level-select" className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Mudah (30 detik)</SelectItem>
                    <SelectItem value="medium">Sedang (20 detik)</SelectItem>
                    <SelectItem value="hard">Sulit (15 detik)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white mb-2 block">Pilih Senjata</Label>
                <div className="grid grid-cols-2 gap-4">
                  {GUN_TYPES.map((gun, index) => (
                    <button
                      key={gun.id}
                      data-testid={`gun-select-${index}`}
                      onClick={() => setSelectedGun(index)}
                      className={`p-4 rounded-lg border-2 transition ${
                        selectedGun === index
                          ? 'border-orange-500 bg-orange-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div
                        className="w-12 h-12 mx-auto mb-2 rounded"
                        style={{ backgroundColor: gun.color }}
                      />
                      <p className="text-white font-semibold">{gun.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  data-testid="start-game-button"
                  onClick={startCountdown}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Main Game
                </Button>
                <Button
                  data-testid="instructions-button"
                  onClick={() => setShowInstructions(true)}
                  variant="outline"
                  className="border-white/20 text-white"
                  size="lg"
                >
                  <Info className="w-5 h-5 mr-2" />
                  Instruksi
                </Button>
              </div>

              <Button
                data-testid="back-dashboard-button"
                onClick={() => navigate('/dashboard')}
                variant="ghost"
                className="w-full text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Dashboard
              </Button>
            </div>
          </Card>
        )}

        {gameState === 'countdown' && (
          <div className="text-center">
            <div className="text-9xl font-bold text-white animate-pulse" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              {countdown > 0 ? countdown : 'GO!'}
            </div>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'paused') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-white font-bold text-xl" data-testid="game-score">{score}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-white font-bold text-xl" data-testid="game-timer">{timeLeft}s</span>
                </div>
                <div className="flex items-center gap-2">
                  <TargetIcon className="w-5 h-5 text-green-500" />
                  <span className="text-white font-bold text-xl" data-testid="game-targets">{targets.length}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  data-testid="pause-button"
                  onClick={() => setGameState('paused')}
                  variant="outline"
                  className="border-white/20 text-white"
                >
                  {gameState === 'paused' ? 'Resume' : 'Pause'} (ESC)
                </Button>
              </div>
            </div>

            <div
              ref={gameboardRef}
              data-testid="game-board"
              onClick={handleShoot}
              className="relative bg-slate-800/50 backdrop-blur-sm rounded-lg border-2 border-white/20 overflow-hidden cursor-none"
              style={{ width: '1000px', height: '600px', margin: '0 auto' }}
            >
              {targets.map((target) => (
                <div
                  key={target.id}
                  data-testid="game-target"
                  className="absolute rounded-full animate-pulse"
                  style={{
                    left: target.x - target.size / 2,
                    top: target.y - target.size / 2,
                    width: target.size,
                    height: target.size,
                    backgroundColor: target.color,
                    boxShadow: `0 0 20px ${target.color}`
                  }}
                />
              ))}

              <div
                data-testid="game-crosshair"
                className="absolute pointer-events-none"
                style={{
                  left: mousePos.x,
                  top: mousePos.y,
                  transform: `translate(-50%, -50%) ${gunAnimation ? 'scale(1.2) rotate(15deg)' : 'scale(1)'}`
                }}
              >
                <Crosshair className="w-8 h-8 text-orange-500" strokeWidth={3} />
                <div
                  className="mt-2 rounded"
                  style={{
                    width: GUN_TYPES[selectedGun].size,
                    height: GUN_TYPES[selectedGun].size / 2,
                    backgroundColor: GUN_TYPES[selectedGun].color,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                  }}
                />
              </div>

              {gameState === 'paused' && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">PAUSED</h2>
                    <p className="text-slate-300 mb-6">Tekan ESC atau klik Resume untuk melanjutkan</p>
                    <Button
                      data-testid="resume-button"
                      onClick={() => setGameState('playing')}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      Lanjutkan
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <h3 className="text-white font-bold mb-2">Riwayat Tembakan</h3>
              <div className="flex gap-1 flex-wrap max-h-20 overflow-auto">
                {shootHistory.slice(-20).map((shot, index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full ${
                      shot.hit ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    title={shot.hit ? `Hit: +${shot.score}` : 'Miss: -5s'}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={gameState === 'gameover'} onOpenChange={() => {}}>
        <DialogContent data-testid="gameover-modal" className="bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center">GAME OVER!</DialogTitle>
            <DialogDescription className="text-slate-300 text-center">
              Permainan selesai
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-sm text-slate-400 mb-2">Score Akhir</p>
            <p className="text-6xl font-bold text-yellow-500 mb-4" data-testid="final-score">{score}</p>
            <p className="text-slate-300">Level: {LEVEL_CONFIG[level].label}</p>
            <p className="text-slate-300">Player: {currentUser?.username}</p>
          </div>
          <div className="flex gap-3">
            <Button
              data-testid="save-score-button"
              onClick={saveScore}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              Simpan Score
            </Button>
            <Button
              data-testid="restart-button"
              onClick={restartGame}
              variant="outline"
              className="flex-1 border-white/20 text-white"
            >
              Main Lagi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="bg-slate-900 border-white/20 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Cara Bermain</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-slate-300">
            <p><strong>1.</strong> Pilih level kesulitan (Mudah: 30s, Sedang: 20s, Sulit: 15s)</p>
            <p><strong>2.</strong> Pilih senjata yang ingin digunakan</p>
            <p><strong>3.</strong> Target akan muncul secara acak setiap 3 detik</p>
            <p><strong>4.</strong> Klik pada target untuk menembak dan mendapat poin</p>
            <p><strong>5.</strong> Jika meleset, waktu akan berkurang 5 detik</p>
            <p><strong>6.</strong> Tekan <strong>SPASI</strong> untuk mengganti senjata</p>
            <p><strong>7.</strong> Tekan <strong>ESC</strong> untuk pause/resume</p>
            <p><strong>8.</strong> Game berakhir saat waktu habis</p>
          </div>
          <Button onClick={() => setShowInstructions(false)} className="w-full">
            Mengerti
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};