// "use client";
// import { useState, useRef, useEffect } from "react";
// import axios from "axios";

// export default function StoryUI() {
//   const [prompt, setPrompt] = useState("A cat who wants to fly");
//   const [storyChunks, setStoryChunks] = useState([]); // [{ text, image }]
//   const [choices, setChoices] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [cooldown, setCooldown] = useState(false);
//   const [loadingChoiceIndex, setLoadingChoiceIndex] = useState(null);

//   const fullStory = storyChunks.map((c) => c.text).join(" ");

//   const startCooldown = () => {
//     setCooldown(true);
//     setTimeout(() => setCooldown(false), 20000);
//   };

//   const generateInitialStory = async () => {
//     if (cooldown || loading) return;

//     resetAll();
//     setLoading(true);
//     startCooldown();

//     try {
//       const res = await axios.post("/api/story", { prompt });
//       const firstChunk = res.data.story;
//       const image = await generateImage(firstChunk);

//       setStoryChunks([{ text: firstChunk, image }]);
//       generateChoices(firstChunk);
//     } catch (err) {
//       setStoryChunks([{ text: "Failed to create story.", image: null }]);
//     }

//     setLoading(false);
//   };

//   const continueStory = async (choice, index) => {
//     if (cooldown || loading) return;

//     setLoading(true);
//     setLoadingChoiceIndex(index);
//     startCooldown();
//     setChoices([]);

//     setStoryChunks((prev) => [
//       ...prev,
//       { text: `"${choice}" selected. Generating next part...`, image: null },
//     ]);

//     try {
//       const res = await axios.post("/api/story", {
//         history: fullStory,
//         choice,
//       });
//       const nextChunk = res.data.story;
//       const image = await generateImage(nextChunk);

//       setStoryChunks((prev) => [
//         ...prev.slice(0, -1),
//         { text: nextChunk, image },
//       ]);
//       generateChoices(nextChunk);
//     } catch (err) {
//       setStoryChunks((prev) => [
//         ...prev.slice(0, -1),
//         { text: "Failed to continue story.", image: null },
//       ]);
//     }

//     setLoading(false);
//     setLoadingChoiceIndex(null);
//   };

//   const generateChoices = async (context) => {
//     try {
//       const res = await axios.post("/api/choices", { context });
//       const raw = res.data.choices;
//       const options = raw
//         .split("\n")
//         .map((line) => line.replace(/^[-*\d.]\s*/, "").trim())
//         .filter(Boolean);
//       setChoices(options.slice(0, 3));
//     } catch {
//       setChoices(["Try again", "Pick a random path", "Continue..."]);
//     }
//   };

//   const generateImage = async (promptText) => {
//     try {
//       const res = await axios.post("/api/image", { prompt: promptText });
//       return res.data.image;
//     } catch {
//       return null;
//     }
//   };

//   const resetAll = () => {
//     setStoryChunks([]);
//     setChoices([]);
//   };

//   return (
//     <div className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full shadow-lg space-y-4">
//       <div className="sticky top-0 z-20 bg-gray-800 p-4">
//         <h1 className="text-3xl font-bold text-center text-white">
//           AI Storyteller 📖
//         </h1>

//         <textarea
//           rows={3}
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           placeholder="Enter a prompt like: a cat who wants to fly..."
//           className="w-full p-3 mt-4 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-purple-500 resize-none"
//         />

//         <button
//           onClick={generateInitialStory}
//           disabled={loading || cooldown || !prompt}
//           className={`w-full mt-3 ${
//             loading || cooldown ? "opacity-50 cursor-wait" : ""
//           } bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition mb-2`}
//         >
//           {loading
//             ? "Generating..."
//             : storyChunks.length > 0
//             ? "New Story"
//             : "Tell me a story"}
//         </button>
//         <button
//           disabled
//           className="bg-gray-600 text-white font-semibold px-4 py-2 rounded-md w-full opacity-60 cursor-not-allowed"
//         >
//           🔇 Audio temporarily disabled
//         </button>
//       </div>

//       {storyChunks.length > 0 && (
//         <div className="relative">
//           {storyChunks.map((chunk, i) => (
//             <div key={i} className="text-white mt-6 p-4 rounded-md">
//               {chunk.image && (
//                 <img
//                   src={chunk.image}
//                   alt="story scene"
//                   className="mx-auto w-[400px] h-[200px] rounded-md mb-4 object-cover"
//                 />
//               )}
//               <p className="whitespace-pre-line">{chunk.text}</p>
//             </div>
//           ))}

//           {choices.length > 0 && (
//             <div className="sticky bottom-0 z-20 bg-gray-800 p-4 mt-6">
//               <p className="text-lg font-semibold mb-2 text-white">
//                 What should happen next?
//               </p>
//               <div className="flex flex-col gap-3">
//                 {choices.map((c, i) => (
//                   <button
//                     key={i}
//                     onClick={() => continueStory(c, i)}
//                     disabled={loading}
//                     className={`${
//                       loading && loadingChoiceIndex === i
//                         ? "opacity-50 cursor-wait"
//                         : ""
//                     } bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-all`}
//                   >
//                     {loading && loadingChoiceIndex === i ? "Loading..." : c}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import axios from "axios";

export default function StoryUI() {
  const [prompt, setPrompt] = useState("A cat who wants to fly");
  const [storyChunks, setStoryChunks] = useState([]); // [{ text, image }]
  const [choices, setChoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [loadingChoiceIndex, setLoadingChoiceIndex] = useState(null);

  const fullStory = storyChunks.map((c) => c.text).join(" ");

  const checkCooldown = () => {
    const now = Date.now();
    return now < cooldownUntil;
  };

  const startCooldown = () => {
    setCooldownUntil(Date.now() + 20 * 1000);
  };

  const showCooldownAlert = () => {
    alert("Please wait 20 seconds before generating the next part.");
  };

  const generateImage = async (desc) => {
    try {
      const res = await axios.post("/api/image/gemini.ai", { prompt: desc });
      return res.data.image;
    } catch {
      return null;
    }
  };

  const handleStoryRequest = async (data) => {
    const res = await axios.post("/api/story", data);
    const { story, imagePrompt, choices } = res.data;
    const image = await generateImage(imagePrompt);

    return {
      story,
      image,
      choices,
    };
  };

  const generateInitialStory = async () => {
    if (loading || checkCooldown()) return showCooldownAlert();

    setLoading(true);
    startCooldown();
    resetAll();

    try {
      const result = await handleStoryRequest({ prompt });
      setStoryChunks([{ text: result.story, image: result.image }]);
      setChoices(result.choices);
    } catch {
      setStoryChunks([{ text: "Failed to create story.", image: null }]);
    }

    setLoading(false);
  };

  const continueStory = async (choice, index) => {
    if (loading || checkCooldown()) return showCooldownAlert();

    setLoading(true);
    setLoadingChoiceIndex(index);
    startCooldown();
    setChoices([]);

    setStoryChunks((prev) => [
      ...prev,
      { text: `"${choice}" selected. Generating next part...`, image: null },
    ]);

    try {
      const result = await handleStoryRequest({ history: fullStory, choice });
      setStoryChunks((prev) => [
        ...prev.slice(0, -1),
        { text: result.story, image: result.image },
      ]);
      setChoices(result.choices);
    } catch {
      setStoryChunks((prev) => [
        ...prev.slice(0, -1),
        { text: "Failed to continue story.", image: null },
      ]);
    }

    setLoading(false);
    setLoadingChoiceIndex(null);
  };

  const resetAll = () => {
    setStoryChunks([]);
    setChoices([]);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full shadow-lg space-y-4">
      <div className="sticky top-0 z-20 bg-gray-800 p-4">
        <h1 className="text-3xl font-bold text-center text-white">
          AI Storyteller 📖
        </h1>

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
            : storyChunks.length > 0
            ? "New Story"
            : "Tell me a story"}
        </button>
        <button
          disabled
          className="bg-gray-600 text-white font-semibold px-4 py-2 rounded-md w-full opacity-60 cursor-not-allowed"
        >
          🔇 Audio temporarily disabled
        </button>
      </div>

      {storyChunks.length > 0 && (
        <div className="relative">
          {storyChunks.map((chunk, i) => (
            <div key={i} className="text-white mt-6 p-4 rounded-md">
              {chunk.image && (
                <img
                  src={chunk.image}
                  alt="story scene"
                  className="mx-auto w-[400px] h-[200px] rounded-md mb-4 object-cover"
                />
              )}
              <p className="whitespace-pre-line">{chunk.text}</p>
            </div>
          ))}

          {choices.length > 0 && (
            <div className="sticky bottom-0 z-20 bg-gray-800 p-4 mt-6">
              <p className="text-lg font-semibold mb-2 text-white">
                What should happen next?
              </p>
              <div className="flex flex-col gap-3">
                {choices.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => continueStory(c, i)}
                    disabled={loading}
                    className={`${
                      loading && loadingChoiceIndex === i
                        ? "opacity-50 cursor-wait"
                        : ""
                    } bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-all`}
                  >
                    {loading && loadingChoiceIndex === i ? "Loading..." : c}
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
