import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function hasImageContent(messages: any[]): boolean {
  const last = messages[messages.length - 1];
  if (!last || !Array.isArray(last.content)) return false;
  return last.content.some((p: any) => p.type === "image_url");
}

function isImageEditRequest(messages: any[]): boolean {
  if (!hasImageContent(messages)) return false;
  const last = messages[messages.length - 1];
  const textParts = Array.isArray(last.content)
    ? last.content.filter((p: any) => p.type === "text").map((p: any) => p.text).join(" ")
    : String(last.content);
  const editKeywords = [
    "edit", "change", "remove", "replace", "enhance", "adjust", "transform",
    "style", "cartoon", "cinematic", "painting", "upscale", "crop", "resize",
    "rotate", "brightness", "contrast", "sharpen", "blur", "filter", "background",
    "color", "face", "retouch", "fix", "improve", "make it", "turn it", "convert",
    "add", "put", "swap", "modify", "artistic", "vintage", "retro", "hdr",
    "black and white", "b&w", "sepia", "saturate", "desaturate", "lighten", "darken",
    "generate", "create", "draw", "design", "render"
  ];
  const lower = textParts.toLowerCase();
  return editKeywords.some((kw) => lower.includes(kw));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const useImageModel = isImageEditRequest(messages);

    if (useImageModel) {
      // Use gemini-2.5-flash-image for image editing (non-streaming)
      const lastMsg = messages[messages.length - 1];
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "system",
              content: `You are an advanced AI photo editing assistant. Apply the user's requested edits to the provided image. Maintain high quality, realistic lighting, colors, and proportions. If instructions are unclear, describe what you see and ask for clarification.`,
            },
            { role: "user", content: lastMsg.content },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        const t = await response.text();
        console.error("Image model error:", response.status, t);
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
        return new Response(JSON.stringify({ error: "Image editing failed, please try again." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      // Return the full response including images array
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Standard text/multimodal chat with streaming
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
            content: `You are LinguaConnect AI – a memory-aware personal assistant and document analyst.

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

DOCUMENT ANALYSIS:
10. When a document is shared, provide: Document Overview → Key Points/Summary → Data/Table Explanation → Detailed Answer → Insights/Suggestions.
11. For spreadsheet data (CSV, XLS): analyze rows, columns, values and perform calculations if needed.
12. For text documents (PDF, DOC, TXT): summarize key information and answer questions about the content.
13. If information is unclear, ask the user for clarification.

CAPABILITIES:
14. When images are shared: Describe what you see, read any text (OCR), and answer questions about it.
15. Real-Time News: Provide the most recent available update with background and impact. If unavailable, say so clearly. Never fabricate.
16. For political or conflict topics: Stay neutral, factual, with historical background.
17. Always reply in the user's language.

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
