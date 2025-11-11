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
  const [errors, setErrors] = React.useState<Record<string, string>>({});

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

  // Real-time validation functions matching backend rules
  const validateField = React.useCallback((field: string, value: any): string | null => {
    switch (field) {
      case 'title':
        if (!value || !value.trim()) return 'Título do projeto é obrigatório';
        if (value.trim().length < 3) return 'Título deve ter pelo menos 3 caracteres';
        if (value.trim().length > 200) return 'Título deve ter no máximo 200 caracteres';
        return null;
      
      case 'description':
        if (!value || !value.trim()) return 'Descrição é obrigatória';
        if (value.trim().length < 10) return 'Descrição deve ter pelo menos 10 caracteres';
        return null;
      
      case 'teamName':
        if (!value || !value.trim()) return 'Nome da equipe é obrigatório';
        if (value.trim().length < 3) return 'Nome da equipe deve ter pelo menos 3 caracteres';
        return null;
      
      case 'category':
        if (!value || !value.trim()) return 'Categoria é obrigatória';
        if (value.trim().length < 2) return 'Categoria deve ter pelo menos 2 caracteres';
        return null;
      
      case 'skills':
        if (!value || value.length === 0) return 'Selecione pelo menos uma tecnologia';
        return null;
      
      default:
        return null;
    }
  }, []);

  // Validate field on change - called immediately when user types
  const handleFieldChange = React.useCallback((field: string, value: any) => {
    const error = validateField(field, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  }, []);

  const toggleSkill = (skill: string) => {
    const newSkills = formData.skills.includes(skill)
      ? formData.skills.filter(s => s !== skill)
      : [...formData.skills, skill];
    
    setFormData(prev => ({
      ...prev,
      skills: newSkills,
    }));
    handleFieldChange('skills', newSkills);
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const titleError = validateField('title', formData.title);
    if (titleError) newErrors.title = titleError;
    
    const problemError = validateField('description', formData.problem);
    if (problemError) newErrors.problem = problemError;
    
    const goalsError = validateField('description', formData.goals);
    if (goalsError) newErrors.goals = goalsError;
    
    // Combined description validation
    const description = [
      formData.problem && `Problema: ${formData.problem}`,
      formData.goals && `Objetivos: ${formData.goals}`,
    ].filter(Boolean).join('\n\n');
    const descriptionError = validateField('description', description);
    if (descriptionError && !problemError && !goalsError) {
      newErrors.description = 'A descrição completa (problema + objetivos) deve ter pelo menos 10 caracteres';
    }
    
    const categoryError = validateField('category', formData.category);
    if (categoryError) newErrors.category = categoryError;
    
    const teamNameError = validateField('teamName', formData.teamName);
    if (teamNameError) newErrors.teamName = teamNameError;
    
    const skillsError = validateField('skills', formData.skills);
    if (skillsError) newErrors.skills = skillsError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!selectedEventId) {
      setError('Selecione o evento em que seu projeto será submetido.');
      setStep(1);
      return;
    }

    // Validate all fields
    if (!validateForm()) {
      // Navigate to step with errors
      if (errors.title || errors.problem || errors.goals || errors.category) {
        setStep(1);
      } else if (errors.skills) {
        setStep(2);
      } else if (errors.teamName) {
        setStep(3);
      }
      setError('Por favor, corrija os erros no formulário antes de continuar.');
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
    
    // Calculate total members from positions
    const totalMembers = formData.positions.reduce((sum, pos) => sum + pos.count, 0) || 1;

    try {
      const project = await createEventProject(selectedEventId, {
        title: formData.title.trim(),
        description,
        category: formData.category.trim(),
        teamName: formData.teamName.trim(),
        skills: formData.skills,
        members: totalMembers,
      });

      onComplete(project);
    } catch (err) {
      if (err instanceof ApiError) {
        // Handle 404 - event not found or not active
        if (err.status === 404) {
          setError('Evento não encontrado ou não está ativo. Verifique se o evento existe e está no status "active" para aceitar projetos.');
          return;
        }
        
        // Try to parse backend validation errors and map to form fields
        if (err.status === 422 && err.details) {
          const validationErrors: Record<string, string> = {};
          
          // FastAPI returns errors in 'detail' array format
          if (Array.isArray(err.details)) {
            err.details.forEach((errorDetail: any) => {
              const fieldPath = errorDetail.loc?.slice(1) || [];
              const fieldName = fieldPath[0];
              
              if (fieldName) {
                // Map backend field names to frontend field names
                const fieldMap: Record<string, string> = {
                  'team_name': 'teamName',
                };
                
                const frontendField = fieldMap[fieldName] || fieldName;
                validationErrors[frontendField] = errorDetail.msg || 'Valor inválido';
              }
            });
          }
          
          // If we found validation errors, merge them with existing errors
          if (Object.keys(validationErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...validationErrors }));
            setError('Por favor, corrija os erros no formulário antes de continuar.');
            
            // Navigate to step with errors
            if (validationErrors.title || validationErrors.category || validationErrors.description) {
              setStep(1);
            } else if (validationErrors.skills) {
              setStep(2);
            } else if (validationErrors.teamName) {
              setStep(3);
            }
          } else {
            setError(err.message);
          }
        } else {
          setError(err.message);
        }
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
    formData.title.trim().length >= 3 &&
    formData.problem.trim() &&
    formData.goals.trim() &&
    (formData.problem.trim() + formData.goals.trim()).length >= 10 &&
    formData.category &&
    formData.category.trim().length >= 2 &&
    !errors.title &&
    !errors.problem &&
    !errors.goals &&
    !errors.category
  );

  const canProceedStep2 = formData.skills.length > 0 && !errors.skills;
  const canSubmit = Boolean(
    selectedEventId &&
    formData.positions.length > 0 &&
    formData.teamName.trim() &&
    formData.teamName.trim().length >= 3 &&
    !errors.teamName &&
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

                <div>
                  <GlassInput
                    label="Título do Projeto"
                    placeholder="Ex: Sistema de Diagnóstico Médico com IA"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      handleFieldChange('title', e.target.value);
                    }}
                  />
                  {errors.title && <small className="text-red-500 mt-1 block">{errors.title}</small>}
                  {!errors.title && formData.title && (
                    <small className="text-muted-foreground mt-1 block">
                      {formData.title.trim().length}/200 caracteres {formData.title.trim().length < 3 && '(mínimo 3)'}
                    </small>
                  )}
                </div>

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
                        onClick={() => {
                          const newCategory = formData.category === cat ? '' : cat;
                          setFormData({ ...formData, category: newCategory });
                          handleFieldChange('category', newCategory);
                        }}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  {errors.category && <small className="text-red-500 mt-1 block">{errors.category}</small>}
                  {!errors.category && !formData.category && (
                    <small className="text-muted-foreground mt-1 block">
                      Selecione uma categoria
                    </small>
                  )}
                </div>

                <div>
                  <GlassTextArea
                    label="Qual problema você está resolvendo?"
                    placeholder="Descreva o problema que seu projeto aborda..."
                    value={formData.problem}
                    onChange={(e) => {
                      setFormData({ ...formData, problem: e.target.value });
                      // Validate combined description
                      const combined = [
                        e.target.value && `Problema: ${e.target.value}`,
                        formData.goals && `Objetivos: ${formData.goals}`,
                      ].filter(Boolean).join('\n\n');
                      handleFieldChange('description', combined);
                    }}
                    helperText="Seja claro sobre o impacto e relevância"
                  />
                  {errors.problem && <small className="text-red-500 mt-1 block">{errors.problem}</small>}
                  {errors.description && !errors.problem && <small className="text-red-500 mt-1 block">{errors.description}</small>}
                </div>

                <div>
                  <GlassTextArea
                    label="Quais são os objetivos?"
                    placeholder="Descreva os objetivos e resultados esperados..."
                    value={formData.goals}
                    onChange={(e) => {
                      setFormData({ ...formData, goals: e.target.value });
                      // Validate combined description
                      const combined = [
                        formData.problem && `Problema: ${formData.problem}`,
                        e.target.value && `Objetivos: ${e.target.value}`,
                      ].filter(Boolean).join('\n\n');
                      handleFieldChange('description', combined);
                    }}
                  />
                  {errors.goals && <small className="text-red-500 mt-1 block">{errors.goals}</small>}
                </div>
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
                  {errors.skills && <small className="text-red-500 mt-1 block">{errors.skills}</small>}
                  {!errors.skills && formData.skills.length === 0 && (
                    <small className="text-muted-foreground mt-1 block">
                      Selecione pelo menos uma tecnologia
                    </small>
                  )}
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
                <div>
                  <GlassInput
                    label="Nome da Equipe"
                    placeholder="Ex: Equipe Alpha, Dream Team..."
                    value={formData.teamName}
                    onChange={(e) => {
                      setFormData({ ...formData, teamName: e.target.value });
                      handleFieldChange('teamName', e.target.value);
                    }}
                  />
                  {errors.teamName && <small className="text-red-500 mt-1 block">{errors.teamName}</small>}
                  {!errors.teamName && formData.teamName && (
                    <small className="text-muted-foreground mt-1 block">
                      {formData.teamName.trim().length} caracteres {formData.teamName.trim().length < 3 && '(mínimo 3)'}
                    </small>
                  )}
                </div>

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
