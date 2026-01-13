import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';

interface User {
  firstName: string;
  lastName: string;
  middleName: string;
}

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
  type: 'message' | 'file';
  fileName?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  uploadedBy: string;
  uploadedAt: Date;
  size: string;
}

type Section = 'chat' | 'files' | 'profile' | 'settings';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentSection, setCurrentSection] = useState<Section>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: ''
  });

  useEffect(() => {
    if (messages.length > 0 && currentSection !== 'chat') {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages.length, currentSection]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName && formData.middleName) {
      setUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName
      });
      setIsAuthenticated(true);
      toast({
        title: "Регистрация успешна",
        description: `Добро пожаловать, ${formData.firstName}!`
      });
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      user: `${user?.firstName} ${user?.lastName}`,
      text: messageInput,
      timestamp: new Date(),
      type: 'message'
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');

    if (currentSection !== 'chat') {
      toast({
        title: "Новое сообщение",
        description: messageInput.slice(0, 50)
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: file.name,
      uploadedBy: `${user.firstName} ${user.lastName}`,
      uploadedAt: new Date(),
      size: (file.size / 1024).toFixed(1) + ' KB'
    };

    setFiles([...files, newFile]);

    const fileMessage: Message = {
      id: Date.now().toString(),
      user: `${user.firstName} ${user.lastName}`,
      text: `Загружен файл: ${file.name}`,
      timestamp: new Date(),
      type: 'file',
      fileName: file.name
    };

    setMessages([...messages, fileMessage]);

    toast({
      title: "Файл загружен",
      description: file.name
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                <Icon name="Building2" className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-semibold">Регистрация</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Введите ваши данные для доступа к системе
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  placeholder="Иванов"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  placeholder="Иван"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Отчество</Label>
                <Input
                  id="middleName"
                  placeholder="Иванович"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Войти в систему
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Icon name="Building2" className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-sidebar-foreground">BizChat</h1>
              <p className="text-xs text-sidebar-foreground/70">Корпоративная платформа</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => {
              setCurrentSection('chat');
              setUnreadCount(0);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
              currentSection === 'chat'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            }`}
          >
            <Icon name="MessageSquare" size={20} />
            <span className="flex-1 text-left font-medium">Чат</span>
            {unreadCount > 0 && (
              <Badge className="bg-accent text-accent-foreground">{unreadCount}</Badge>
            )}
          </button>

          <button
            onClick={() => setCurrentSection('files')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
              currentSection === 'files'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            }`}
          >
            <Icon name="FolderOpen" size={20} />
            <span className="flex-1 text-left font-medium">Файлы</span>
            <span className="text-xs text-sidebar-foreground/60">{files.length}</span>
          </button>

          <button
            onClick={() => setCurrentSection('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
              currentSection === 'profile'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            }`}
          >
            <Icon name="User" size={20} />
            <span className="flex-1 text-left font-medium">Профиль</span>
          </button>

          <button
            onClick={() => setCurrentSection('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
              currentSection === 'settings'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            }`}
          >
            <Icon name="Settings" size={20} />
            <span className="flex-1 text-left font-medium">Настройки</span>
          </button>
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold">
                {user && getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-sidebar-foreground/70">В сети</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        {currentSection === 'chat' && (
          <>
            <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Общий чат</h2>
                <p className="text-sm text-muted-foreground">1 участник в сети</p>
              </div>
              <Button variant="outline" size="sm">
                <Icon name="Users" size={16} className="mr-2" />
                Участники
              </Button>
            </header>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 max-w-4xl">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                      <Icon name="MessageSquare" size={32} className="text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Пока нет сообщений</p>
                    <p className="text-sm text-muted-foreground/70">Начните общение</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <Avatar className="h-10 w-10 mt-1">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {msg.user.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold text-sm">{msg.user}</span>
                          <span className="text-xs text-muted-foreground">
                            {msg.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {msg.type === 'file' ? (
                          <div className="inline-flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/20 rounded">
                            <Icon name="Paperclip" size={16} className="text-accent" />
                            <span className="text-sm">{msg.fileName}</span>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="border-t bg-card p-4">
              <div className="max-w-4xl flex gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button type="button" variant="outline" size="icon" asChild>
                    <span>
                      <Icon name="Paperclip" size={20} />
                    </span>
                  </Button>
                </label>
                <Textarea
                  placeholder="Введите сообщение..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="min-h-[44px] max-h-32 resize-none"
                />
                <Button onClick={sendMessage} size="icon" className="shrink-0">
                  <Icon name="Send" size={20} />
                </Button>
              </div>
            </div>
          </>
        )}

        {currentSection === 'files' && (
          <>
            <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Файлы</h2>
                <p className="text-sm text-muted-foreground">{files.length} файлов</p>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button size="sm" asChild>
                  <span>
                    <Icon name="Upload" size={16} className="mr-2" />
                    Загрузить
                  </span>
                </Button>
              </label>
            </header>

            <div className="flex-1 p-6">
              <div className="max-w-4xl">
                {files.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                      <Icon name="FolderOpen" size={32} className="text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2">Файлов пока нет</p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Button variant="outline" size="sm" asChild>
                        <span>Загрузить файл</span>
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {files.map((file) => (
                      <Card key={file.id}>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-12 w-12 rounded bg-accent/10 flex items-center justify-center shrink-0">
                            <Icon name="FileText" size={24} className="text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {file.uploadedBy} • {file.uploadedAt.toLocaleDateString('ru-RU')} • {file.size}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Icon name="Download" size={20} />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {currentSection === 'profile' && (
          <>
            <header className="h-16 border-b bg-card px-6 flex items-center">
              <h2 className="text-lg font-semibold">Профиль</h2>
            </header>

            <div className="flex-1 p-6">
              <div className="max-w-2xl">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                          {user && getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label className="text-muted-foreground">ФИО</Label>
                          <p className="text-lg font-semibold mt-1">
                            {user?.lastName} {user?.firstName} {user?.middleName}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Статус</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="font-medium">В сети</span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Сообщений</Label>
                            <p className="font-medium mt-1">{messages.filter(m => m.type === 'message').length}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Загружено файлов</Label>
                          <p className="font-medium mt-1">{files.length}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {currentSection === 'settings' && (
          <>
            <header className="h-16 border-b bg-card px-6 flex items-center">
              <h2 className="text-lg font-semibold">Настройки</h2>
            </header>

            <div className="flex-1 p-6">
              <div className="max-w-2xl space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Уведомления</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Новые сообщения</p>
                        <p className="text-sm text-muted-foreground">Уведомлять о новых сообщениях в чате</p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Загрузка файлов</p>
                        <p className="text-sm text-muted-foreground">Уведомлять о загруженных файлах</p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Внешний вид</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Тема оформления</Label>
                      <p className="text-sm text-muted-foreground mt-1">Светлая</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}