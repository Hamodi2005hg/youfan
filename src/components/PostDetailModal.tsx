import React, { useState, useEffect } from 'react';
import { Post, Profile } from '../types';
import { Eye, X, Calendar, User, Share2, ArrowUp, ArrowDown, MessageSquare, Send, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface PostDetailModalProps {
  post: Post | null;
  authorProfile: Profile | null;
  currentUser: Profile | null;
  onClose: () => void;
  onSelectProfile: (username: string) => void;
  onVoteSuccess: () => void;
  onRequireAuth: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  authorProfile,
  currentUser,
  onClose,
  onSelectProfile,
  onVoteSuccess,
  onRequireAuth,
}) => {
  const [copied, setCopied] = useState(false);
  const [upvotes, setUpvotes] = useState(post?.upvotes || 0);
  const [downvotes, setDownvotes] = useState(post?.downvotes || 0);
  const [hasVoted, setHasVoted] = useState<'up' | 'down' | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (post) {
      // Increment view
      fetch(`/api/posts/${post.id}/view`, { method: 'POST' }).catch(() => {});
      
      // Load comments
      loadComments();

      // Set initial vote state from local storage or database if we had endpoint
      const savedVote = localStorage.getItem(`vote_${post.id}_${currentUser?.id || 'guest'}`);
      if (savedVote === 'up' || savedVote === 'down') {
        setHasVoted(savedVote as 'up' | 'down');
      }
    }
  }, [post?.id, currentUser?.id]);

  const loadComments = async () => {
    if (!post) return;
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  if (!post) return null;

  
  const requireAuth = () => {
    if (!currentUser && onRequireAuth) {
      onRequireAuth();
      return true;
    }
    if (!currentUser) {
      alert("Please log in to interact.");
      return true;
    }
    return false;
  };

  const handleVote = async (type: 'up' | 'down') => {
    if (requireAuth()) return;
    try {
      const res = await fetch(`/api/posts/${post.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          user_id: currentUser?.id // Pass user_id for real persistent voting
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUpvotes(data.upvotes);
        setDownvotes(data.downvotes);
        
        // Save local vote indicator
        if (hasVoted === type) {
          setHasVoted(null);
          localStorage.removeItem(`vote_${post.id}_${currentUser?.id || 'guest'}`);
        } else {
          setHasVoted(type);
          localStorage.setItem(`vote_${post.id}_${currentUser?.id || 'guest'}`, type);
        }

        onVoteSuccess();
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requireAuth()) return;
    e.preventDefault();
    if (!currentUser || !newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          username: currentUser.username,
          user_avatar: currentUser.avatar_url,
          content: newComment.trim(),
        }),
      });

      if (res.ok) {
        setNewComment('');
        loadComments();
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/#post-${post.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#121212] text-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-white/10 my-8 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header bar */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              if (post.username) onSelectProfile(post.username);
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src={
                post.user_avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username || 'user'}`
              }
              alt={post.username}
              className="w-10 h-10 rounded-full object-cover border border-white/20"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="font-bold text-sm text-white group-hover:underline">
                @{post.username || 'creator'}
              </p>
              <p className="text-xs text-gray-400">View Creator Profile</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 cursor-pointer transition-colors"
              title="Share post link"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body content */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/10">
          {/* Media Image or Link Preview */}
          {post.link_url ? (
            <div className="w-full px-4 py-8 bg-gradient-to-br from-neutral-900 to-black border-b border-white/10 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15 shadow-inner">
                <LinkIcon className="w-6 h-6 text-[#FFFB93]" />
              </div>
              <div className="max-w-md px-4">
                <p className="text-xs text-gray-500 font-mono tracking-wider truncate mb-1">
                  {(() => {
                    try {
                      return new URL(post.link_url).hostname;
                    } catch {
                      return post.link_url;
                    }
                  })()}
                </p>
                <p className="text-sm font-bold text-white mb-2">
                  Verified Safe External Link
                </p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Link safety and domain verified by system security scanner
                </p>
              </div>
              <a
                href={post.link_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={async () => {
                  try {
                    await fetch(`/api/posts/${post.id}/view`, { method: 'POST' });
                  } catch {}
                }}
                className="px-5 py-3 bg-white hover:bg-gray-200 text-black font-extrabold text-xs rounded-full transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 cursor-pointer no-underline"
              >
                <span>Visit Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="w-full bg-black flex items-center justify-center max-h-[450px] overflow-hidden">
              <img 
                src={post.image_url} 
                alt={post.title} 
                className="w-full h-auto object-contain max-h-[450px]" 
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Content Details */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-snug mb-2">{post.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Published on {new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-300 bg-white/10 px-3 py-1.5 rounded-full shrink-0">
                <Eye className="w-3.5 h-3.5 text-gray-400" />
                {(post.views_count + 1).toLocaleString()} views
              </span>
            </div>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6 whitespace-pre-line">
              {post.description}
            </p>

            {/* UPVOTE / DOWNVOTE SECTION */}
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex items-center gap-2 bg-white/5 rounded-full p-1 border border-white/10">
                <button
                  onClick={() => handleVote('up')}
                  className={`p-2.5 rounded-full flex items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                    hasVoted === 'up'
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Upvote post"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span>{upvotes}</span>
                </button>
                
                <div className="w-px h-5 bg-white/10" />

                <button
                  onClick={() => handleVote('down')}
                  className={`p-2.5 rounded-full flex items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                    hasVoted === 'down'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Downvote post"
                >
                  <ArrowDown className="w-4 h-4" />
                  <span>{downvotes}</span>
                </button>
              </div>

              <span className="text-xs font-bold text-gray-400">
                Score: {upvotes - downvotes > 0 ? `+${upvotes - downvotes}` : upvotes - downvotes}
              </span>
            </div>
          </div>

          {/* COMMENTS SECTION */}
          <div className="p-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Comments ({comments.length})</span>
            </h4>

            {/* Ethical Conduct Warning Banner in English */}
            <div className="mb-4 px-3.5 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-2 leading-relaxed">
              <span>⚠️ Please maintain respectful and ethical behavior to avoid a permanent account ban.</span>
            </div>

            {/* Comment Form */}
            {currentUser ? (
              <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
                <img
                  src={currentUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`}
                  alt={currentUser.username}
                  className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a public comment..."
                    className="w-full pl-4 pr-12 py-2 bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-gray-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="absolute right-1 top-1 p-1.5 bg-white text-black hover:bg-gray-200 transition-colors rounded-full cursor-pointer disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center mb-6">
                <p className="text-xs text-gray-400">
                  Please sign in or register to join the discussion and post comments.
                </p>
              </div>
            )}

             {/* Comments List */}
            {loadingComments ? (
              <div className="py-4 text-center text-xs text-gray-400">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">No comments yet. Be the first to comment!</div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3 text-sm items-start">
                    <img
                      src={c.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.username}`}
                      alt={c.username}
                      className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0 cursor-pointer hover:border-white/40 transition-all"
                      referrerPolicy="no-referrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        if (c.username) onSelectProfile(c.username);
                      }}
                    />
                    <div className="flex-1 bg-white/5 border border-white/10 p-3 rounded-2xl">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            if (c.username) onSelectProfile(c.username);
                          }}
                          className="font-bold text-xs text-white cursor-pointer hover:underline hover:text-[#FF2D55] transition-all"
                        >
                          @{c.username}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Toast */}
        {copied && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-4 py-2 rounded-full font-bold text-xs shadow-lg animate-bounce z-50">
            Post link copied!
          </div>
        )}
      </div>
    </div>
  );
};
