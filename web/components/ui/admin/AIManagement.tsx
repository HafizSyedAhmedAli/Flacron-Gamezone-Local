import { apiPost, apiDelete } from "@/components/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface AIManagementProps {
  match: {
    id: string;
    homeTeam: { name: string };
    awayTeam: { name: string };
    status: string;
    score: string | null;
    kickoffTime: string;
  };
  onSuccess?: () => void;
}

export function AIManagement({ match, onSuccess }: AIManagementProps) {
  const [generating, setGenerating] = useState(false);
  const [language, setLanguage] = useState<"en" | "fr">("en");
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const canGeneratePreview =
    match.status === "UPCOMING" || match.status === "LIVE";
  const canGenerateSummary = match.status === "FINISHED";

  const handleGeneratePreview = async (regenerate: boolean = false) => {
    setGenerating(true);
    setResult(null);

    try {
      const response = await apiPost("/api/admin/ai/generate-preview", {
        matchId: match.id,
        language,
        regenerate,
      });

      setResult({
        type: "success",
        message: `Preview ${regenerate ? "regenerated" : "generated"} successfully (${language.toUpperCase()})!`,
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      setResult({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to generate preview",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateSummary = async (regenerate: boolean = false) => {
    setGenerating(true);
    setResult(null);

    try {
      const response = await apiPost("/api/admin/ai/generate-summary", {
        matchId: match.id,
        language,
        regenerate,
      });

      setResult({
        type: "success",
        message: `Summary ${regenerate ? "regenerated" : "generated"} successfully (${language.toUpperCase()})!`,
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      setResult({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to generate summary",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleClearAIContent = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all AI-generated content for this match? This action cannot be undone.",
      )
    ) {
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      await apiDelete(`/api/admin/ai/match/${match.id}`);

      setResult({
        type: "success",
        message: "AI content cleared successfully!",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      setResult({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to clear AI content",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      {/* Match Info */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold">AI Content Generation</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {match.homeTeam.name} vs {match.awayTeam.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge
            variant={
              match.status === "UPCOMING"
                ? "default"
                : match.status === "LIVE"
                  ? "warning"
                  : "success"
            }
          >
            {match.status}
          </Badge>
          {match.score && (
            <span className="text-sm font-medium">{match.score}</span>
          )}
        </div>
      </div>

      {/* Result Message */}
      {result && (
        <div
          className={`flex items-center gap-2 p-3 rounded-md ${
            result.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
          }`}
        >
          {result.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span className="text-sm">{result.message}</span>
        </div>
      )}

      <div className="flex gap-2 items-center mb-2 text-white">
        <span className="text-sm font-medium">Language:</span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as "en" | "fr")}
          className="border rounded px-2 py-1 text-sm bg-slate-900 text-white border-cyan-600 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
        >
          <option value="en">English</option>
          <option value="fr">French</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Preview Generation */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Match Preview</p>
          <div className="flex gap-2">
            <Button
              onClick={() => handleGeneratePreview(false)}
              disabled={!canGeneratePreview || generating}
              className="flex-1"
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              {generating ? "Generating..." : "Generate Preview"}
            </Button>
            <Button
              onClick={() => handleGeneratePreview(true)}
              disabled={!canGeneratePreview || generating}
              variant="outline"
              size="icon"
              title="Regenerate preview"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          {!canGeneratePreview && (
            <p className="text-xs text-muted-foreground">
              Preview can only be generated for upcoming or live matches
            </p>
          )}
        </div>

        {/* Summary Generation */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Match Summary</p>
          <div className="flex gap-2">
            <Button
              onClick={() => handleGenerateSummary(false)}
              disabled={!canGenerateSummary || generating}
              className="flex-1"
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              {generating ? "Generating..." : "Generate Summary"}
            </Button>
            <Button
              onClick={() => handleGenerateSummary(true)}
              disabled={!canGenerateSummary || generating}
              variant="outline"
              size="icon"
              title="Regenerate summary"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          {!canGenerateSummary && (
            <p className="text-xs text-muted-foreground">
              Summary can only be generated for finished matches
            </p>
          )}
        </div>

        {/* Clear AI Content */}
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-medium">Clear AI Content</p>
          <Button
            onClick={handleClearAIContent}
            disabled={generating}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {generating ? "Clearing..." : "Clear All AI Content"}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground border-t pt-3">
        <p>• AI content is generated using GPT-4o-mini</p>
        <p>• Content is cached to reduce API costs</p>
        <p>• Use "Regenerate" to create new content</p>
      </div>
    </div>
  );
}
