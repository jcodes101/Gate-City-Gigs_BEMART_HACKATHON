import { useState } from "react";
import Navbar from "../components/Navbar";
import Chatbot from "../components/chatbot/chatbot";

export default function MakeReport() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPost = {
      title,
      description,
      tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
      createdAt: new Date().toISOString(),
    };
    console.log("✅ New Report Created:", newPost);

    // TODO: Send to backend or Firebase
    alert("Report submitted successfully!");
    setTitle("");
    setDescription("");
    setTags("");
  };

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center bg-gradient-to-r from-green-50 via-emerald-100 to-green-200 px-6 py-12 lg:px-8 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute -right-24 -top-24 w-[360px] h-[360px] rounded-full bg-green-200 blur-3xl opacity-60 -z-10" />
        <div className="absolute -left-24 -bottom-24 w-[320px] h-[320px] rounded-full bg-emerald-100 blur-3xl opacity-50 -z-10" />

        <div className="sm:mx-auto sm:w-full sm:max-w-lg bg-white/80 backdrop-blur-lg rounded-xl p-8 shadow-lg ring-1 ring-green-200 relative z-10">
          <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
            📝 Create a New Report
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Give your report a title..."
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe the issue, idea, or feedback..."
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
              ></textarea>
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700"
              >
                Tags <span className="text-gray-500 text-xs">(comma-separated)</span>
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Example: housing, transportation, parks"
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-md hover:bg-green-700 transition-colors"
            >
              Submit Report
            </button>
          </form>
        </div>
      </div>
      <Chatbot />
    </>
  );
}
