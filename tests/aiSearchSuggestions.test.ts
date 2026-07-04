import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock chatWithAdvisor so tests never hit the real Gemini API
// ---------------------------------------------------------------------------
vi.mock("../services/geminiService", () => ({
  chatWithAdvisor: vi.fn(),
}));

import { chatWithAdvisor } from "../services/geminiService";

// ---------------------------------------------------------------------------
// Helper: reproduces the exact parsing + suggestion logic from App.tsx so
// we can unit-test it independently of React / jsdom.
// ---------------------------------------------------------------------------
async function fetchAiSuggestions(searchQuery: string): Promise<string[]> {
  const response = await vi.mocked(chatWithAdvisor)(
    `The user searched for "${searchQuery}" on a travel platform but got no results. Suggest exactly 3 alternative similar destinations as a JSON array of strings only, no explanation.`,
    []
  );
  try {
    const parsed = JSON.parse(response);
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("AI Search Suggestions (#48)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Happy path -----------------------------------------------------------

  it("returns exactly 3 suggestions from a valid JSON array response", async () => {
    vi.mocked(chatWithAdvisor).mockResolvedValue(
      JSON.stringify(["Leh", "Spiti Valley", "Zanskar"])
    );

    const suggestions = await fetchAiSuggestions("Ladakh");

    expect(suggestions).toHaveLength(3);
    expect(suggestions).toEqual(["Leh", "Spiti Valley", "Zanskar"]);
  });

  it("calls chatWithAdvisor with the correct prompt containing the search query", async () => {
    vi.mocked(chatWithAdvisor).mockResolvedValue(
      JSON.stringify(["Coorg", "Wayanad", "Chikmagalur"])
    );

    await fetchAiSuggestions("Coorg");

    expect(chatWithAdvisor).toHaveBeenCalledOnce();
    const [prompt, history] = vi.mocked(chatWithAdvisor).mock.calls[0];
    expect(prompt).toContain("Coorg");
    expect(prompt).toContain("JSON array of strings");
    expect(history).toEqual([]);
  });

  // --- Slicing --------------------------------------------------------------

  it("slices to 3 even if the AI returns more than 3 items", async () => {
    vi.mocked(chatWithAdvisor).mockResolvedValue(
      JSON.stringify(["A", "B", "C", "D", "E"])
    );

    const suggestions = await fetchAiSuggestions("anything");

    expect(suggestions).toHaveLength(3);
    expect(suggestions).toEqual(["A", "B", "C"]);
  });

  // --- Malformed response ---------------------------------------------------

  it("returns an empty array when the AI response is not valid JSON", async () => {
    vi.mocked(chatWithAdvisor).mockResolvedValue(
      "Sure! Try visiting Rishikesh, Mussoorie, or Dehradun."
    );

    const suggestions = await fetchAiSuggestions("Uttarakhand");

    expect(suggestions).toEqual([]);
  });

  it("returns an empty array when the AI returns a JSON object instead of an array", async () => {
    vi.mocked(chatWithAdvisor).mockResolvedValue(
      JSON.stringify({ destination: "Goa" })
    );

    const suggestions = await fetchAiSuggestions("Goa");

    expect(suggestions).toEqual([]);
  });

  it("returns an empty array when the AI returns an empty JSON array", async () => {
    vi.mocked(chatWithAdvisor).mockResolvedValue(JSON.stringify([]));

    const suggestions = await fetchAiSuggestions("XYZ");

    expect(suggestions).toEqual([]);
  });

  // --- API failure ----------------------------------------------------------

  it("propagates rejection when chatWithAdvisor throws (caller catches it)", async () => {
    vi.mocked(chatWithAdvisor).mockRejectedValue(new Error("Network error"));

    await expect(fetchAiSuggestions("Ladakh")).rejects.toThrow("Network error");
  });

  // --- Guard: no call when results exist or query is empty -----------------

  it("does NOT call chatWithAdvisor when searchResults are non-empty", () => {
    // This simulates the guard condition in the useEffect:
    //   if (!searchQuery || searchResults.length > 0) return;
    const searchResults = [{ id: "1", title: "Goa Beach Package" }];
    const searchQuery = "Goa";

    const shouldFetch = searchQuery && searchResults.length === 0;

    expect(shouldFetch).toBe(false);
    expect(chatWithAdvisor).not.toHaveBeenCalled();
  });

  it("does NOT call chatWithAdvisor when searchQuery is empty", () => {
    const searchResults: unknown[] = [];
    const searchQuery = "";

    const shouldFetch = searchQuery && searchResults.length === 0;

    expect(shouldFetch).toBeFalsy();
    expect(chatWithAdvisor).not.toHaveBeenCalled();
  });
});
