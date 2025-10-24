import React from 'react';
import { GlassButton } from '../components/GlassButton';
import { GlassInput, GlassTextArea } from '../components/GlassInput';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ChevronRight, ChevronLeft, Sparkles, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import {
  getAvailableEvents,
  createEventProject,
  type Event,
  type EventProject,
  ApiError,
} from '../api/api';

interface CreateProjectPageProps {
  onComplete: (project: EventProject) => void;
  onCancel: () => void;
  defaultEventId?: string;
}

export function CreateProjectPage({ onComplete, onCancel, defaultEventId }: CreateProjectPageProps) {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    title: '',
    problem: '',
    goals: '',
    category: '',
    teamName: '',
    skills: [] as string[],
    positions: [] as { role: string; count: number }[],
  });
  const [selectedEventId, setSelectedEventId] = React.useState(defaultEventId ?? '');
  const [events, setEvents] = React.useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const categories = ['Saúde', 'EdTech', 'Fintech', 'IoT', 'AI/ML', 'Blockchain', 'CleanTech', 'Smart City'];
  const skillsOptions = ['React', 'Python', 'Node.js', 'Machine Learning', 'UI/UX', 'IoT', 'Blockchain', 'Flutter', 'DevOps'];
  const roleOptions = ['Frontend Developer', 'Backend Developer', 'ML Engineer', 'UX/UI Designer', 'Product Manager', 'DevOps Engineer'];

  React.useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadEvents() {
      try {
        setEventsLoading(true);
        const data = await getAvailableEvents(controller.signal);
        if (!isMounted) return;
        setEvents(data);
        if (!selectedEventId) {
          const preferred = data.find((event) => event.id === defaultEventId);
          const firstEvent = preferred || data[0];
          if (firstEvent) {
            setSelectedEventId(firstEvent.id);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Não foi possível carregar os eventos disponíveis.');
        }
      } finally {
        if (isMounted) {
          setEventsLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [defaultEventId]);

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const addPosition = (role: string) => {
    if (!formData.positions.find(p => p.role === role)) {
      setFormData(prev => ({
        ...prev,
        positions: [...prev.positions, { role, count: 1 }],
      }));
    }
  };

  const removePosition = (role: string) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.filter(p => p.role !== role),
    }));
  };

  const handleSubmit = async () => {
    if (!selectedEventId) {
      setError('Selecione o evento em que seu projeto será submetido.');
      setStep(1);
      return;
    }

    if (!formData.teamName.trim()) {
      setError('Informe um nome para a equipe.');
      setStep(3);
      return;
    }

    setSubmitting(true);
    setError(null);

    const descriptionSegments = [
      formData.problem && `Problema: ${formData.problem}`,
      formData.goals && `Objetivos: ${formData.goals}`,
      formData.positions.length > 0 &&
        `Vagas Abertas: ${formData.positions.map((pos) => `${pos.role} (${pos.count})`).join(', ')}`,
    ].filter(Boolean) as string[];

    const description = descriptionSegments.join('\n\n');

    try {
      const project = await createEventProject(selectedEventId, {
        title: formData.title.trim(),
        description,
        category: formData.category || 'Outros',
        teamName: formData.teamName.trim(),
        skills: formData.skills,
      });

      onComplete(project);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Não foi possível submeter o projeto. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const attractivenessScore = Math.min(
    100,
    (formData.title ? 20 : 0) +
    (formData.problem ? 20 : 0) +
    (formData.goals ? 20 : 0) +
    (formData.teamName ? 10 : 0) +
    (formData.skills.length * 5) +
    (formData.positions.length * 10)
  );

  const canProceedStep1 = Boolean(
    selectedEventId &&
    formData.title.trim() &&
    formData.problem.trim() &&
    formData.goals.trim() &&
    formData.category
  );

  const canProceedStep2 = formData.skills.length > 0;
  const canSubmit = Boolean(
    selectedEventId &&
    formData.positions.length > 0 &&
    formData.teamName.trim() &&
    !submitting
  );

  return (
    <div className="min-h-screen page-background pb-24">
      <div className="max-w-screen-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="mb-2">Criar Novo Projeto</h2>
          <p className="text-muted-foreground">Passo {step} de 3</p>
        </div>

        {error && (
          <GlassCard elevation="medium" className="mb-6 border border-red-500/30 bg-red-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <h4 className="text-red-500">Algo deu errado</h4>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <GlassButton variant="ghost" size="sm" onClick={() => setError(null)}>
                Fechar
              </GlassButton>
            </div>
          </GlassCard>
        )}

        {/* Progress */}
        <GlassCard elevation="medium" className="mb-6">
          <Progress value={(step / 3) * 100} className="mb-2" />
          <div className="flex justify-between">
            <small className={step === 1 ? 'text-primary' : 'text-muted-foreground'}>
              Problema
            </small>
            <small className={step === 2 ? 'text-primary' : 'text-muted-foreground'}>
              Tecnologia
            </small>
            <small className={step === 3 ? 'text-primary' : 'text-muted-foreground'}>
              Equipe
            </small>
          </div>
        </GlassCard>

        {/* Step 1: Problem & Goals */}
        {step === 1 && (
          <div className="space-y-6">
            <GlassCard elevation="high">
              <h3 className="mb-4">Problema & Objetivos</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-foreground/80">Evento</label>
                  {eventsLoading ? (
                    <div className="glass-subtle rounded-lg p-3 flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando eventos disponíveis...
                    </div>
                  ) : events.length > 0 ? (
                    <select
                      className="w-full glass-subtle rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                    >
                      <option value="" disabled>
                        Selecione o evento
                      </option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name} • {event.status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="glass-subtle rounded-lg p-4 text-sm text-muted-foreground">
                      Nenhum evento disponível para submissão no momento. Verifique se você está inscrito em um evento ativo.
                    </div>
                  )}
                </div>

                <GlassInput
                  label="Título do Projeto"
                  placeholder="Ex: Sistema de Diagnóstico Médico com IA"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />

                <div>
                  <label className="block mb-2 text-foreground/80">Categoria</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={formData.category === cat ? undefined : 'outline'}
                        className={`cursor-pointer transition-all ${
                          formData.category === cat
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-transparent dark:from-teal-400 dark:to-emerald-500 dark:text-slate-900'
                            : 'hover:bg-primary/10'
                        }`}
                        onClick={() => setFormData({ ...formData, category: formData.category === cat ? '' : cat })}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                <GlassTextArea
                  label="Qual problema você está resolvendo?"
                  placeholder="Descreva o problema que seu projeto aborda..."
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  helperText="Seja claro sobre o impacto e relevância"
                />

                <GlassTextArea
                  label="Quais são os objetivos?"
                  placeholder="Descreva os objetivos e resultados esperados..."
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                />
              </div>
            </GlassCard>

            <div className="flex gap-3">
              <GlassButton variant="ghost" size="lg" onClick={onCancel}>
                Cancelar
              </GlassButton>
              <GlassButton
                variant="filled"
                size="lg"
                className="flex-1"
                onClick={() => {
                  setError(null);
                  setStep(2);
                }}
                disabled={!canProceedStep1}
              >
                Próximo
                <ChevronRight className="h-5 w-5" />
              </GlassButton>
            </div>
          </div>
        )}

        {/* Step 2: Tech & Resources */}
        {step === 2 && (
          <div className="space-y-6">
            <GlassCard elevation="high">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3>Tecnologias & Recursos</h3>
                <GlassButton variant="ghost" size="sm">
                  <Sparkles className="h-4 w-4" />
                  Sugerir
                </GlassButton>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-foreground/80">
                    Tecnologias Necessárias
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {skillsOptions.map((skill) => (
                      <Badge
                        key={skill}
                        variant={formData.skills.includes(skill) ? undefined : 'outline'}
                        className={`cursor-pointer transition-all ${
                          formData.skills.includes(skill)
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-transparent dark:from-teal-400 dark:to-emerald-500 dark:text-slate-900'
                            : 'hover:bg-primary/10'
                        }`}
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <GlassTextArea
                  label="Recursos Disponíveis (opcional)"
                  placeholder="Descreva quais recursos você já tem (time, infraestrutura, orçamento...)"
                />

                <GlassInput
                  label="Localização"
                  placeholder="Ex: Remoto, Híbrido - São Paulo, Presencial"
                />
              </div>
            </GlassCard>

            <div className="flex gap-3">
              <GlassButton variant="ghost" size="lg" onClick={() => setStep(1)}>
                <ChevronLeft className="h-5 w-5" />
                Voltar
              </GlassButton>
              <GlassButton
                variant="filled"
                size="lg"
                className="flex-1"
                onClick={() => {
                  setError(null);
                  setStep(3);
                }}
                disabled={!canProceedStep2}
              >
                Próximo
                <ChevronRight className="h-5 w-5" />
              </GlassButton>
            </div>
          </div>
        )}

        {/* Step 3: Team & Positions */}
        {step === 3 && (
          <div className="space-y-6">
            <GlassCard elevation="high">
              <h3 className="mb-4">Vagas & Competências</h3>

              <div className="space-y-4 mb-6">
                <GlassInput
                  label="Nome da Equipe"
                  placeholder="Ex: Equipe Alpha, Dream Team..."
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                />

                <div>
                  <label className="block mb-2 text-foreground/80">
                    Adicionar Vaga
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {roleOptions.map((role) => (
                      <Badge
                        key={role}
                        variant={formData.positions.find(p => p.role === role) ? undefined : 'outline'}
                        className={`cursor-pointer transition-all ${
                          formData.positions.find(p => p.role === role)
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-transparent dark:from-teal-400 dark:to-emerald-500 dark:text-slate-900'
                            : 'hover:bg-primary/10'
                        }`}
                        onClick={() =>
                          formData.positions.find(p => p.role === role)
                            ? removePosition(role)
                            : addPosition(role)
                        }
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                {formData.positions.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-foreground/80">Vagas Selecionadas</label>
                    {formData.positions.map((pos) => (
                      <div
                        key={pos.role}
                        className="glass-subtle rounded-lg p-3 flex items-center justify-between"
                      >
                        <span>{pos.role}</span>
                        <div className="flex items-center gap-2">
                          <GlassButton
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = formData.positions.map(p =>
                                p.role === pos.role ? { ...p, count: Math.max(1, p.count - 1) } : p
                              );
                              setFormData({ ...formData, positions: updated });
                            }}
                          >
                            -
                          </GlassButton>
                          <span className="w-8 text-center">{pos.count}</span>
                          <GlassButton
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = formData.positions.map(p =>
                                p.role === pos.role ? { ...p, count: p.count + 1 } : p
                              );
                              setFormData({ ...formData, positions: updated });
                            }}
                          >
                            +
                          </GlassButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Attractiveness Score */}
            <GlassCard
              elevation="medium"
              className="bg-gradient-to-r from-green-500/10 to-blue-500/10"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="mb-2">Score de Atratividade</h4>
                  <div className="glass-subtle rounded-lg p-3 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span>Potencial de Atração</span>
                      <span>{attractivenessScore}%</span>
                    </div>
                    <Progress value={attractivenessScore} />
                  </div>
                  <p className="text-muted-foreground">
                    {attractivenessScore < 40 && 'Adicione mais detalhes para aumentar a visibilidade'}
                    {attractivenessScore >= 40 && attractivenessScore < 70 && 'Bom! Mais algumas informações melhorarão o match'}
                    {attractivenessScore >= 70 && 'Excelente! Seu projeto tem alto potencial de atrair talentos'}
                  </p>
                </div>
              </div>
            </GlassCard>

            <div className="flex gap-3">
              <GlassButton variant="ghost" size="lg" onClick={() => setStep(2)}>
                <ChevronLeft className="h-5 w-5" />
                Voltar
              </GlassButton>
              <GlassButton
                variant="filled"
                size="lg"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Publicar Projeto'
                )}
              </GlassButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
