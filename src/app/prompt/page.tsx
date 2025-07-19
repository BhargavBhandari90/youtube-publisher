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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (res.ok) {
        setResponse(data)
        // Try to find a matching category ID
        const matchedCategory = youtubeCategories.find(
          (cat) => cat.snippet.title.toLowerCase() === data.category.toLowerCase()
        )
        if (matchedCategory) {
          setSelectedCategoryId(matchedCategory.id)
        } else {
          setSelectedCategoryId("") // Reset if no match
        }
      } else {
        setError(data.error || "Failed to generate AI response.")
      }
    } catch (err) {
      setError("Network error or AI generation failed.")
      console.error(err)
    }
  }

  const handleUpload = async () => {
    if (!videoFile) {
      alert("Please select a video file to upload.")
      return
    }
    if (!response || !response.title || !response.description || !response.tags) {
      alert("Please generate AI metadata first.")
      return
    }
    if (!selectedCategoryId) {
      alert("Please select a YouTube category.")
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
          const percentComplete = (event.loaded / event.total) * 100
          setUploadProgress(percentComplete)
        }
      }

      xhr.onload = () => {
        setUploading(false)
        if (xhr.status === 200) {
          alert("Video uploaded successfully!")
          setUploadProgress(0)
          setVideoFile(null)
          setVideoPreview(null)
          setPrompt("")
          setResponse(null)
          setSelectedCategoryId("")
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
      setError("An unexpected error occurred during upload.")
      console.error(err)
    }
  }

  return (
    <div>
      <h1>AI Prompt & YouTube Upload</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="video-upload">Upload Video (.mp4):</label>
          <input
            type="file"
            id="video-upload"
            accept="video/mp4"
            onChange={handleFileChange}
          />
        </div>
        {videoPreview && (
          <div>
            <h2>Video Preview</h2>
            <video src={videoPreview} controls width="400" />
          </div>
        )}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your video idea"
          rows={5}
          cols={50}
        />
        <button type="submit" disabled={uploading}>Generate Metadata</button>
      </form>

      {response && (
        <div>
          <h2>AI Generated Metadata</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>

          <div>
            <label htmlFor="youtube-category">YouTube Category:</label>
            <select
              id="youtube-category"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              disabled={youtubeCategories.length === 0}
            >
              <option value="">Select a category</option>
              {youtubeCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.snippet.title}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleUpload} disabled={uploading || !videoFile || !selectedCategoryId}>
            {uploading ? `Uploading... ${uploadProgress.toFixed(2)}%` : "Upload to YouTube"}
          </button>
          {uploading && <p>Upload Progress: {uploadProgress.toFixed(2)}%</p>}
        </div>
      )}

      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  )
}
