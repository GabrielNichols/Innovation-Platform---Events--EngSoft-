import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { GlassInput } from '../components/GlassInput';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import {
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Clock,
  Plus,
  X,
  Save,
  Eye,
  Globe,
  Link as LinkIcon
} from 'lucide-react';
import {
  createEvent,
  updateEvent,
  type Event,
  type CreateEventPayload,
  type Prize,
  type EventRestriction,
  type ScheduleItem,
  type SocialLink,
  ApiError,
} from '../api/api';

interface CreateEventPageProps {
  onComplete: (event: Event) => void;
  onCancel: () => void;
  eventToEdit?: Event; // For editing existing event
}

export interface EventFormData {
  id?: string;
  name: string;
  description: string;
  theme: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  location: string;
  locationType: 'presencial' | 'online' | 'hibrido';
  maxParticipants: number;
  minTeamSize: number;
  maxTeamSize: number;
  categories: string[];
  prizes: Prize[];
  restrictions: EventRestriction[];
  schedule: ScheduleItem[];
  socialLinks: SocialLink[];
  requiresApproval: boolean;
  allowsWaitlist: boolean;
  isPublished: boolean;
}

const toInputDate = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toISOString().substring(0, 10);
};

const sanitizePrizes = (prizes: Prize[]): Prize[] =>
  prizes
    .map((prize, index) => ({
      position: prize.position || `${index + 1}º Lugar`,
      description: prize.description?.trim() || '',
      value: prize.value?.trim() || undefined,
    }))
    .filter((prize) => prize.description || prize.value);

const sanitizeRestrictions = (restrictions: EventRestriction[]): EventRestriction[] =>
  restrictions.filter((item) => item.description?.trim());

const sanitizeSchedule = (schedule: ScheduleItem[]): ScheduleItem[] =>
  schedule
    .map((item) => ({
      ...item,
      title: item.title?.trim() || '',
      description: item.description?.trim() || '',
    }))
    .filter((item) => item.date && item.time && item.title);

const sanitizeSocialLinks = (links: SocialLink[]): SocialLink[] =>
  links
    .map((link) => ({
      platform: link.platform,
      url: link.url?.trim() || '',
    }))
    .filter((link) => link.url);

export function CreateEventPage({ onComplete, onCancel, eventToEdit }: CreateEventPageProps) {
  const [step, setStep] = React.useState<'basic' | 'details' | 'rules' | 'schedule' | 'review'>('basic');
  
  // Basic Info
  const [name, setName] = React.useState(eventToEdit?.name || '');
  const [description, setDescription] = React.useState(eventToEdit?.description || '');
  const [theme, setTheme] = React.useState(eventToEdit?.theme || '');
  const [startDate, setStartDate] = React.useState(eventToEdit?.startDate || '');
  const [endDate, setEndDate] = React.useState(eventToEdit?.endDate || '');
  const [registrationDeadline, setRegistrationDeadline] = React.useState(eventToEdit?.registrationDeadline || '');
  const [location, setLocation] = React.useState(eventToEdit?.location || '');
  const [locationType, setLocationType] = React.useState<'presencial' | 'online' | 'hibrido'>(eventToEdit?.locationType || 'online');
  
  // Details
  const [maxParticipants, setMaxParticipants] = React.useState(eventToEdit?.maxParticipants || 100);
  const [minTeamSize, setMinTeamSize] = React.useState(eventToEdit?.minTeamSize || 1);
  const [maxTeamSize, setMaxTeamSize] = React.useState(eventToEdit?.maxTeamSize || 5);
  const [categories, setCategories] = React.useState<string[]>(eventToEdit?.categories || []);
  const [currentCategory, setCurrentCategory] = React.useState('');
  const [prizes, setPrizes] = React.useState<Prize[]>(eventToEdit?.prizes || []);
  
  // Rules
  const [restrictions, setRestrictions] = React.useState<EventRestriction[]>(eventToEdit?.restrictions || []);
  const [requiresApproval, setRequiresApproval] = React.useState(eventToEdit?.requiresApproval || false);
  const [allowsWaitlist, setAllowsWaitlist] = React.useState(eventToEdit?.allowsWaitlist || true);
  
  // Schedule
  const [schedule, setSchedule] = React.useState<ScheduleItem[]>(eventToEdit?.schedule || []);
  
  // Social & Publishing
  const [socialLinks, setSocialLinks] = React.useState<SocialLink[]>(eventToEdit?.socialLinks || []);
  const [isPublished, setIsPublished] = React.useState(eventToEdit?.isPublished || false);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const isEditing = React.useMemo(() => Boolean(eventToEdit?.id), [eventToEdit?.id]);

  React.useEffect(() => {
    if (!eventToEdit) return;
    
    setName(eventToEdit.name || '');
    setDescription(eventToEdit.description || '');
    setTheme(eventToEdit.theme || '');
    setStartDate(toInputDate(eventToEdit.startDate));
    setEndDate(toInputDate(eventToEdit.endDate));
    setRegistrationDeadline(toInputDate(eventToEdit.registrationDeadline));
    setLocation(eventToEdit.location || '');
    setLocationType(eventToEdit.locationType || 'online');
    setMaxParticipants(eventToEdit.maxParticipants || 100);
    setMinTeamSize(eventToEdit.minTeamSize || 1);
    setMaxTeamSize(eventToEdit.maxTeamSize || 5);
    setCategories(eventToEdit.categories || []);
    setPrizes(eventToEdit.prizes || []);
    setRestrictions(eventToEdit.restrictions || []);
    setSchedule((eventToEdit.schedule || []).map((item) => ({
      ...item,
      date: toInputDate(item.date),
    })));
    setSocialLinks(eventToEdit.socialLinks || []);
    setRequiresApproval(eventToEdit.requiresApproval || false);
    setAllowsWaitlist(eventToEdit.allowsWaitlist ?? true);
    setIsPublished(eventToEdit.isPublished || eventToEdit.status === 'published' || eventToEdit.status === 'active');
  }, [eventToEdit]);

  const validateBasicInfo = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Nome do evento é obrigatório';
    if (!description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!theme.trim()) newErrors.theme = 'Temática é obrigatória';
    if (!startDate) newErrors.startDate = 'Data de início é obrigatória';
    if (!endDate) newErrors.endDate = 'Data de término é obrigatória';
    if (!registrationDeadline) newErrors.registrationDeadline = 'Prazo de inscrição é obrigatório';
    if (!location.trim()) newErrors.location = 'Localização é obrigatória';
    
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'Data de término deve ser após data de início';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addCategory = () => {
    if (currentCategory.trim() && !categories.includes(currentCategory.trim())) {
      setCategories([...categories, currentCategory.trim()]);
      setCurrentCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  const addPrize = () => {
    setPrizes([...prizes, { position: `${prizes.length + 1}º Lugar`, description: '', value: '' }]);
  };

  const updatePrize = (index: number, field: keyof Prize, value: string) => {
    const newPrizes = [...prizes];
    newPrizes[index] = { ...newPrizes[index], [field]: value };
    setPrizes(newPrizes);
  };

  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const addRestriction = (type: EventRestriction['type']) => {
    setRestrictions([...restrictions, { type, description: '' }]);
  };

  const updateRestriction = (index: number, description: string) => {
    const newRestrictions = [...restrictions];
    newRestrictions[index].description = description;
    setRestrictions(newRestrictions);
  };

  const removeRestriction = (index: number) => {
    setRestrictions(restrictions.filter((_, i) => i !== index));
  };

  const addScheduleItem = () => {
    setSchedule([...schedule, { date: '', time: '', title: '', description: '' }]);
  };

  const updateScheduleItem = (index: number, field: keyof ScheduleItem, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const removeScheduleItem = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const addSocialLink = (platform: string) => {
    setSocialLinks([...socialLinks, { platform, url: '' }]);
  };

  const updateSocialLink = (index: number, url: string) => {
    const newLinks = [...socialLinks];
    newLinks[index].url = url;
    setSocialLinks(newLinks);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const isBasicValid = validateBasicInfo();
    if (!isBasicValid) {
      setStep('basic');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const payload: CreateEventPayload = {
      name: name.trim(),
      description: description.trim(),
      theme: theme.trim() || undefined,
      startDate,
      endDate,
      registrationDeadline: registrationDeadline || undefined,
      location: location.trim(),
      locationType,
      maxParticipants,
      minTeamSize,
      maxTeamSize,
      categories,
      prizes: sanitizePrizes(prizes),
      restrictions: sanitizeRestrictions(restrictions),
      schedule: sanitizeSchedule(schedule),
      socialLinks: sanitizeSocialLinks(socialLinks),
      requiresApproval,
      allowsWaitlist,
      isPublished,
    };

    try {
      const result = isEditing && eventToEdit?.id
        ? await updateEvent(eventToEdit.id, payload)
        : await createEvent(payload);

      onComplete(result);
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Erro inesperado ao salvar o evento.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'basic', label: 'Informações Básicas' },
      { id: 'details', label: 'Detalhes' },
      { id: 'rules', label: 'Regras' },
      { id: 'schedule', label: 'Cronograma' },
      { id: 'review', label: 'Revisão' },
    ];

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, index) => (
          <React.Fragment key={s.id}>
            <button
              onClick={() => setStep(s.id as typeof step)}
              className={`flex-1 text-center ${
                step === s.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className={`h-2 w-full rounded-full mb-2 ${
                step === s.id ? 'bg-gradient-to-r from-teal-500 to-emerald-600' : 'glass-subtle'
              }`} />
              <small>{s.label}</small>
            </button>
            {index < steps.length - 1 && (
              <div className="w-4 h-2 glass-subtle mx-1 rounded-full" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen page-background pb-24">
      {/* Header */}
      <div className="glass-strong sticky top-0 z-10 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GlassButton variant="ghost" size="sm" onClick={onCancel}>
                <ArrowLeft className="h-4 w-4" />
              </GlassButton>
              <div>
                <h3>{eventToEdit ? 'Editar Evento' : 'Criar Novo Evento'}</h3>
                <small className="text-muted-foreground">
                  {step === 'basic' && 'Passo 1 de 5'}
                  {step === 'details' && 'Passo 2 de 5'}
                  {step === 'rules' && 'Passo 3 de 5'}
                  {step === 'schedule' && 'Passo 4 de 5'}
                  {step === 'review' && 'Passo 5 de 5'}
                </small>
              </div>
            </div>
            <div className="flex gap-2">
              <GlassButton variant="ghost" size="sm" disabled={submitting}>
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Pré-visualizar</span>
              </GlassButton>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={handleSubmit}
                disabled={submitting}
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {submitting ? 'Salvando...' : 'Salvar Rascunho'}
                </span>
              </GlassButton>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {renderStepIndicator()}

        {/* Step 1: Basic Info */}
        {step === 'basic' && (
          <div className="space-y-6">
            <GlassCard elevation="medium">
              <h4 className="mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Informações Básicas do Evento
              </h4>

              <div className="space-y-4">
                <div>
                  <GlassInput
                    label="Nome do Evento"
                    placeholder="Ex: Hackathon de Inovação 2025"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && <small className="text-red-500 mt-1 block">{errors.name}</small>}
                </div>

                <div>
                  <label className="block mb-2 text-muted-foreground">
                    Descrição Detalhada
                  </label>
                  <textarea
                    className="w-full glass-subtle rounded-lg p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Descreva o evento, objetivos, público-alvo..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  {errors.description && <small className="text-red-500 mt-1 block">{errors.description}</small>}
                </div>

                <div>
                  <GlassInput
                    label="Temática Principal"
                    placeholder="Ex: Inteligência Artificial, Sustentabilidade, Saúde Digital..."
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  />
                  {errors.theme && <small className="text-red-500 mt-1 block">{errors.theme}</small>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <GlassInput
                      label="Data de Início"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    {errors.startDate && <small className="text-red-500 mt-1 block">{errors.startDate}</small>}
                  </div>
                  <div>
                    <GlassInput
                      label="Data de Término"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                    {errors.endDate && <small className="text-red-500 mt-1 block">{errors.endDate}</small>}
                  </div>
                  <div>
                    <GlassInput
                      label="Prazo de Inscrição"
                      type="date"
                      value={registrationDeadline}
                      onChange={(e) => setRegistrationDeadline(e.target.value)}
                    />
                    {errors.registrationDeadline && <small className="text-red-500 mt-1 block">{errors.registrationDeadline}</small>}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-muted-foreground">
                    Tipo de Evento
                  </label>
                  <div className="flex gap-2">
                    {(['online', 'presencial', 'hibrido'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setLocationType(type)}
                        className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                          locationType === type
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'
                            : 'glass-subtle hover:glass'
                        }`}
                      >
                        {type === 'online' && '💻 Online'}
                        {type === 'presencial' && '🏢 Presencial'}
                        {type === 'hibrido' && '🌐 Híbrido'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <GlassInput
                    label={locationType === 'online' ? 'Link/Plataforma' : 'Localização'}
                    placeholder={locationType === 'online' ? 'Ex: Zoom, Google Meet, Discord...' : 'Ex: Auditório Central - Universidade XYZ'}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  {errors.location && <small className="text-red-500 mt-1 block">{errors.location}</small>}
                </div>
              </div>
            </GlassCard>

            <div className="flex justify-end">
              <GlassButton
                variant="filled"
                onClick={() => {
                  if (validateBasicInfo()) {
                    setStep('details');
                  }
                }}
              >
                Próximo: Detalhes
              </GlassButton>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 'details' && (
          <div className="space-y-6">
            <GlassCard elevation="medium">
              <h4 className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Participantes e Equipes
              </h4>

              <div className="space-y-4">
                <div>
                  <GlassInput
                    label="Número Máximo de Participantes"
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    min="1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <GlassInput
                    label="Tamanho Mínimo da Equipe"
                    type="number"
                    value={minTeamSize}
                    onChange={(e) => setMinTeamSize(Number(e.target.value))}
                    min="1"
                  />
                  <GlassInput
                    label="Tamanho Máximo da Equipe"
                    type="number"
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                    min={minTeamSize}
                  />
                </div>
              </div>
            </GlassCard>

            <GlassCard elevation="medium">
              <h4 className="mb-4">Categorias e Tags</h4>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <GlassInput
                    placeholder="Ex: Saúde, Educação, Fintech..."
                    value={currentCategory}
                    onChange={(e) => setCurrentCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                  />
                  <GlassButton variant="filled" onClick={addCategory}>
                    <Plus className="h-4 w-4" />
                  </GlassButton>
                </div>

                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge key={category} className="flex items-center gap-1">
                        {category}
                        <button onClick={() => removeCategory(category)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>

            <GlassCard elevation="medium">
              <div className="flex items-center justify-between mb-4">
                <h4 className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Prêmios e Reconhecimentos
                </h4>
                <GlassButton variant="ghost" size="sm" onClick={addPrize}>
                  <Plus className="h-4 w-4" />
                  Adicionar Prêmio
                </GlassButton>
              </div>

              <div className="space-y-3">
                {prizes.map((prize, index) => (
                  <div key={index} className="glass-subtle rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <GlassInput
                          placeholder="Posição (ex: 1º Lugar, Melhor Design...)"
                          value={prize.position}
                          onChange={(e) => updatePrize(index, 'position', e.target.value)}
                        />
                        <GlassInput
                          placeholder="Descrição do prêmio"
                          value={prize.description}
                          onChange={(e) => updatePrize(index, 'description', e.target.value)}
                        />
                        <GlassInput
                          placeholder="Valor (opcional)"
                          value={prize.value || ''}
                          onChange={(e) => updatePrize(index, 'value', e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => removePrize(index)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <div className="flex justify-between">
              <GlassButton variant="ghost" onClick={() => setStep('basic')}>
                Voltar
              </GlassButton>
              <GlassButton variant="filled" onClick={() => setStep('rules')}>
                Próximo: Regras
              </GlassButton>
            </div>
          </div>
        )}

        {/* Step 3: Rules */}
        {step === 'rules' && (
          <div className="space-y-6">
            <GlassCard elevation="medium">
              <h4 className="mb-4">Configurações de Inscrição</h4>

              <div className="space-y-4">
                <div className="flex items-center justify-between glass-subtle rounded-lg p-4">
                  <div>
                    <h4>Aprovação Manual</h4>
                    <small className="text-muted-foreground">
                      Inscrições precisam ser aprovadas por você
                    </small>
                  </div>
                  <Switch
                    checked={requiresApproval}
                    onCheckedChange={setRequiresApproval}
                  />
                </div>

                <div className="flex items-center justify-between glass-subtle rounded-lg p-4">
                  <div>
                    <h4>Lista de Espera</h4>
                    <small className="text-muted-foreground">
                      Permitir inscrições após limite atingido
                    </small>
                  </div>
                  <Switch
                    checked={allowsWaitlist}
                    onCheckedChange={setAllowsWaitlist}
                  />
                </div>
              </div>
            </GlassCard>

            <GlassCard elevation="medium">
              <div className="flex items-center justify-between mb-4">
                <h4>Restrições de Participação</h4>
                <div className="flex gap-2">
                  <GlassButton variant="ghost" size="sm" onClick={() => addRestriction('age')}>
                    <Plus className="h-3 w-3" />
                    Idade
                  </GlassButton>
                  <GlassButton variant="ghost" size="sm" onClick={() => addRestriction('experience')}>
                    <Plus className="h-3 w-3" />
                    Experiência
                  </GlassButton>
                  <GlassButton variant="ghost" size="sm" onClick={() => addRestriction('custom')}>
                    <Plus className="h-3 w-3" />
                    Outra
                  </GlassButton>
                </div>
              </div>

              <div className="space-y-3">
                {restrictions.map((restriction, index) => (
                  <div key={index} className="glass-subtle rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">
                        {restriction.type === 'age' && '🎂 Idade'}
                        {restriction.type === 'experience' && '⭐ Experiência'}
                        {restriction.type === 'location' && '📍 Localização'}
                        {restriction.type === 'custom' && '✏️ Customizada'}
                      </Badge>
                      <div className="flex-1">
                        <GlassInput
                          placeholder="Descreva a restrição..."
                          value={restriction.description}
                          onChange={(e) => updateRestriction(index, e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => removeRestriction(index)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}

                {restrictions.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma restrição definida. Clique nos botões acima para adicionar.
                  </p>
                )}
              </div>
            </GlassCard>

            <div className="flex justify-between">
              <GlassButton variant="ghost" onClick={() => setStep('details')}>
                Voltar
              </GlassButton>
              <GlassButton variant="filled" onClick={() => setStep('schedule')}>
                Próximo: Cronograma
              </GlassButton>
            </div>
          </div>
        )}

        {/* Step 4: Schedule */}
        {step === 'schedule' && (
          <div className="space-y-6">
            <GlassCard elevation="medium">
              <div className="flex items-center justify-between mb-4">
                <h4 className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Cronograma e Agenda
                </h4>
                <GlassButton variant="ghost" size="sm" onClick={addScheduleItem}>
                  <Plus className="h-4 w-4" />
                  Adicionar Item
                </GlassButton>
              </div>

              <div className="space-y-3">
                {schedule.map((item, index) => (
                  <div key={index} className="glass-subtle rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <GlassInput
                            type="date"
                            placeholder="Data"
                            value={item.date}
                            onChange={(e) => updateScheduleItem(index, 'date', e.target.value)}
                          />
                          <GlassInput
                            type="time"
                            placeholder="Horário"
                            value={item.time}
                            onChange={(e) => updateScheduleItem(index, 'time', e.target.value)}
                          />
                        </div>
                        <GlassInput
                          placeholder="Título da atividade"
                          value={item.title}
                          onChange={(e) => updateScheduleItem(index, 'title', e.target.value)}
                        />
                        <GlassInput
                          placeholder="Descrição"
                          value={item.description}
                          onChange={(e) => updateScheduleItem(index, 'description', e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => removeScheduleItem(index)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}

                {schedule.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Adicione itens ao cronograma para ajudar participantes a se programarem
                  </p>
                )}
              </div>
            </GlassCard>

            <GlassCard elevation="medium">
              <div className="flex items-center justify-between mb-4">
                <h4 className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Redes Sociais e Divulgação
                </h4>
              </div>

              <div className="space-y-3">
                {['LinkedIn', 'Instagram', 'Facebook', 'Twitter/X', 'Site Oficial'].map((platform) => {
                  const existingIndex = socialLinks.findIndex(l => l.platform === platform);
                  const existing = existingIndex >= 0 ? socialLinks[existingIndex] : null;

                  return (
                    <div key={platform} className="flex items-center gap-3">
                      <div className="w-32">
                        <Badge variant="outline">{platform}</Badge>
                      </div>
                      <div className="flex-1">
                        <GlassInput
                          placeholder={`URL do ${platform}`}
                          value={existing?.url || ''}
                          onChange={(e) => {
                            if (existing) {
                              updateSocialLink(existingIndex, e.target.value);
                            } else if (e.target.value) {
                              addSocialLink(platform);
                              updateSocialLink(socialLinks.length, e.target.value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            <div className="flex justify-between">
              <GlassButton variant="ghost" onClick={() => setStep('rules')}>
                Voltar
              </GlassButton>
              <GlassButton variant="filled" onClick={() => setStep('review')}>
                Próximo: Revisar
              </GlassButton>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 'review' && (
          <div className="space-y-6">
            <GlassCard elevation="high" className="border-2 border-primary/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3>{name}</h3>
                  <p className="text-muted-foreground">{theme}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                  <span className={isPublished ? 'text-green-600' : 'text-muted-foreground'}>
                    {isPublished ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-subtle rounded-lg p-4">
                  <h4 className="mb-3">📅 Datas</h4>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Início: {new Date(startDate).toLocaleDateString('pt-BR')}</p>
                    <p>Término: {new Date(endDate).toLocaleDateString('pt-BR')}</p>
                    <p>Inscrições até: {new Date(registrationDeadline).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="glass-subtle rounded-lg p-4">
                  <h4 className="mb-3">📍 Local</h4>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Tipo: {locationType}</p>
                    <p>{location}</p>
                  </div>
                </div>

                <div className="glass-subtle rounded-lg p-4">
                  <h4 className="mb-3">👥 Participantes</h4>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Máximo: {maxParticipants} pessoas</p>
                    <p>Equipes: {minTeamSize}-{maxTeamSize} membros</p>
                  </div>
                </div>

                <div className="glass-subtle rounded-lg p-4">
                  <h4 className="mb-3">🏆 Prêmios</h4>
                  <div className="space-y-1 text-muted-foreground">
                    {prizes.length > 0 ? (
                      prizes.map((p, i) => (
                        <p key={i}>{p.position}</p>
                      ))
                    ) : (
                      <p>Nenhum prêmio definido</p>
                    )}
                  </div>
                </div>
              </div>

              {categories.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <h4 className="mb-3">Categorias</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Badge key={cat}>{cat}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {schedule.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <h4 className="mb-3">Cronograma ({schedule.length} itens)</h4>
                </div>
              )}

              {restrictions.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <h4 className="mb-3">Restrições ({restrictions.length})</h4>
                </div>
              )}
            </GlassCard>

            {submitError && (
              <div className="glass-subtle rounded-lg border border-red-500/40 p-4 text-sm text-red-500">
                {submitError}
              </div>
            )}

            <div className="flex justify-between items-center gap-3">
              <GlassButton variant="ghost" onClick={() => setStep('schedule')} disabled={submitting}>
                Voltar
              </GlassButton>
              <GlassButton variant="filled" onClick={handleSubmit} disabled={submitting}>
                {submitting
                  ? 'Salvando...'
                  : isPublished
                    ? '🚀 Publicar Evento'
                    : '💾 Salvar Rascunho'}
              </GlassButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
