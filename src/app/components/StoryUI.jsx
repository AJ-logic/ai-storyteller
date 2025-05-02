"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function StoryUI() {
  const [prompt, setPrompt] = useState("A cat who wants to fly");
  const [story, setStory] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingStory, setLoadingStory] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef(null);

  // Generate short story
  const generateStory = async () => {
    setLoadingStory(true);
    setStory("");
    setAudioUrl(null);
    setIsPlaying(false);
    try {
      const res = await axios.post("/api/story", {
        prompt,
        max_tokens: 100, // ⬅️ Control story length
      });
      setStory(res.data.story);

      // fetch audio in background
      fetchAudioInBackground(res.data.story);
    } catch (err) {
      setStory("Failed to fetch story.");
    }
    setLoadingStory(false);
  };

  // Fetch audio without playing
  const fetchAudioInBackground = async (text) => {
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
      console.error("TTS Error:", err);
    } finally {
      setLoadingAudio(false);
    }
  };

  // Play/Pause toggle
  const togglePlay = async () => {
    // await fetchAudioInBackground(story);
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioUrl) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        // show temporary loading
        alert("Loading sound...");
      }
    }
  };

  // Reset audio when new story is requested
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, [story]);

  return (
    <div className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full shadow-lg space-y-4">
      <h1 className="text-3xl font-bold text-center">AI Storyteller 📖</h1>

      <textarea
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a prompt like: a cat who wants to fly..."
        className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-purple-500"
      />

      <button
        onClick={generateStory}
        disabled={loadingStory || !prompt}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md"
      >
        {loadingStory ? "Generating story..." : "Tell me a story"}
      </button>

      {story && (
        <div className="relative pt-2">
          {/* Sticky Play/Pause */}
          <div className="sticky top-0 z-10 bg-gray-900 pb-2">
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

          {/* Story box */}
          <div className="bg-gray-700 p-4 rounded-md whitespace-pre-line mt-2">
            {story}
          </div>
        </div>
      )}
    </div>
  );
}
