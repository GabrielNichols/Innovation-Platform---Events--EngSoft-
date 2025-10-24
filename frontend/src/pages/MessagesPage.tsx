import React from 'react';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { EmptyState } from '../components/EmptyState';
import { Send, Check, X, Clock, Paperclip, MessageCircle } from 'lucide-react';

interface MessageThread {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  project: string;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

interface Invite {
  id: string;
  from: string;
  project: string;
  role: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface MessagesPageProps {
  threads?: MessageThread[];
  messages?: Message[];
  invites?: Invite[];
}

export function MessagesPage({ 
  threads = [], 
  messages = [], 
  invites = [] 
}: MessagesPageProps) {
  const [selectedThread, setSelectedThread] = React.useState<string | null>(
    threads.length > 0 ? threads[0].id : null
  );
  const [messageInput, setMessageInput] = React.useState('');

  // TODO: Fetch from backend
  // const { threads, invites } = await fetchMessages();

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    // TODO: Send message to backend
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  return (
    <div className="min-h-screen page-background pb-24">
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        <h2 className="mb-6">Mensagens</h2>

        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="glass w-full">
            <TabsTrigger value="messages" className="flex-1">
              Conversas
              {threads.reduce((acc, t) => acc + t.unread, 0) > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {threads.reduce((acc, t) => acc + t.unread, 0)}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="invites" className="flex-1">
              Convites
              {invites.filter(i => i.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {invites.filter(i => i.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="mt-6">
            {threads.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Threads List */}
                <div className="lg:col-span-1 space-y-2">
                  {threads.map((thread) => (
                    <GlassCard
                      key={thread.id}
                      elevation={selectedThread === thread.id ? 'high' : 'medium'}
                      onClick={() => setSelectedThread(thread.id)}
                      className={`cursor-pointer ${
                        selectedThread === thread.id ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white text-sm">
                            {thread.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="truncate">{thread.name}</h4>
                            <small className="text-muted-foreground flex-shrink-0">
                              {thread.timestamp}
                            </small>
                          </div>
                          <p className="text-muted-foreground truncate mb-1">
                            {thread.lastMessage}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {thread.project}
                            </Badge>
                            {thread.unread > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {thread.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>

                {/* Messages */}
                <div className="lg:col-span-2">
                  <GlassCard elevation="high" className="h-[600px] flex flex-col">
                    {selectedThread ? (
                      <>
                        {/* Chat Header */}
                        <div className="pb-4 border-b border-border/50">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white text-sm">
                                {threads.find(t => t.id === selectedThread)?.name.split(' ').map(n => n[0]).join('') || ''}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4>{threads.find(t => t.id === selectedThread)?.name}</h4>
                              <p className="text-muted-foreground">
                                {threads.find(t => t.id === selectedThread)?.project}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-4">
                          {messages.length > 0 ? (
                            messages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                    msg.isOwn
                                      ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'
                                      : 'glass-subtle'
                                  }`}
                                >
                                  <p className="mb-1">{msg.text}</p>
                                  <small
                                    className={
                                      msg.isOwn ? 'text-white/70' : 'text-muted-foreground'
                                    }
                                  >
                                    {msg.timestamp}
                                  </small>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                              Nenhuma mensagem ainda
                            </div>
                          )}
                        </div>

                        {/* Input */}
                        <div className="pt-4 border-t border-border/50">
                          <div className="flex gap-2">
                            <GlassButton variant="ghost" size="md">
                              <Paperclip className="h-5 w-5" />
                            </GlassButton>
                            <GlassInput
                              placeholder="Digite sua mensagem..."
                              value={messageInput}
                              onChange={(e) => setMessageInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              className="flex-1"
                            />
                            <GlassButton variant="filled" size="md" onClick={handleSendMessage}>
                              <Send className="h-5 w-5" />
                            </GlassButton>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Selecione uma conversa
                      </div>
                    )}
                  </GlassCard>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={MessageCircle}
                title="Nenhuma conversa"
                description="Você ainda não tem conversas. Comece enviando uma mensagem para alguém ou candidate-se a um projeto!"
              />
            )}
          </TabsContent>

          <TabsContent value="invites" className="mt-6">
            {invites.length > 0 ? (
              <div className="space-y-4">
                {invites.map((invite) => (
                  <GlassCard key={invite.id} elevation="medium">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white">
                          {invite.from.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="mb-1">{invite.from}</h4>
                        <p className="text-muted-foreground mb-2">{invite.project}</p>
                        <Badge variant="outline">Vaga: {invite.role}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <small>{invite.timestamp}</small>
                      </div>
                    </div>

                    <p className="mb-4 text-muted-foreground">{invite.message}</p>

                    {invite.status === 'pending' && (
                      <div className="flex gap-2">
                        <GlassButton variant="filled" className="flex-1">
                          <Check className="h-4 w-4" />
                          Aceitar
                        </GlassButton>
                        <GlassButton variant="ghost" className="flex-1">
                          Negociar
                        </GlassButton>
                        <GlassButton variant="ghost">
                          <X className="h-4 w-4" />
                        </GlassButton>
                      </div>
                    )}
                  </GlassCard>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={MessageCircle}
                title="Nenhum convite pendente"
                description="Quando você receber convites para projetos, eles aparecerão aqui"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
