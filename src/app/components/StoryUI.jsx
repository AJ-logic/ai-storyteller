"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function StoryUI() {
  const [prompt, setPrompt] = useState("A cat who wants to fly");
  const [chunks, setChunks] = useState([]); // story paragraphs
  const [choices, setChoices] = useState([]); // user options
  const [loading, setLoading] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const fullStory = chunks.join(" ");

  const generateInitialStory = async () => {
    resetAll();
    setLoading(true);
    try {
      const res = await axios.post("/api/story", { prompt });
      const firstChunk = res.data.story;
      setChunks([firstChunk]);
      // fetchAudio(firstChunk);
      generateChoices(firstChunk);
    } catch (err) {
      setChunks(["Failed to create story."]);
    }
    setLoading(false);
  };

  const continueStory = async (choice) => {
    setChoices([]); // hide choices
    setChunks((prev) => [
      ...prev,
      `"${choice}" selected. Generating next part...`,
    ]);
    setLoading(true);

    try {
      const res = await axios.post("/api/story", {
        history: fullStory,
        choice,
      });
      const nextChunk = res.data.story;

      // remove temporary loading message and add real story
      setChunks((prev) => [...prev.slice(0, -1), nextChunk]);
      generateChoices(nextChunk);
    } catch (err) {
      setChunks((prev) => [...prev.slice(0, -1), "Failed to continue story."]);
    }

    setLoading(false);
  };

  const generateChoices = async (context) => {
    try {
      const res = await axios.post("/api/choices", { context });
      const raw = res.data.choices;
      const options = raw
        .split("\n")
        .map((line) => line.replace(/^[-*\d.]\s*/, "").trim())
        .filter(Boolean);
      setChoices(options.slice(0, 3));
    } catch (err) {
      console.error("Choices fetch failed:", err);
      setChoices(["Try again", "Pick a random path", "Continue..."]);
    }
  };

  const fetchAudio = async (text) => {
    setLoadingAudio(true);
    try {
      const res = await axios.post(
        "/api/audio",
        { story: text },
        { responseType: "blob" }
      );
      const blob = new Blob([res.data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      console.error("Audio fetch error:", err);
    }
    setLoadingAudio(false);
  };

  const togglePlay = () => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const resetAll = () => {
    setChunks([]);
    setChoices([]);
    setAudioUrl(null);
    setIsPlaying(false);
    audioRef.current?.pause();
    audioRef.current = null;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full shadow-lg space-y-4">
      <div className="sticky top-0 z-20 bg-gray-800 p-4">
        <h1 className="text-3xl font-bold text-center">AI Storyteller 📖</h1>

        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt like: a cat who wants to fly..."
          className="w-full p-3 mt-4 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-purple-500 resize-none"
        />

        <button
          onClick={generateInitialStory}
          disabled={loading || !prompt}
          className={`w-full mt-3 ${
            loading ? "opacity-50 cursor-wait" : ""
          } bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition mb-2`}
        >
          {loading
            ? "Generating..."
            : chunks.length > 0
            ? "New Story"
            : "Tell me a story"}
        </button>
        <button
          onClick={togglePlay}
          disabled={loadingAudio}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md w-full"
        >
          {loadingAudio
            ? "🔄 Loading sound..."
            : isPlaying
            ? "⏸️ Pause Story"
            : "▶️ Play Story"}
        </button>
      </div>

      {chunks.length > 0 && (
        <div className="relative">
          {chunks.map((para, i) => (
            <p
              key={i}
              className="text-white mt-4 p-4 rounded whitespace-pre-line"
            >
              {para}
            </p>
          ))}

          {choices.length > 0 && (
            <div className="sticky bottom-0 z-20 bg-gray-800 p-4 mt-6">
              <p className="text-lg font-semibold mb-2">
                What should happen next?
              </p>
              <div className="flex flex-col gap-3">
                {choices.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => continueStory(c)}
                    disabled={loading}
                    className={`${
                      loading ? "opacity-50 cursor-wait" : ""
                    } bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-all`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
