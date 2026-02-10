import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserScores, getUserMatchHistory, getTopScores } from '../utils/localStorage';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { User, Trophy, History, Play, LogOut, Target } from 'lucide-react';

export const UserDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const userScores = getUserScores(currentUser.id);
  const matchHistory = getUserMatchHistory(currentUser.id);
  const topScores = getTopScores(10);
  const userBestScore = userScores.length > 0 ? Math.max(...userScores.map(s => s.score)) : 0;
  const userRank = topScores.findIndex(s => s.userId === currentUser.id) + 1;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>SHOOTER</h1>
              <p className="text-sm text-slate-300">Selamat datang, {currentUser?.username}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button data-testid="play-game-button" onClick={() => navigate('/game')} size="lg" className="bg-orange-500 hover:bg-orange-600">
              <Play className="w-4 h-4 mr-2" />
              Main Game
            </Button>
            <Button data-testid="user-logout-button" onClick={handleLogout} variant="outline" className="text-white border-white/20">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                Profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-slate-300">Username</p>
                  <p className="text-lg font-semibold">{currentUser?.username}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-300">Role</p>
                  <Badge variant="secondary">{currentUser?.role}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Best Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-4xl font-bold text-yellow-500">{userBestScore}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-300">Rank: {userRank > 0 ? `#${userRank}` : 'Belum masuk top 10'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" />
                Match History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-4xl font-bold text-blue-500">{matchHistory.length}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-300">Total Match Dimainkan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle>Top 10 Leaderboard</CardTitle>
              <CardDescription className="text-slate-300">Pemain terbaik</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-slate-300">Rank</TableHead>
                    <TableHead className="text-slate-300">Player</TableHead>
                    <TableHead className="text-slate-300">Score</TableHead>
                    <TableHead className="text-slate-300">Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topScores.slice(0, 10).map((score, index) => (
                    <TableRow key={score.id} className={`border-white/10 ${score.userId === currentUser.id ? 'bg-orange-500/20' : ''}`}>
                      <TableCell>
                        <Badge variant={index === 0 ? 'default' : 'secondary'}>#{index + 1}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{score.username}</TableCell>
                      <TableCell className="text-yellow-500 font-bold">{score.score}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/20">{score.level}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {topScores.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-400">
                        Belum ada score
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle>Riwayat Match Anda</CardTitle>
              <CardDescription className="text-slate-300">10 match terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-slate-300">Tanggal</TableHead>
                    <TableHead className="text-slate-300">Score</TableHead>
                    <TableHead className="text-slate-300">Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchHistory.slice(-10).reverse().map((match) => (
                    <TableRow key={match.id} className="border-white/10">
                      <TableCell>{new Date(match.timestamp).toLocaleString('id-ID')}</TableCell>
                      <TableCell className="text-yellow-500 font-bold">{match.score}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/20">{match.level}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {matchHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-slate-400">
                        Belum ada riwayat match
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};