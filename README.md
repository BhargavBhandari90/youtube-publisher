# YouTube Upload Assistant 🎥🤖

This is a Next.js app that helps you generate SEO-optimized metadata (title, description, tags, category) for a YouTube video using AI, and then upload the video directly to your YouTube channel.


## 🚀 Features

- Generate **SEO-friendly** metadata for videos using AI
- Select **YouTube categories** via the YouTube Data API
- Upload videos to your channel directly via the **YouTube API**
- Save time and avoid switching between tools


## 🛠️ Development Setup

### 1. Clone the repo

```bash
git clone https://github.com/BhargavBhandari90/youtube-publisher.git
cd youtube-publisher
```
### 2. Install dependencies

```bash
npm install
```

### 3. Run the dev server

```bash
npm run dev
```
App will be available at: http://localhost:3000

### 4. Production Build

```
npm run build
```

## Environment Variables
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GEMINI_API_KEY=
NEXTAUTH_SECRET=
YOUTUBE_API_KEY=

# Scopes for YouTube Data API
https://www.googleapis.com/auth/youtube.upload
https://www.googleapis.com/auth/youtube.force-ssl

```

## Required Setup

1. Setup a Google OAuth app at: https://console.cloud.google.com/apis/credentials
2. Enable YouTube Data API v3
3. Add http://localhost:3000 as an authorized redirect URI
4. Get your Gemini AI API Key

## 🙌 Credits

- [Next.js](https://nextjs.org/)
- [YouTube Data API](https://developers.google.com/youtube/v3/docs/)
- [Gemini AI](https://gemini.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)

## 📃 License
MIT License. Feel free to fork and enhance.