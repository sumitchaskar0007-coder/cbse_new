import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { videoAPI } from '../../api';

const API_URL = import.meta.env.VITE_API_URL || '';
const MEDIA_BASE_URL = API_URL.replace(/\/api\/?$/, '');

const initialFormState = {
  title: '',
  description: '',
  videoType: 'url', // 'url' | 'upload'
  videoUrl: '',
};

const VideoAdmin = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [videoFile, setVideoFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await videoAPI.getAll();
      setVideos(res.data);
    } catch (err) {
      console.error('Failed to load videos:', err);
      setMessage({ type: 'error', text: 'Failed to load videos.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const resetForm = () => {
    setFormData(initialFormState);
    setVideoFile(null);
    setEditingId(null);
    setUploadProgress(0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0] || null);
  };

  const handleEdit = (video) => {
    setEditingId(video._id);
    setFormData({
      title: video.title,
      description: video.description || '',
      videoType: video.videoType,
      videoUrl: video.videoUrl || '',
    });
    setVideoFile(null);
    setMessage({ type: '', text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await videoAPI.delete(id);
      setMessage({ type: 'success', text: 'Video deleted successfully.' });
      fetchVideos();
    } catch (err) {
      console.error('Delete failed:', err);
      setMessage({ type: 'error', text: 'Failed to delete video.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required.' });
      return;
    }
    if (formData.videoType === 'url' && !formData.videoUrl.trim()) {
      setMessage({ type: 'error', text: 'Please provide a video URL.' });
      return;
    }
    if (formData.videoType === 'upload' && !editingId && !videoFile) {
      setMessage({ type: 'error', text: 'Please choose a video file to upload.' });
      return;
    }

    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('description', formData.description);
    fd.append('videoType', formData.videoType);
    if (formData.videoType === 'url') {
      fd.append('videoUrl', formData.videoUrl);
    }
    if (formData.videoType === 'upload' && videoFile) {
      fd.append('video', videoFile);
    }

    const onUploadProgress = (evt) => {
      if (evt.total) {
        setUploadProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    };

    try {
      setSubmitting(true);
      setUploadProgress(0);
      setMessage({ type: '', text: '' });

      if (editingId) {
        await videoAPI.update(editingId, fd, onUploadProgress);
        setMessage({ type: 'success', text: 'Video updated successfully.' });
      } else {
        await videoAPI.create(fd, onUploadProgress);
        setMessage({ type: 'success', text: 'Video added successfully.' });
      }

      resetForm();
      fetchVideos();
    } catch (err) {
      console.error('Save failed:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save video.',
      });
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 mt-20 pb-16">
      {/* NAVBAR */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard" className="text-sm text-blue-600 hover:underline">
                ← Dashboard
              </Link>
              <h1 className="text-xl font-semibold">Video Management</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* MESSAGE BANNER */}
        {message.text && (
          <div
            className={`px-4 py-3 rounded-md text-sm ${
              message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* FORM */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Video' : 'Add New Video'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Video title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Source
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="videoType"
                    value="url"
                    checked={formData.videoType === 'url'}
                    onChange={handleChange}
                  />
                  Link / URL (YouTube, Vimeo, direct link)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="videoType"
                    value="upload"
                    checked={formData.videoType === 'upload'}
                    onChange={handleChange}
                  />
                  Upload File (any size)
                </label>
              </div>
            </div>

            {formData.videoType === 'url' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL
                </label>
                <input
                  type="text"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-600 border border-gray-300 rounded-md px-3 py-2"
                />
                {editingId && (
                  <p className="text-xs text-gray-400 mt-1">
                    Leave empty to keep the currently uploaded video.
                  </p>
                )}
                {videoFile && (
                  <p className="text-xs text-gray-500 mt-1">Selected: {videoFile.name}</p>
                )}
              </div>
            )}

            {submitting && uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
                <p className="text-xs text-gray-500 mt-1">{uploadProgress}% uploaded</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Video' : 'Add Video'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LIST */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Existing Videos</h2>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading videos...</p>
          ) : videos.length === 0 ? (
            <p className="text-gray-500 text-sm">No videos added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {videos.map((video) => (
                <div
                  key={video._id}
                  className="border border-gray-200 rounded-lg overflow-hidden flex flex-col"
                >
                  <div className="aspect-video bg-black">
                    {video.videoType === 'upload' ? (
                      <video
                        controls
                        preload="metadata"
                        className="w-full h-full"
                        src={`${MEDIA_BASE_URL}${video.videoFile}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs p-2 break-all text-center">
                        {video.videoUrl}
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-medium text-gray-900 line-clamp-1">{video.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">
                      {video.description}
                    </p>
                    <span className="text-[11px] uppercase tracking-wide text-gray-400 mt-2">
                      {video.videoType === 'url' ? 'Link' : 'Uploaded file'}
                    </span>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(video)}
                        className="flex-1 px-3 py-1.5 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(video._id)}
                        className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoAdmin;