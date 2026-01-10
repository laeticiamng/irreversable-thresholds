import { InvisibleThreshold, THRESH_TYPE_LABELS } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, Eye } from 'lucide-react';

interface ThresholdsTimelineProps {
  pendingThresholds: InvisibleThreshold[];
  sensedThresholds: InvisibleThreshold[];
}

export function ThresholdsTimeline({ pendingThresholds, sensedThresholds }: ThresholdsTimelineProps) {
  // Combine and sort all thresholds by date
  const allEvents = [
    ...pendingThresholds.map(t => ({
      ...t,
      eventDate: new Date(t.created_at),
      eventType: 'created' as const,
    })),
    ...sensedThresholds.map(t => ({
      ...t,
      eventDate: new Date(t.sensed_at!),
      eventType: 'sensed' as const,
    })),
  ].sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());

  if (allEvents.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-amber-500/20">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-amber-500/20 flex items-center justify-center">
          <Clock className="w-6 h-6 text-amber-500/40" />
        </div>
        <p className="text-muted-foreground font-body">
          Aucun événement dans la timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-amber-500/20" />

      <div className="space-y-6">
        {allEvents.map((event, index) => (
          <div key={`${event.id}-${event.eventType}`} className="relative pl-16">
            {/* Timeline dot */}
            <div 
              className={`absolute left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${event.eventType === 'sensed' 
                  ? 'bg-green-500/20 border-green-500' 
                  : 'bg-amber-500/20 border-amber-500'
                }
              `}
            >
              {event.eventType === 'sensed' ? (
                <Eye className="w-2.5 h-2.5 text-green-500" />
              ) : (
                <Clock className="w-2.5 h-2.5 text-amber-500" />
              )}
            </div>

            {/* Content */}
            <div 
              className={`p-4 border bg-card/30 transition-all
                ${event.eventType === 'sensed' 
                  ? 'border-green-500/20' 
                  : 'border-amber-500/20'
                }
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-display tracking-wider ${
                  event.eventType === 'sensed' ? 'text-green-500' : 'text-amber-500'
                }`}>
                  {event.eventType === 'sensed' ? 'RESSENTI' : 'CRÉÉ'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(event.eventDate, 'PPP à HH:mm', { locale: fr })}
                </span>
              </div>
              <h4 className="font-display text-foreground mb-1">{event.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
              <div className="mt-2">
                <span className="text-xs text-amber-500/60">
                  {THRESH_TYPE_LABELS[event.thresh_type]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
