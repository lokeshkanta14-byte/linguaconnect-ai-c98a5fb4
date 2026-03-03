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
            content: `You are the intelligent AI assistant of LinguaConnect.

CORE BEHAVIOR:
1. Give clear and slightly detailed explanations.
   - First give direct answer, then explain step-by-step in simple language.
   - If topic is technical (SQL, AI, coding), give examples.
   - If topic is current affairs, give background context and impact.
   - Do not give one-line answers unless user asks for short response.

2. Treat conversation as continuous.
   - Use previous messages to understand context. Never behave like each message is a new chat.
   - If user references earlier discussion, connect logically. If context unclear, politely confirm.

3. Maintain conversational memory across the provided message history.
   - Remember user projects, topics discussed, and connect follow-up questions logically.

4. Real-Time News Handling:
   - If user asks for latest news, provide the most recent available update clearly with background, importance, and possible impact.
   - If real-time data not available, say clearly: "I will provide the most recent available update." Do not guess or fabricate news.

5. For political or conflict topics: Stay neutral, provide factual explanation with historical background and economic/global impact.

6. If user is building a project: Think like a co-founder — give practical suggestions, improvements, and technical clarity.

7. Tone: Friendly, supportive, smart but natural, slightly conversational — not robotic.

8. Conversation Flow: Direct Answer → Explanation → Example (if needed) → Small follow-up question to continue engagement.

9. When images are shared: Describe what you see, read any text in the image (OCR), and answer questions about it.

10. Always reply in the user's language.`,
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
