import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  role: 'client' | 'manager';
  isOnline: boolean;
  managerId?: string;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
  type: 'message' | 'file';
  fileName?: string;
  fileUrl?: string;
  chatId: string;
}

interface UploadedFile {
  id: string;
  name: string;
  uploadedBy: string;
  uploadedAt: Date;
  size: string;
  chatId: string;
  url?: string;
}

interface Chat {
  id: string;
  clientId: string;
  clientName: string;
  managerId: string;
  managerName: string;
  clientOnline: boolean;
  lastMessage?: string;
  unreadCount: number;
  caseStatus?: 'new' | 'in_progress' | 'waiting_docs' | 'completed';
  caseTitle?: string;
}

type ClientSection = 'chat' | 'cabinet';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [clients, setClients] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [clientSection, setClientSection] = useState<ClientSection>('chat');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    role: 'client' as 'client' | 'manager'
  });

  const MANAGER_ID = 'manager-001';
  const MANAGER_NAME = 'Александр Петрович';

  const currentChat = clients.find(c => c.id === selectedChatId);
  const chatMessages = messages.filter(m => m.chatId === selectedChatId);
  const chatFiles = files.filter(f => f.chatId === selectedChatId);

  useEffect(() => {
    const interval = setInterval(() => {
      setClients(prev => prev.map(c => ({
        ...c,
        clientOnline: Math.random() > 0.3
      })));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName && formData.middleName) {
      const userId = `${formData.role}-${Date.now()}`;
      const newUser: User = {
        id: userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        role: formData.role,
        isOnline: true,
        managerId: formData.role === 'client' ? MANAGER_ID : undefined
      };
      
      setUser(newUser);
      setIsAuthenticated(true);

      if (formData.role === 'client') {
        const chatId = `chat-${userId}`;
        const newChat: Chat = {
          id: chatId,
          clientId: userId,
          clientName: `${formData.firstName} ${formData.lastName}`,
          managerId: MANAGER_ID,
          managerName: MANAGER_NAME,
          clientOnline: true,
          unreadCount: 0,
          caseStatus: 'in_progress',
          caseTitle: 'Регистрация ООО'
        };
        setClients([newChat]);
        setSelectedChatId(chatId);
      } else {
        const demoClients: Chat[] = [
          {
            id: 'chat-demo-1',
            clientId: 'client-demo-1',
            clientName: 'Мария Ивановна',
            managerId: MANAGER_ID,
            managerName: MANAGER_NAME,
            clientOnline: true,
            lastMessage: 'Добрый день, когда можно получить документы?',
            unreadCount: 2,
            caseStatus: 'waiting_docs',
            caseTitle: 'Ликвидация ООО'
          },
          {
            id: 'chat-demo-2',
            clientId: 'client-demo-2',
            clientName: 'Петр Сергеевич',
            managerId: MANAGER_ID,
            managerName: MANAGER_NAME,
            clientOnline: false,
            lastMessage: 'Спасибо за помощь!',
            unreadCount: 0,
            caseStatus: 'completed',
            caseTitle: 'Регистрация ИП'
          },
          {
            id: 'chat-demo-3',
            clientId: 'client-demo-3',
            clientName: 'Елена Дмитриевна',
            managerId: MANAGER_ID,
            managerName: MANAGER_NAME,
            clientOnline: true,
            lastMessage: 'Загрузил договор',
            unreadCount: 1,
            caseStatus: 'in_progress',
            caseTitle: 'Получение лицензии'
          }
        ];
        setClients(demoClients);
        setSelectedChatId(demoClients[0].id);
      }

      toast({
        title: "Добро пожаловать",
        description: `${formData.firstName}, вы вошли как ${formData.role === 'client' ? 'клиент' : 'менеджер'}`,
        className: "bg-card border-primary/20"
      });
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedChatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: user!.id,
      userName: `${user?.firstName} ${user?.lastName}`,
      text: messageInput,
      timestamp: new Date(),
      type: 'message',
      chatId: selectedChatId
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');

    setClients(prev => prev.map(c => 
      c.id === selectedChatId 
        ? { ...c, lastMessage: messageInput.slice(0, 50) }
        : c
    ));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedChatId) return;

    const fileUrl = URL.createObjectURL(file);
    
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: file.name,
      uploadedBy: `${user.firstName} ${user.lastName}`,
      uploadedAt: new Date(),
      size: (file.size / 1024).toFixed(1) + ' KB',
      chatId: selectedChatId,
      url: fileUrl
    };

    setFiles([...files, newFile]);

    const fileMessage: Message = {
      id: (Date.now() + 1).toString(),
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      text: `Загружен файл: ${file.name}`,
      timestamp: new Date(),
      type: 'file',
      fileName: file.name,
      fileUrl: fileUrl,
      chatId: selectedChatId
    };

    setMessages([...messages, fileMessage]);

    toast({
      title: "Файл загружен",
      description: file.name,
      className: "bg-card border-primary/20"
    });
  };

  const downloadFile = (file: UploadedFile) => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
      
      toast({
        title: "Файл загружается",
        description: file.name,
        className: "bg-card border-primary/20"
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const downloadAllFiles = () => {
    if (chatFiles.length === 0) {
      toast({
        title: "Нет файлов",
        description: "В этом чате нет загруженных файлов",
        className: "bg-card border-primary/20"
      });
      return;
    }

    chatFiles.forEach(file => {
      if (file.url) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        link.click();
      }
    });

    toast({
      title: "Файлы выгружаются",
      description: `Загружается ${chatFiles.length} файлов`,
      className: "bg-card border-primary/20"
    });
  };

  const getCaseStatusText = (status?: string) => {
    switch (status) {
      case 'new': return 'Новое дело';
      case 'in_progress': return 'В работе';
      case 'waiting_docs': return 'Ожидание документов';
      case 'completed': return 'Завершено';
      default: return 'В работе';
    }
  };

  const getCaseStatusColor = (status?: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress': return 'bg-primary/20 text-primary border-primary/30';
      case 'waiting_docs': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        
        <Card className="w-full max-w-md shadow-2xl relative z-10 border-primary/20 bg-card/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-6 text-center">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="https://cdn.poehali.dev/files/photo_2025-04-08_16-34-49.jpg" 
                alt="Альтрон"
                className="h-24 w-24 object-contain"
              />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Альтрон
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Юридическая компания
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-5">
              <Tabs value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as 'client' | 'manager' })} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="client" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    Клиент
                  </TabsTrigger>
                  <TabsTrigger value="manager" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    Менеджер
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-foreground/90">Фамилия</Label>
                <Input
                  id="lastName"
                  placeholder="Иванов"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="border-primary/20 focus:border-primary bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-foreground/90">Имя</Label>
                <Input
                  id="firstName"
                  placeholder="Иван"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="border-primary/20 focus:border-primary bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName" className="text-foreground/90">Отчество</Label>
                <Input
                  id="middleName"
                  placeholder="Иванович"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  required
                  className="border-primary/20 focus:border-primary bg-input"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg">
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col shadow-xl">
        <div className="p-6 border-b border-sidebar-border/50 bg-gradient-to-br from-sidebar-background via-sidebar-background to-primary/5">
          <div className="flex items-center gap-4">
            <img 
              src="https://cdn.poehali.dev/files/photo_2025-04-08_16-34-49.jpg" 
              alt="Альтрон"
              className="h-14 w-14 object-contain"
            />
            <div>
              <h1 className="font-bold text-xl text-primary">Альтрон</h1>
              <p className="text-xs text-sidebar-foreground/70">Юридическая компания</p>
            </div>
          </div>
        </div>

        {user?.role === 'client' && (
          <nav className="flex-1 p-3 space-y-1">
            <button
              onClick={() => setClientSection('chat')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                clientSection === 'chat'
                  ? 'bg-sidebar-accent border border-primary/30 text-primary shadow-md'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 border border-transparent'
              }`}
            >
              <Icon name="MessageSquare" size={20} />
              <span className="font-medium">Чат с менеджером</span>
            </button>
            <button
              onClick={() => setClientSection('cabinet')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                clientSection === 'cabinet'
                  ? 'bg-sidebar-accent border border-primary/30 text-primary shadow-md'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 border border-transparent'
              }`}
            >
              <Icon name="Briefcase" size={20} />
              <span className="font-medium">Личный кабинет</span>
            </button>
          </nav>
        )}

        {user?.role === 'manager' && (
          <>
            <div className="px-4 py-3 border-b border-sidebar-border/50">
              <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-2">
                Активные клиенты ({clients.length})
              </h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {clients.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setSelectedChatId(chat.id);
                      setClients(prev => prev.map(c => 
                        c.id === chat.id ? { ...c, unreadCount: 0 } : c
                      ));
                    }}
                    className={`w-full p-4 rounded-lg transition-all text-left ${
                      selectedChatId === chat.id
                        ? 'bg-sidebar-accent border border-primary/30 shadow-md'
                        : 'hover:bg-sidebar-accent/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-11 w-11 border-2 border-primary/30">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                            {chat.clientName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-sidebar ${
                          chat.clientOnline ? 'bg-green-500' : 'bg-muted-foreground/40'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-semibold text-sidebar-foreground truncate">{chat.clientName}</p>
                          {chat.unreadCount > 0 && (
                            <Badge className="bg-primary text-primary-foreground px-2 py-0 text-xs font-bold">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {chat.lastMessage && (
                          <p className="text-xs text-sidebar-foreground/60 truncate">{chat.lastMessage}</p>
                        )}
                        <p className="text-xs text-sidebar-foreground/40 mt-1">
                          {chat.clientOnline ? 'Онлайн' : 'Не в сети'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        <div className="p-4 border-t border-sidebar-border/50 bg-sidebar/50">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50">
            <Avatar className="h-11 w-11 border-2 border-primary/30">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-bold">
                {user && getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-primary flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-primary"></span>
                {user?.role === 'client' ? 'Клиент' : 'Менеджер'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        {user?.role === 'client' && clientSection === 'cabinet' && currentChat && (
          <>
            <header className="h-20 border-b border-border/50 bg-card/50 backdrop-blur px-6 flex items-center shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/30">
                  <Icon name="Briefcase" className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Личный кабинет</h2>
                  <p className="text-sm text-muted-foreground">Информация о вашем деле</p>
                </div>
              </div>
            </header>

            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="border-primary/20 bg-card/50 backdrop-blur shadow-xl">
                  <CardHeader className="border-b border-primary/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">{currentChat.caseTitle}</CardTitle>
                        <p className="text-muted-foreground">Ваш персональный менеджер: {MANAGER_NAME}</p>
                      </div>
                      <Badge className={`px-4 py-2 text-sm font-medium border ${getCaseStatusColor(currentChat.caseStatus)}`}>
                        {getCaseStatusText(currentChat.caseStatus)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon name="MessageSquare" className="h-5 w-5 text-primary" />
                          </div>
                          <p className="text-sm text-muted-foreground">Сообщений</p>
                        </div>
                        <p className="text-3xl font-bold text-primary">{chatMessages.length}</p>
                      </div>

                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon name="FileText" className="h-5 w-5 text-primary" />
                          </div>
                          <p className="text-sm text-muted-foreground">Документов</p>
                        </div>
                        <p className="text-3xl font-bold text-primary">{chatFiles.length}</p>
                      </div>

                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon name="Clock" className="h-5 w-5 text-primary" />
                          </div>
                          <p className="text-sm text-muted-foreground">Статус</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{getCaseStatusText(currentChat.caseStatus)}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Icon name="FileText" className="h-5 w-5 text-primary" />
                        Ваши документы
                      </h3>
                      {chatFiles.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-primary/20 rounded-lg">
                          <Icon name="FolderOpen" size={40} className="mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">Документов пока нет</p>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {chatFiles.map((file) => (
                            <div key={file.id} className="flex items-center gap-4 p-4 rounded-lg bg-card border border-primary/10 hover:border-primary/30 transition-colors">
                              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Icon name="FileText" size={24} className="text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {file.uploadedAt.toLocaleDateString('ru-RU')} • {file.size}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Icon name="Info" className="h-5 w-5 text-primary" />
                        Информация
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          По любым вопросам обращайтесь к вашему менеджеру через чат.
                        </p>
                        <p className="text-muted-foreground">
                          Все обновления по делу будут отображаться в этом разделе.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {((user?.role === 'client' && clientSection === 'chat') || user?.role === 'manager') && selectedChatId && currentChat && (
          <>
            <header className="h-20 border-b border-border/50 bg-card/50 backdrop-blur px-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/30">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                    {user?.role === 'client' 
                      ? MANAGER_NAME.split(' ').map(n => n[0]).join('')
                      : currentChat.clientName.split(' ').map(n => n[0]).join('')
                    }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {user?.role === 'client' ? MANAGER_NAME : currentChat.clientName}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={`h-2 w-2 rounded-full ${
                      (user?.role === 'manager' && currentChat.clientOnline) || user?.role === 'client'
                        ? 'bg-green-500'
                        : 'bg-muted-foreground/40'
                    }`}></div>
                    <p className="text-sm text-muted-foreground">
                      {(user?.role === 'manager' && currentChat.clientOnline) || user?.role === 'client'
                        ? 'В сети'
                        : 'Не в сети'
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user?.role === 'manager' && chatFiles.length > 0 && (
                  <Button 
                    onClick={downloadAllFiles}
                    variant="outline" 
                    size="sm" 
                    className="border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                  >
                    <Icon name="Download" size={16} className="mr-2 text-primary" />
                    Выгрузить все файлы ({chatFiles.length})
                  </Button>
                )}
                <Button variant="outline" size="sm" className="border-primary/20">
                  <Icon name="FolderOpen" size={16} className="mr-2 text-primary" />
                  Файлы ({chatFiles.length})
                </Button>
              </div>
            </header>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6 max-w-4xl mx-auto">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6 border border-primary/20">
                      <Icon name="MessageSquare" size={40} className="text-primary" />
                    </div>
                    <p className="text-foreground/80 text-lg font-semibold mb-2">Начните диалог</p>
                    <p className="text-sm text-muted-foreground">Персональный менеджер готов помочь вам</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isCurrentUser = msg.userId === user?.id;
                    return (
                      <div key={msg.id} className={`flex gap-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="h-11 w-11 mt-1 border-2 border-primary/20">
                          <AvatarFallback className={`${
                            isCurrentUser 
                              ? 'bg-gradient-to-br from-primary to-primary/60 text-primary-foreground' 
                              : 'bg-primary/10 text-primary'
                          } font-semibold`}>
                            {msg.userName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex-1 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className="flex items-baseline gap-2 mb-1.5">
                            <span className={`font-semibold text-sm ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                              {msg.userName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {msg.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {msg.type === 'file' ? (
                            <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border ${
                              isCurrentUser
                                ? 'bg-primary/20 border-primary/30'
                                : 'bg-card border-primary/20'
                            } shadow-sm`}>
                              <Icon name="Paperclip" size={18} className="text-primary" />
                              <span className="text-sm font-medium">{msg.fileName}</span>
                              {user?.role === 'manager' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => {
                                    const file = chatFiles.find(f => f.name === msg.fileName);
                                    if (file) downloadFile(file);
                                  }}
                                >
                                  <Icon name="Download" size={14} />
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className={`px-5 py-3 rounded-2xl max-w-lg shadow-sm ${
                              isCurrentUser
                                ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
                                : 'bg-card border border-primary/10'
                            }`}>
                              <p className="text-sm leading-relaxed">{msg.text}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-border/50 bg-card/80 backdrop-blur p-5 shadow-lg">
              <div className="max-w-4xl mx-auto flex gap-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button type="button" variant="outline" size="icon" className="border-primary/30 hover:bg-primary/10" asChild>
                    <span>
                      <Icon name="Paperclip" size={20} className="text-primary" />
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
                  className="min-h-[52px] max-h-32 resize-none border-primary/20 focus:border-primary bg-input"
                />
                <Button 
                  onClick={sendMessage} 
                  size="icon" 
                  className="shrink-0 h-[52px] w-[52px] bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                >
                  <Icon name="Send" size={20} />
                </Button>
              </div>
            </div>
          </>
        )}

        {!selectedChatId && user?.role === 'manager' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-6 border-2 border-primary/20">
                <Icon name="Users" size={48} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Выберите клиента</h2>
              <p className="text-muted-foreground">Выберите диалог из списка слева</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}