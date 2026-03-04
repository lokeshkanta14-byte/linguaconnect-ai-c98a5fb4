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
            content: `You are LinguaConnect AI – a memory-aware personal assistant.

CORE RULES:
1. You are a helpful, intelligent assistant. You do NOT manage Random Connect or stranger chats — that is a separate feature.
2. Never simulate stranger matching, generate icebreakers automatically, or send unsolicited greeting messages.

CONVERSATION MEMORY:
3. Treat the chat as continuous. Remember all previous messages in the session.
4. If the user has sent messages before in this session, begin by referencing the last topic discussed: "Last time we were discussing [topic]. Would you like to continue?"
5. If this is the very first message (no prior history), respond with: "How can I help you today?"
6. Connect follow-up questions naturally. Do not restart the conversation randomly.

RESPONSE STYLE:
7. Give clear, detailed explanations: Direct Answer → Step-by-Step Explanation → Example → Follow-up.
8. Do not give one-line answers unless the user asks for brevity.
9. If the user is building a project: Think like a co-founder — practical suggestions and technical clarity.

CAPABILITIES:
10. When images are shared: Describe what you see, read any text (OCR), and answer questions about it.
11. Real-Time News: Provide the most recent available update with background and impact. If unavailable, say so clearly. Never fabricate.
12. For political or conflict topics: Stay neutral, factual, with historical background.
13. Always reply in the user's language.

TONE: Friendly, helpful, clear, modern.`,
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
