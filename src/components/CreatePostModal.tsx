import React, { useState, useRef } from 'react';
import { Profile, Post } from '../types';
import { X, Image as ImageIcon, Link as LinkIcon, Sparkles, Upload } from 'lucide-react';

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
  const [postType, setPostType] = useState<'image' | 'link'>('image');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file. / الرجاء اختيار ملف صورة صحيح.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) { // 8MB limit
      setError('Image is too large. Please select an image under 8MB. / الصورة كبيرة جداً، الرجاء اختيار صورة أقل من 8 ميجابايت.');
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
    if (!title.trim()) {
      setError('Story Title is required. / عنوان المنشور مطلوب.');
      return;
    }

    if (postType === 'image' && !imageUrl.trim()) {
      setError('Please select an image for your story. / الرجاء اختيار صورة للقصة.');
      return;
    }

    if (postType === 'link' && !linkUrl.trim()) {
      setError('Please enter a link URL. / الرجاء إدخال رابط الموقع.');
      return;
    }

    if (postType === 'link' && !linkUrl.trim().startsWith('http://') && !linkUrl.trim().startsWith('https://')) {
      setError('URL must start with http:// or https:// / يجب أن يبدأ الرابط بـ http:// أو https://');
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
          image_url: postType === 'image' ? imageUrl.trim() : undefined,
          link_url: postType === 'link' ? linkUrl.trim() : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create post');
      }
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
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#FFFB93] flex items-center justify-center font-bold text-black shadow-xs">
              {postType === 'image' ? <ImageIcon className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-black text-black">New Creator Post</h3>
              <p className="text-[10px] text-gray-500 font-medium">Share your stories or check links with Web Risk API</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black font-bold p-1 cursor-pointer bg-transparent border-none">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Type Selector Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setPostType('image'); setError(''); }}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 border-none bg-transparent ${
              postType === 'image' ? 'bg-white text-black shadow-sm font-black' : 'text-gray-500 hover:text-black'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Image / إضافة صورة</span>
          </button>
          <button
            type="button"
            onClick={() => { setPostType('link'); setError(''); }}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 border-none bg-transparent ${
              postType === 'link' ? 'bg-white text-black shadow-sm font-black' : 'text-gray-500 hover:text-black'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Link / إضافة رابط</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl animate-shake">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Title / عنوان المنشور
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={postType === 'image' ? "e.g. Golden hour over Amalfi Coast" : "e.g. My new YouTube video review!"}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:border-black transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Description / تفاصيل المنشور
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share some context behind this post..."
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:border-black transition"
            />
          </div>

          {postType === 'image' ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Upload Image / تحميل صورة
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
                    Click to choose or drag & drop image
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
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors border-none cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Link URL / رابط الموقع (Checked with Google Web Risk API)
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-3.5 focus-within:border-black focus-within:bg-white transition">
                <LinkIcon className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/my-cool-story"
                  className="w-full bg-transparent font-medium text-black focus:outline-none text-sm"
                />
              </div>
              <p className="mt-2 text-[11px] text-gray-500 font-medium leading-relaxed bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                🔒 يتم فحص الروابط تلقائياً عبر نظام <strong>Google Web Risk API</strong> لضمان سلامتها ومطابقتها لشروط وأحكام Google AdSense قبل النشر.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 border-none shadow-md"
            >
              {submitting ? 'Verifying & Publishing...' : 'Publish Post / نشر المنشور'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
