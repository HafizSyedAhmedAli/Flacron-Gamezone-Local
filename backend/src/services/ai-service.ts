import { generateText as sdkGenerateText } from "ai";
import { prisma } from "../lib/prisma.js";
import { cacheGet, cacheSet, redis } from "../lib/redis.js";
import { openai } from "@ai-sdk/openai";

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "openai/gpt-4o-mini";
const AI_CACHE_TTL = 60 * 60 * 24; // 24 hours

interface MatchContext {
  homeTeam: { name: string; logo: string | null };
  awayTeam: { name: string; logo: string | null };
  league: { name: string; country: string | null } | null;
  kickoffTime: Date;
  venue: string | null;
  status: string;
  score: string | null;
}

type GenerateTextOptions = {
  model?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
};

/**
 * generateText: wrapper that calls the Vercel AI SDK (package `ai`).
 * Accepts either a string (prompt) or an options object.
 */
export async function generateText(
  input: string | GenerateTextOptions,
): Promise<string> {
  const opts: GenerateTextOptions =
    typeof input === "string"
      ? { prompt: input, model: DEFAULT_MODEL }
      : { model: DEFAULT_MODEL, temperature: 0.7, maxTokens: 500, ...input };

  const model = opts.model || DEFAULT_MODEL;
  const temperature = opts.temperature ?? 0.7;
  const maxTokens = opts.maxTokens ?? 500;
  const prompt = opts.prompt;

  try {
    // Call the AI SDK's generateText function.
    // The SDK is provider-agnostic; configure provider via environment (e.g. AI_GATEWAY_API_KEY)
    const res = await sdkGenerateText({
      model: openai(DEFAULT_MODEL),
      prompt,
      temperature,
      maxTokens,
    } as any);

    // Most SDK releases return an object containing `text`.
    // Be defensive in parsing in case of different shapes.
    if (res == null) throw new Error("No response from AI SDK");

    if (typeof res === "string") return res;

    if (typeof (res as any).text === "string")
      return (res as any).text.trim() || "No text returned from AI.";

    // Some responses return a `content` or `output` shape.
    if (Array.isArray((res as any).output) && (res as any).output[0]?.text) {
      return (res as any).output
        .map((o: any) => o.text)
        .join("")
        .trim();
    }

    if (Array.isArray((res as any).content)) {
      const parts: string[] = [];
      for (const c of (res as any).content) {
        if (c?.type === "output_text" && typeof c?.text === "string")
          parts.push(c.text);
      }
      if (parts.length) return parts.join("").trim();
    }

    return JSON.stringify(res).slice(0, 1000);
  } catch (err: any) {
    throw new Error(`AI SDK error: ${err?.message ?? String(err)}`);
  }
}

/**
 * Generate AI match preview before the game
 */
export async function generateMatchPreview(
  matchId: string,
  language: "en" | "fr" = "en",
): Promise<string> {
  // Check cache first
  const cacheKey = `ai:preview:${matchId}:${language}`;
  const cached = await cacheGet<string>(cacheKey);
  if (cached) return cached;

  // Fetch match details
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true, league: true },
  });

  if (!match) throw new Error("Match not found");

  const context: MatchContext = {
    homeTeam: { name: match.homeTeam.name, logo: match.homeTeam.logo },
    awayTeam: { name: match.awayTeam.name, logo: match.awayTeam.logo },
    league: match.league
      ? { name: match.league.name, country: match.league.country }
      : null,
    kickoffTime: match.kickoffTime,
    venue: match.venue,
    status: match.status,
    score: match.score,
  };

  const prompt = buildPreviewPrompt(context, language);

  // Generate preview using the AI SDK helper
  const text = await generateText({
    model: DEFAULT_MODEL,
    prompt,
    temperature: 0.7,
    maxTokens: 500,
  });

  // Save to database
  await prisma.aISummary.create({
    data: {
      matchId,
      provider: "ai-sdk",
      language,
      kind: "preview",
      content: text,
    },
  });

  // Cache the result
  await cacheSet(cacheKey, text, AI_CACHE_TTL);

  return text;
}

/**
 * Generate AI match summary after the game
 */
export async function generateMatchSummary(
  matchId: string,
  language: "en" | "fr" = "en",
): Promise<string> {
  // Check cache first
  const cacheKey = `ai:summary:${matchId}:${language}`;
  const cached = await cacheGet<string>(cacheKey);
  if (cached) return cached;

  // Fetch match details
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true, league: true },
  });

  if (!match) throw new Error("Match not found");
  if (match.status !== "FINISHED")
    throw new Error("Cannot generate summary for unfinished match");

  const context: MatchContext = {
    homeTeam: { name: match.homeTeam.name, logo: match.homeTeam.logo },
    awayTeam: { name: match.awayTeam.name, logo: match.awayTeam.logo },
    league: match.league
      ? { name: match.league.name, country: match.league.country }
      : null,
    kickoffTime: match.kickoffTime,
    venue: match.venue,
    status: match.status,
    score: match.score,
  };

  const prompt = buildSummaryPrompt(context, language);

  // Generate summary using the AI SDK helper
  const text = await generateText({
    model: DEFAULT_MODEL,
    prompt,
    temperature: 0.7,
    maxTokens: 600,
  });

  // Save to database
  await prisma.aISummary.create({
    data: {
      matchId,
      provider: "ai-sdk",
      language,
      kind: "summary",
      content: text,
    },
  });

  // Cache the result
  await cacheSet(cacheKey, text, AI_CACHE_TTL);

  return text;
}

function buildPreviewPrompt(
  context: MatchContext,
  language: "en" | "fr",
): string {
  const leagueInfo = context.league
    ? `${context.league.name}${context.league.country ? ` (${context.league.country})` : ""}`
    : "Unknown League";

  const kickoffDate = context.kickoffTime.toLocaleString(
    language === "fr" ? "fr-FR" : "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  if (language === "fr") {
    return `Génère un aperçu de match de football passionnant et informatif pour le match suivant :

Match : ${context.homeTeam.name} vs ${context.awayTeam.name}
Compétition : ${leagueInfo}
Date : ${kickoffDate}
${context.venue ? `Stade : ${context.venue}` : ""}

Rédige un aperçu engageant de 3-4 paragraphes qui :
1. Présente les deux équipes et leur contexte
2. Discute des forces et faiblesses potentielles
3. Mentionne les enjeux du match
4. Donne un pronostic équilibré

Ton : Professionnel mais accessible, comme un journaliste sportif expérimenté.
Longueur : 300-400 mots.`;
  }

  return `Generate an exciting and informative football match preview for the following match:

Match: ${context.homeTeam.name} vs ${context.awayTeam.name}
Competition: ${leagueInfo}
Date: ${kickoffDate}
${context.venue ? `Venue: ${context.venue}` : ""}

Write an engaging 3-4 paragraph preview that:
1. Introduces both teams and their context
2. Discusses potential strengths and weaknesses
3. Mentions what's at stake in the match
4. Provides a balanced prediction

Tone: Professional but accessible, like an experienced sports journalist.
Length: 300-400 words.`;
}

function buildSummaryPrompt(
  context: MatchContext,
  language: "en" | "fr",
): string {
  const leagueInfo = context.league
    ? `${context.league.name}${context.league.country ? ` (${context.league.country})` : ""}`
    : "Unknown League";

  const kickoffDate = context.kickoffTime.toLocaleString(
    language === "fr" ? "fr-FR" : "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  if (language === "fr") {
    return `Génère un résumé de match de football captivant pour le match suivant :

Match : ${context.homeTeam.name} ${context.score || "vs"} ${context.awayTeam.name}
Compétition : ${leagueInfo}
Date : ${kickoffDate}
${context.venue ? `Stade : ${context.venue}` : ""}

Rédige un résumé engageant de 3-4 paragraphes qui :
1. Décrit le déroulement du match et le score final
2. Met en évidence les moments clés et les performances individuelles
3. Analyse l'impact du résultat sur les deux équipes
4. Offre une perspective sur ce que cela signifie pour la suite

Ton : Informatif et enthousiaste, comme un commentateur sportif professionnel.
Longueur : 350-450 mots.`;
  }

  return `Generate a compelling football match summary for the following match:

Match: ${context.homeTeam.name} ${context.score || "vs"} ${context.awayTeam.name}
Competition: ${leagueInfo}
Date: ${kickoffDate}
${context.venue ? `Venue: ${context.venue}` : ""}

Write an engaging 3-4 paragraph summary that:
1. Describes how the match unfolded and the final score
2. Highlights key moments and individual performances
3. Analyzes the impact of the result on both teams
4. Provides perspective on what this means going forward

Tone: Informative and enthusiastic, like a professional sports commentator.
Length: 350-450 words.`;
}

/**
 * Get existing AI content for a match
 */
export async function getMatchAIContent(
  matchId: string,
  language: string = "en",
) {
  const aiTexts = await prisma.aISummary.findMany({
    where: { matchId, language },
    orderBy: { createdAt: "desc" },
  });

  return {
    preview: aiTexts.find((t) => t.kind === "preview")?.content || null,
    summary: aiTexts.find((t) => t.kind === "summary")?.content || null,
  };
}

/**
 * Delete AI content cache
 */
export async function clearAICache(matchId: string) {
  const languages = ["en", "fr"];
  const kinds = ["preview", "summary"];

  for (const lang of languages) {
    for (const kind of kinds) {
      const cacheKey = `ai:${kind}:${matchId}:${lang}`;
      await redis.del(cacheKey);
    }
  }
}
