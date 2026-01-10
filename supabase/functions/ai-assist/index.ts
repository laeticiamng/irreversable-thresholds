import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AI action types and their system prompts
const AI_ACTIONS: Record<string, { systemPrompt: string; isPro: boolean }> = {
  // IRREVERSA actions
  irreversa_structure_draft: {
    systemPrompt: `Tu es un assistant de clarification pour IRREVERSA, un outil de réflexion sur les seuils irréversibles.
Ta mission : aider l'utilisateur à structurer ses pensées brouillon en propositions claires.
RÈGLES IMPÉRATIVES :
- Tu PROPOSES, l'utilisateur DÉCIDE. Jamais d'injonctions.
- Pas de jugement moral, pas de conseils.
- Formulations neutres et descriptives uniquement.
- Retourne un JSON strict selon le schema demandé.`,
    isPro: false,
  },
  irreversa_missing_fields: {
    systemPrompt: `Tu es un assistant de clarification pour IRREVERSA.
Ta mission : identifier ce qui manque dans la description d'un seuil pour le rendre plus clair.
RÈGLES IMPÉRATIVES :
- Tu PROPOSES des questions de clarification, jamais d'injonctions.
- Pas de jugement sur le contenu.
- Formulations neutres.
- Retourne un JSON strict selon le schema demandé.`,
    isPro: false,
  },
  irreversa_report_outline: {
    systemPrompt: `Tu es un assistant de clarification pour IRREVERSA.
Ta mission : proposer un plan de rapport structuré basé sur les seuils du dossier.
RÈGLES IMPÉRATIVES :
- Tu PROPOSES une structure, l'utilisateur DÉCIDE.
- Pas de jugement moral.
- Formulations neutres.
- Retourne un JSON strict selon le schema demandé.`,
    isPro: true,
  },
  // NULLA actions
  nulla_absence_to_effect: {
    systemPrompt: `Tu es un assistant de clarification pour NULLA, un outil de réflexion sur les absences structurantes.
Ta mission : aider l'utilisateur à transformer un texte brut en une absence structurée avec ses effets.
RÈGLES IMPÉRATIVES :
- Tu PROPOSES, l'utilisateur DÉCIDE. Jamais d'injonctions.
- Pas de jugement moral.
- Formulations neutres.
- Retourne un JSON strict selon le schema demandé.`,
    isPro: false,
  },
  nulla_detect_duplicates: {
    systemPrompt: `Tu es un assistant de clarification pour NULLA.
Ta mission : identifier les absences potentiellement similaires ou redondantes.
RÈGLES IMPÉRATIVES :
- Tu PROPOSES des fusions, l'utilisateur DÉCIDE.
- Pas de suppression automatique.
- Formulations neutres.
- Retourne un JSON strict selon le schema demandé.`,
    isPro: true,
  },
  // THRESH actions
  thresh_suggest_tags: {
    systemPrompt: `Tu es un assistant de clarification pour THRESH, un outil de capture des seuils ressentis.
Ta mission : proposer des tags et une reformulation pour une capture rapide.
RÈGLES IMPÉRATIVES :
- Tu PROPOSES, l'utilisateur DÉCIDE. Jamais d'injonctions.
- Pas de jugement sur les émotions.
- Formulations neutres.
- Retourne un JSON strict selon le schema demandé.`,
    isPro: false,
  },
  thresh_period_summary: {
    systemPrompt: `Tu es un assistant de clarification pour THRESH.
Ta mission : proposer une synthèse d'une période basée sur les captures.
RÈGLES IMPÉRATIVES :
- Tu SYNTHÉTISES sans juger.
- Questions neutres uniquement.
- Pas de recommandations.
- Retourne un JSON strict selon le schema demandé.`,
    isPro: true,
  },
};

// JSON schemas for structured outputs
const ACTION_SCHEMAS: Record<string, object> = {
  irreversa_structure_draft: {
    type: "object",
    properties: {
      proposals: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            category: { type: "string", enum: ["Personnel", "Travail", "Finance", "Relation", "Organisation", "Autre"] },
            non_reversible_statement: { type: "string" },
            after_effects: { type: "string" },
            implications: { type: "array", items: { type: "string" } }
          },
          required: ["title", "category", "non_reversible_statement", "after_effects", "implications"],
          additionalProperties: false
        }
      }
    },
    required: ["proposals"],
    additionalProperties: false
  },
  irreversa_missing_fields: {
    type: "object",
    properties: {
      missing: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: { type: "string" },
            why: { type: "string" }
          },
          required: ["field", "why"],
          additionalProperties: false
        }
      },
      clarifying_questions: { type: "array", items: { type: "string" } }
    },
    required: ["missing", "clarifying_questions"],
    additionalProperties: false
  },
  irreversa_report_outline: {
    type: "object",
    properties: {
      report_outline: {
        type: "array",
        items: {
          type: "object",
          properties: {
            section: { type: "string" },
            bullets: { type: "array", items: { type: "string" } }
          },
          required: ["section", "bullets"],
          additionalProperties: false
        }
      },
      notes: { type: "string" }
    },
    required: ["report_outline", "notes"],
    additionalProperties: false
  },
  nulla_absence_to_effect: {
    type: "object",
    properties: {
      proposals: {
        type: "array",
        items: {
          type: "object",
          properties: {
            absence_title: { type: "string" },
            category: { type: "string", enum: ["Ressource", "Preuve/Document", "Accès", "Compétence", "Protection", "Information", "Soutien", "Stabilité", "Autre"] },
            effect: { type: "string" },
            impact_level: { type: "string", enum: ["Faible", "Modéré", "Élevé"] }
          },
          required: ["absence_title", "category", "effect", "impact_level"],
          additionalProperties: false
        }
      }
    },
    required: ["proposals"],
    additionalProperties: false
  },
  nulla_detect_duplicates: {
    type: "object",
    properties: {
      merge_suggestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            group: { type: "array", items: { type: "string" } },
            reason: { type: "string" },
            merged_absence_title: { type: "string" },
            merged_effect: { type: "string" },
            category: { type: "string" },
            impact_level: { type: "string", enum: ["Faible", "Modéré", "Élevé"] }
          },
          required: ["group", "reason", "merged_absence_title", "merged_effect", "category", "impact_level"],
          additionalProperties: false
        }
      }
    },
    required: ["merge_suggestions"],
    additionalProperties: false
  },
  thresh_suggest_tags: {
    type: "object",
    properties: {
      suggested_rewrite: { type: "string" },
      suggested_tags: { type: "array", items: { type: "string" } },
      suggested_intensity: { type: "number", minimum: 1, maximum: 5 }
    },
    required: ["suggested_rewrite", "suggested_tags", "suggested_intensity"],
    additionalProperties: false
  },
  thresh_period_summary: {
    type: "object",
    properties: {
      summary_title: { type: "string" },
      top_tags: {
        type: "array",
        items: {
          type: "object",
          properties: {
            tag: { type: "string" },
            count: { type: "number" }
          },
          required: ["tag", "count"],
          additionalProperties: false
        }
      },
      intensity_trend: { type: "string", enum: ["Stable", "Hausse", "Baisse", "Variable"] },
      highlights: { type: "array", items: { type: "string" } },
      neutral_next_questions: { type: "array", items: { type: "string" } }
    },
    required: ["summary_title", "top_tags", "intensity_trend", "highlights", "neutral_next_questions"],
    additionalProperties: false
  }
};

// Free plan limits
const FREE_AI_ACTIONS_PER_MONTH = 5;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non authentifié' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Token invalide' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { module, action, case_context, user_input, case_id, workspace_id } = await req.json();

    // Validate action exists
    if (!AI_ACTIONS[action]) {
      return new Response(JSON.stringify({ error: 'Action IA inconnue' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const actionConfig = AI_ACTIONS[action];

    // Check user subscription and usage limits
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const isPro = subscription?.plan === 'pro';

    // Check if action requires Pro
    if (actionConfig.isPro && !isPro) {
      return new Response(JSON.stringify({ 
        error: 'Cette action nécessite un abonnement Pro',
        requiresPro: true 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check free tier limits
    if (!isPro) {
      const resetDate = subscription?.ai_actions_reset_at 
        ? new Date(subscription.ai_actions_reset_at)
        : new Date();
      const now = new Date();
      
      // Reset counter if month has changed
      if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
        await supabase
          .from('user_subscriptions')
          .update({ ai_actions_used: 0, ai_actions_reset_at: now.toISOString() })
          .eq('user_id', user.id);
      } else if ((subscription?.ai_actions_used || 0) >= FREE_AI_ACTIONS_PER_MONTH) {
        return new Response(JSON.stringify({ 
          error: 'Limite mensuelle atteinte (5 actions/mois)',
          actionsUsed: subscription?.ai_actions_used || 0,
          limit: FREE_AI_ACTIONS_PER_MONTH,
          requiresUpgrade: true
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Build the prompt
    const userPrompt = JSON.stringify({
      case_context: case_context || {},
      user_input: user_input || {},
    });

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Service IA non configuré' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: actionConfig.systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: action,
            description: `Generate structured output for ${action}`,
            parameters: ACTION_SCHEMAS[action]
          }
        }],
        tool_choice: { type: 'function', function: { name: action } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Service IA temporairement indisponible, réessayez plus tard' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Crédits IA épuisés' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Erreur du service IA' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    
    // Extract structured output from tool call
    let output = {};
    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        output = JSON.parse(toolCall.function.arguments);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return new Response(JSON.stringify({ error: 'Réponse IA invalide' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the activity
    await supabase.from('ai_activity_log').insert({
      user_id: user.id,
      workspace_id: workspace_id || null,
      case_id: case_id || null,
      module,
      action,
      input_snapshot: { case_context, user_input },
      output_snapshot: output,
    });

    // Increment usage counter for free users
    if (!isPro) {
      await supabase
        .from('user_subscriptions')
        .update({ ai_actions_used: (subscription?.ai_actions_used || 0) + 1 })
        .eq('user_id', user.id);
    }

    // Get updated usage info
    const { data: updatedSub } = await supabase
      .from('user_subscriptions')
      .select('ai_actions_used')
      .eq('user_id', user.id)
      .single();

    return new Response(JSON.stringify({ 
      success: true,
      output,
      usage: {
        actionsUsed: updatedSub?.ai_actions_used || 0,
        limit: isPro ? null : FREE_AI_ACTIONS_PER_MONTH,
        isPro
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI assist error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur interne' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});