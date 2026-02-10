import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserByUsername, createUser } from '../utils/localStorage';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Crosshair } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage = () => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', password: '', confirmPassword: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const user = getUserByUsername(loginData.username);
    
    if (!user) {
      toast.error('Username tidak ditemukan');
      return;
    }

    if (user.isBlocked) {
      toast.error('Akun Anda telah diblokir');
      return;
    }

    if (user.password !== loginData.password) {
      toast.error('Password salah');
      return;
    }

    login(user);
    toast.success('Login berhasil!');
    
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    const existingUser = getUserByUsername(registerData.username);
    if (existingUser) {
      toast.error('Username sudah digunakan');
      return;
    }

    const newUser = createUser({
      username: registerData.username,
      password: registerData.password,
      role: 'user'
    });

    login(newUser);
    toast.success('Registrasi berhasil!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Crosshair className="w-16 h-16 text-orange-500" strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Exo 2, sans-serif' }}>SHOOTER</h1>
          <p className="text-slate-300">Platform Game Tembak Target</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Masuk ke akun Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      data-testid="login-username-input"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      data-testid="login-password-input"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" data-testid="login-submit-button" className="w-full">Login</Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Demo: admin/admin123 atau user/user123
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>Buat akun baru</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      data-testid="register-username-input"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      data-testid="register-password-input"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-confirm">Konfirmasi Password</Label>
                    <Input
                      id="register-confirm"
                      data-testid="register-confirm-input"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" data-testid="register-submit-button" className="w-full">Register</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};