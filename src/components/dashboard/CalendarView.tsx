import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Threshold, InvisibleThreshold, Absence } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Target, Eye, XCircle, CalendarDays, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CalendarViewProps {
  irreversaThresholds: Threshold[];
  threshThresholds: (InvisibleThreshold & { tags?: string[]; intensity?: number; context?: string })[];
  absences: Absence[];
}

interface DayEvent {
  type: 'crossed' | 'sensed' | 'created_irreversa' | 'created_thresh' | 'created_absence';
  item: Threshold | InvisibleThreshold | Absence;
  date: Date;
}

export function CalendarView({ irreversaThresholds, threshThresholds, absences }: CalendarViewProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Navigate to the event's case
  const handleEventClick = (event: DayEvent) => {
    const item = event.item;
    if ('case_id' in item && item.case_id) {
      if (event.type === 'crossed' || event.type === 'created_irreversa') {
        navigate(`/irreversa/cases/${item.case_id}`);
      } else if (event.type === 'sensed' || event.type === 'created_thresh') {
        navigate(`/thresh/cases/${item.case_id}`);
      } else if (event.type === 'created_absence') {
        navigate(`/nulla/cases/${item.case_id}`);
      }
    }
  };

  // Build events map for all days
  const eventsMap = useMemo(() => {
    const map = new Map<string, DayEvent[]>();

    // IRREVERSA crossed events
    irreversaThresholds
      .filter(t => t.crossed_at)
      .forEach(t => {
        const date = new Date(t.crossed_at!);
        const key = format(date, 'yyyy-MM-dd');
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ type: 'crossed', item: t, date });
      });

    // IRREVERSA created events
    irreversaThresholds.forEach(t => {
      const date = new Date(t.created_at);
      const key = format(date, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ type: 'created_irreversa', item: t, date });
    });

    // THRESH sensed events
    threshThresholds
      .filter(t => t.sensed_at)
      .forEach(t => {
        const date = new Date(t.sensed_at!);
        const key = format(date, 'yyyy-MM-dd');
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ type: 'sensed', item: t, date });
      });

    // THRESH created events
    threshThresholds.forEach(t => {
      const date = new Date(t.created_at);
      const key = format(date, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ type: 'created_thresh', item: t, date });
    });

    // Absences created
    absences.forEach(a => {
      const date = new Date(a.created_at);
      const key = format(date, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ type: 'created_absence', item: a, date });
    });

    return map;
  }, [irreversaThresholds, threshThresholds, absences]);

  // Get events for selected date
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, 'yyyy-MM-dd');
    return eventsMap.get(key) || [];
  }, [selectedDate, eventsMap]);

  // Get days with events for highlighting
  const daysWithCrossed = useMemo(() => {
    return irreversaThresholds
      .filter(t => t.crossed_at)
      .map(t => new Date(t.crossed_at!));
  }, [irreversaThresholds]);

  const daysWithSensed = useMemo(() => {
    return threshThresholds
      .filter(t => t.sensed_at)
      .map(t => new Date(t.sensed_at!));
  }, [threshThresholds]);

  // Custom day content renderer
  const modifiers = {
    crossed: daysWithCrossed,
    sensed: daysWithSensed,
  };

  const modifiersClassNames = {
    crossed: 'bg-primary/20 text-primary font-bold',
    sensed: 'bg-amber-500/20 text-amber-500 font-bold',
  };

  const getEventIcon = (type: DayEvent['type']) => {
    switch (type) {
      case 'crossed':
        return <Target className="w-3 h-3 text-primary" />;
      case 'sensed':
        return <Eye className="w-3 h-3 text-amber-500" />;
      case 'created_irreversa':
        return <Target className="w-3 h-3 text-primary/50" />;
      case 'created_thresh':
        return <Eye className="w-3 h-3 text-amber-500/50" />;
      case 'created_absence':
        return <XCircle className="w-3 h-3 text-nulla" />;
    }
  };

  const getEventLabel = (type: DayEvent['type']) => {
    switch (type) {
      case 'crossed':
        return 'Franchi';
      case 'sensed':
        return 'Ressenti';
      case 'created_irreversa':
        return 'Créé (IRREVERSA)';
      case 'created_thresh':
        return 'Créé (THRESH)';
      case 'created_absence':
        return 'Créé (NULLA)';
    }
  };

  const getEventBadgeColor = (type: DayEvent['type']) => {
    switch (type) {
      case 'crossed':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'sensed':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'created_irreversa':
        return 'bg-primary/10 text-primary/60 border-primary/20';
      case 'created_thresh':
        return 'bg-amber-500/10 text-amber-500/60 border-amber-500/20';
      case 'created_absence':
        return 'bg-nulla/20 text-nulla border-nulla/30';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border/30 bg-card/10 p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <CalendarDays className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm tracking-[0.15em] uppercase text-foreground/80">
          Calendrier des événements
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            locale={fr}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className="border border-border/30"
          />
        </div>

        {/* Day events panel */}
        <div className="border border-border/30 bg-background/50 p-4 min-h-[280px]">
          <h4 className="font-display text-sm text-foreground mb-4">
            {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Sélectionnez une date'}
          </h4>

          {selectedDayEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 italic">
              Aucun événement ce jour.
            </p>
          ) : (
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {selectedDayEvents.map((event, i) => {
                const hasCase = 'case_id' in event.item && event.item.case_id;
                return (
                  <div 
                    key={i}
                    className={`p-3 border border-border/30 bg-card/30 ${hasCase ? 'cursor-pointer hover:bg-card/50 transition-colors' : ''}`}
                    onClick={() => hasCase && handleEventClick(event)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getEventIcon(event.type)}
                      <Badge variant="outline" className={`text-[10px] ${getEventBadgeColor(event.type)}`}>
                        {getEventLabel(event.type)}
                      </Badge>
                      {hasCase && (
                        <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-foreground">{event.item.title}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {format(event.date, 'HH:mm', { locale: fr })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-border/20">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary/20 border border-primary/30" />
          <span className="text-xs text-muted-foreground">Franchi (IRREVERSA)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500/20 border border-amber-500/30" />
          <span className="text-xs text-muted-foreground">Ressenti (THRESH)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-nulla/20 border border-nulla/30" />
          <span className="text-xs text-muted-foreground">Absence (NULLA)</span>
        </div>
      </div>
    </motion.div>
  );
}
