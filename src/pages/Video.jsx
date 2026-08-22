import React, { useEffect, useState } from 'react';
import { videoAPI } from '../api';

// Static files (uploaded videos) are served from the backend root, not /api,
// so strip a trailing /api from VITE_API_URL to build the media base URL.
const API_URL = import.meta.env.VITE_API_URL || '';
const MEDIA_BASE_URL = API_URL.replace(/\/api\/?$/, '');

const getYouTubeEmbedUrl = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2] && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
};

const getVimeoEmbedUrl = (url) => {
  const regExp = /vimeo\.com\/(?:.*\/)?(\d+)/;
  const match = url.match(regExp);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
};

const VideoPlayer = ({ video }) => {
  if (video.videoType === 'upload' && video.videoFile) {
    return (
      <video
        controls
        preload="metadata"
        className="w-full h-full rounded-lg bg-black"
      >
        <source src={`${MEDIA_BASE_URL}${video.videoFile}`} />
        Your browser does not support the video tag.
      </video>
    );
  }

  if (video.videoType === 'url' && video.videoUrl) {
    const youtubeEmbed = getYouTubeEmbedUrl(video.videoUrl);
    if (youtubeEmbed) {
      return (
        <iframe
          className="w-full h-full rounded-lg"
          src={youtubeEmbed}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    const vimeoEmbed = getVimeoEmbedUrl(video.videoUrl);
    if (vimeoEmbed) {
      return (
        <iframe
          className="w-full h-full rounded-lg"
          src={vimeoEmbed}
          title={video.title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }

    // Fallback: treat it as a direct video link (mp4, webm, etc.)
    return (
      <video controls preload="metadata" className="w-full h-full rounded-lg bg-black">
        <source src={video.videoUrl} />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <div className="w-full h-full rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
      Video unavailable
    </div>
  );
};

const Video = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await videoAPI.getAll();
        setVideos(res.data);
      } catch (err) {
        console.error('Failed to load videos:', err);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 mt-20 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Videos</h1>
          <p className="mt-2 text-gray-500">Watch our latest videos</p>
        </div>

        {loading && (
          <div className="text-center py-20 text-gray-500">Loading videos...</div>
        )}

        {!loading && error && (
          <div className="text-center py-20 text-red-500">{error}</div>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className="text-center py-20 text-gray-500">No videos available yet.</div>
        )}

        {!loading && !error && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                <div className="aspect-video w-full bg-black">
                  <VideoPlayer video={video} />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {video.title}
                  </h2>
                  {video.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Video;