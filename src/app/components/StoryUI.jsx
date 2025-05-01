"use client";
import { useState } from "react";
import axios from "axios";

export default function StoryUI() {
  const [prompt, setPrompt] = useState("");
  const [story, setStory] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateStory = async () => {
    setLoading(true);
    setStory("");
    setAudioUrl(null);

    try {
      const res = await axios.post("/api/story", { prompt });
      setStory(res.data.story);
    } catch (err) {
      setStory("Failed to fetch story. Try again.");
    }

    setLoading(false);
  };

  const playAudio = async () => {
    try {
      const res = await axios.post(
        "/api/audio",
        { story: story.slice(0, 2000) },
        { responseType: "blob" }
      );
      const blob = new Blob([res.data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      console.error("Audio error:", err);
    }
  };

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
        disabled={loading || !prompt}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md"
      >
        {loading ? "Generating..." : "Tell me a story"}
      </button>

      {story && (
        <>
          <div className="bg-gray-700 p-4 rounded-md whitespace-pre-line">
            {story}
          </div>

          <div className="pt-4 text-center">
            <button
              onClick={playAudio}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              🔊 Play Story
            </button>

            {audioUrl && (
              <audio controls autoPlay className="mt-4 w-full">
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        </>
      )}
    </div>
  );
}
