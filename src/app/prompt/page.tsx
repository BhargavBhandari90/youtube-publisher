"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { IconSparkles, IconReload, IconBrandYoutubeFilled, IconUpload, IconCloudUp } from '@tabler/icons-react';

export default function PromptPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [youtubeCategories, setYoutubeCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  const dropRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/youtube-categories");
        const data = await res.json();
        if (res.ok) {
          setYoutubeCategories(data);
        } else {
          console.error("Failed to fetch YouTube categories:", data.error);
        }
      } catch (err) {
        console.error("Network error fetching YouTube categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleFile = (file: File) => {
    if (file && ( file.type === "video/mp4" || file.type === "video/quicktime" )) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoFile(null);
      setVideoPreview(null);
      alert("Please select a valid .mp4 video file.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    setGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data);
        const matchedCategory = youtubeCategories.find(
          (cat) => cat.snippet.title.toLowerCase() === data.category.toLowerCase()
        );
        setSelectedCategoryId(matchedCategory?.id || "");
      } else {
        setError(data.error || "Failed to generate AI response.");
      }
    } catch (err) {
      setError("Network error or AI generation failed.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !response || !response.title || !selectedCategoryId) {
      alert("Please fill all required fields before uploading.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("title", response.title);
    formData.append("description", response.description);
    formData.append("tags", JSON.stringify(response.tags));
    formData.append("category", selectedCategoryId);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload-youtube", true);

      // xhr.upload.onprogress = (event) => {
      //   if (event.lengthComputable) {
      //     setUploadProgress((event.loaded / event.total) * 100);
      //   }
      // };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status === 200) {
          alert("Video uploaded successfully!");
          resetForm();
        } else {
          const errorData = JSON.parse(xhr.responseText);
          setError(errorData.error || "Failed to upload video.");
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        setError("Network error during upload.");
      };

      xhr.send(formData);
    } catch (err) {
      setUploading(false);
      setError("Unexpected error during upload.");
      console.error(err);
    }
  };

  const resetForm = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setPrompt("");
    setResponse(null);
    setSelectedCategoryId("");
  };

  return (
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          AI Metadata Generator & YouTube Uploader
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-6 rounded-xl shadow-lg">
          {/* Drag & Drop uploader */}
          <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-md p-6 text-center transition ${
              isDragActive ? "border-blue-500 bg-gray-800" : "border-gray-600"
            }`}
          >
            <p className="mb-2 font-semibold text-lg">
              Drag & drop your .mp4 video here
            </p>
            <p className="text-sm text-gray-400 mb-4">or click to select file</p>
            <input
              type="file"
              accept="video/mp4,video/quicktime"
              onChange={handleFileChange}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
            >
              <IconUpload stroke={2} size={40} />
            </label>
          </div>

          {videoPreview && (
            <div className="flex justify-center items-center mt-4">
              <video src={videoPreview} controls className="w-full max-w-md rounded-md border mt-4" />
            </div>
          )}

          <textarea
            value={prompt}
            name="prompt"
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter the description of your video..."
            rows={5}
            className="w-full p-4 rounded-md border border-gray-700 bg-gray-800 text-white"
          />

          <Button
            type="submit"
            disabled={uploading || prompt.trim() === ""}
            size={"icon"}
            className="yt-publisher-btn w-full py-3 text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            { generating ? (
              <>
              <IconReload size={40} stroke={2} className="animate-spin" /> Generating Metadata...
              </>
            ) : (
              <>
                <IconSparkles size={40} stroke={1} /> Generate Metadata
              </>
            )}
          </Button>
        </form>

        {response ? (
          <div className="space-y-4 bg-gray-900 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold">Generated Metadata</h2>
            <pre className="whitespace-pre-wrap bg-gray-800 p-4 rounded-md overflow-x-auto">
              {JSON.stringify(response, null, 2)}
            </pre>

            <div>
              <label htmlFor="youtube-category" className="font-semibold">
                YouTube Category:
              </label>
              <select
                id="youtube-category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="block w-full mt-2 p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
              >
                <option value="">Select a category</option>
                {youtubeCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.snippet.title}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleUpload}
              size={"icon"}
              disabled={uploading || !videoFile || !selectedCategoryId}
              className="yt-publisher-btn inline-flex items-center justify-center w-full py-3 text-lg font-semibold bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              {uploading ? (
                <>
                Uploading... <IconReload stroke={2} className="animate-spin"/>
                </>
               ) : (
                <>
                  Upload to YouTube <IconCloudUp stroke={2} />
                </>
               )
              }
            </Button>
          </div>
        ):(
          <div className="flex-col bg-gray-900 p-6 rounded-xl shadow-lg h-[300px] flex items-center justify-center text-gray-400 text-lg">
            <p>Metadata will be displayed here</p>
            <IconBrandYoutubeFilled size={48} />
          </div>
        )}

        {error && <p className="text-red-500 font-medium text-center">Error: {error}</p>}
      </div>
  );
}
