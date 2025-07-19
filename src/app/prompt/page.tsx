'use client'

import { useState, useEffect } from "react"

export default function PromptPage() {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [youtubeCategories, setYoutubeCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState("")

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/youtube-categories")
        const data = await res.json()
        if (res.ok) {
          setYoutubeCategories(data)
        } else {
          console.error("Failed to fetch YouTube categories:", data.error)
        }
      } catch (err) {
        console.error("Network error fetching YouTube categories:", err)
      }
    }
    fetchCategories()
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === "video/mp4") {
      setVideoFile(file)
      setVideoPreview(URL.createObjectURL(file))
    } else {
      setVideoFile(null)
      setVideoPreview(null)
      alert("Please select a valid .mp4 video file.")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setResponse(null)

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (res.ok) {
        setResponse(data)
        const matchedCategory = youtubeCategories.find(
          (cat) => cat.snippet.title.toLowerCase() === data.category.toLowerCase()
        )
        setSelectedCategoryId(matchedCategory?.id || "")
      } else {
        setError(data.error || "Failed to generate AI response.")
      }
    } catch (err) {
      setError("Network error or AI generation failed.")
      console.error(err)
    }
  }

  const handleUpload = async () => {
    if (!videoFile || !response || !response.title || !selectedCategoryId) {
      alert("Please fill all required fields before uploading.")
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    const formData = new FormData()
    formData.append("video", videoFile)
    formData.append("title", response.title)
    formData.append("description", response.description)
    formData.append("tags", JSON.stringify(response.tags))
    formData.append("category", selectedCategoryId)

    try {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/upload-youtube", true)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress((event.loaded / event.total) * 100)
        }
      }

      xhr.onload = () => {
        setUploading(false)
        if (xhr.status === 200) {
          alert("Video uploaded successfully!")
          resetForm()
        } else {
          const errorData = JSON.parse(xhr.responseText)
          setError(errorData.error || "Failed to upload video.")
        }
      }

      xhr.onerror = () => {
        setUploading(false)
        setError("Network error during upload.")
      }

      xhr.send(formData)
    } catch (err) {
      setUploading(false)
      setError("Unexpected error during upload.")
      console.error(err)
    }
  }

  const resetForm = () => {
    setUploadProgress(0)
    setVideoFile(null)
    setVideoPreview(null)
    setPrompt("")
    setResponse(null)
    setSelectedCategoryId("")
  }

  return (
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center">AI Metadata Generator & YouTube Uploader</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div>
            <label htmlFor="video-upload" className="font-semibold">Upload Video (.mp4):</label>
            <input
              type="file"
              id="video-upload"
              accept="video/mp4"
              onChange={handleFileChange}
              className="block mt-2"
            />
          </div>

          {videoPreview && (
            <div>
              <video src={videoPreview} controls className="w-full max-w-md rounded-md border mt-4" />
            </div>
          )}

          <div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your video idea..."
              rows={5}
              className="w-full p-4 rounded-md border dark:bg-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 text-lg font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Generate Metadata
          </button>
        </form>

        {response && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold">Generated Metadata</h2>
            <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              {JSON.stringify(response, null, 2)}
            </pre>

            <div>
              <label htmlFor="youtube-category" className="font-semibold">YouTube Category:</label>
              <select
                id="youtube-category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="block w-full mt-2 p-2 border rounded-md dark:bg-gray-700"
              >
                <option value="">Select a category</option>
                {youtubeCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.snippet.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || !videoFile || !selectedCategoryId}
              className="w-full py-3 text-lg font-semibold bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              {uploading ? `Uploading... ${uploadProgress.toFixed(2)}%` : "Upload to YouTube"}
            </button>

            {uploading && (
              <div className="text-sm mt-2">
                Progress: {uploadProgress.toFixed(2)}%
              </div>
            )}
          </div>
        )}

        {error && <p className="text-red-500 font-medium text-center">Error: {error}</p>}
      </div>
  )
}
