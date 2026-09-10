import React, { useState, useRef } from 'react';
import { Profile, Post } from '../types';
import { X, Image as ImageIcon, Sparkles, Upload } from 'lucide-react';

interface CreatePostModalProps {
  currentUser: Profile;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  currentUser,
  onClose,
  onPostCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) { // 8MB limit
      setError('Image is too large. Please select an image under 8MB.');
      return;
    }
    
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      setError('Please write a title and select an image for your story.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          username: currentUser.username,
          title: title.trim(),
          description: description.trim(),
          image_url: imageUrl.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to create post');
      const data = await res.json();
      onPostCreated(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while publishing your post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#FFFB93] flex items-center justify-center font-bold">
              <ImageIcon className="w-5 h-5 text-black" />
            </div>
            <h3 className="text-xl font-black text-black">New Visual Story</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black font-bold p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">{error}</div>}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Story Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Golden hour over Amalfi Coast"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Caption & Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share the story behind this visual..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Post Image
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {!imageUrl ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files?.[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-black bg-gray-50'
                    : 'border-gray-300 hover:border-black bg-gray-50/50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-sm font-bold text-black mb-1">
                  Click here to choose an image or drag & drop
                </p>
                <p className="text-xs text-gray-400">
                  Supports JPG, PNG, GIF up to 8MB
                </p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden group border border-gray-200">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? 'Publishing...' : 'Publish to Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
