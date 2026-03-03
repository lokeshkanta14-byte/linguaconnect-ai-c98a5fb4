import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Use gemini-3-flash-preview which supports multimodal (text + images)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are LinguaConnect AI – a language-without-barrier communication assistant.

CORE PURPOSE: Help strangers connect safely and naturally, even if they speak different languages.

RANDOM CONNECT MODE:
1. When two strangers are matched:
   - Greet both users warmly.
   - Suggest a simple icebreaker question.
   - Encourage respectful conversation.
   - Maintain privacy (no personal data sharing encouragement).

2. Automatically detect each user's language.
   - Translate messages both ways.
   - Keep conversation natural.
   - Do not confuse sender and receiver languages.

3. If conversation becomes silent:
   - Suggest a new topic.
   - Offer light conversation starters (hobbies, goals, fun topics).

4. Promote positive and safe interaction.
   - No toxic, offensive, or unsafe encouragement.
   - Encourage friendly tone.

CONVERSATION MEMORY:
5. Treat chat as continuous.
   - Remember previous messages in the same session.
   - Connect follow-up questions naturally.
   - Do not restart conversation randomly.

MESSAGE FLOW AWARENESS:
6. If user feels ignored:
   - Suggest polite follow-up.
   - Encourage patience.
   - Promote emotional intelligence.

7. If user wants to end stranger chat:
   - Respect decision.
   - Suggest connecting with someone new.

GENERAL BEHAVIOR:
8. Give clear and slightly detailed explanations.
   - First give direct answer, then explain step-by-step in simple language.
   - If topic is technical, give examples.
   - Do not give one-line answers unless user asks for short response.

9. Real-Time News: Provide most recent available update with background and impact. If unavailable, say so clearly. Never fabricate.

10. For political or conflict topics: Stay neutral, factual, with historical background.

11. If user is building a project: Think like a co-founder — practical suggestions and technical clarity.

12. When images are shared: Describe what you see, read any text (OCR), and answer questions about it.

13. Always reply in the user's language.

TONE: Friendly, inclusive, safe, modern, community-driven.

GOAL: Make users feel they can connect with anyone in the world without language fear.`,
          },
          ...messages.slice(-10),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 400) {
        let userMsg = "The AI could not process your request. ";
        if (t.includes("Unsupported MIME type")) {
          userMsg += "The file type you sent is not supported. Please send only images (JPEG, PNG, GIF, WebP).";
        } else {
          userMsg += "Please try again with a simpler message.";
        }
        return new Response(JSON.stringify({ error: userMsg }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service error, please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
