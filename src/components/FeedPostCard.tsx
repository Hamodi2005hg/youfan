import React, { useState, useEffect } from 'react';
import { Post, Profile } from '../types';
import { ArrowUp, ArrowDown, Eye, MessageSquare, Send, Calendar } from 'lucide-react';

interface FeedPostCardProps {
  post: Post;
  currentUser: Profile | null;
  onVoteSuccess: () => void;
  onSelectProfile?: (username: string) => void;
  onRequireAuth?: () => void;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({
  post,
  currentUser,
  onVoteSuccess,
  onSelectProfile,
  onRequireAuth,
}) => {
  const [upvotes, setUpvotes] = useState(post.upvotes || 0);
  const [downvotes, setDownvotes] = useState(post.downvotes || 0);
  const [hasVoted, setHasVoted] = useState<'up' | 'down' | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (currentUser && post.user_id) {
        try {
          const res = await fetch(`/api/followers/${post.user_id}`);
          if (res.ok) {
            const list = await res.json();
            setIsFollowing(list.some((f: any) => f.follower_id === currentUser.id));
          }
        } catch {}
      }
    };
    checkFollowStatus();
  }, [post.user_id, currentUser?.id]);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      alert("Please register or log in to follow creators.");
      return;
    }
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          follower_id: currentUser.id,
          following_id: post.user_id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
      }
    } catch {}
  };

  useEffect(() => {
    // Sync vote counts if prop changes
    setUpvotes(post.upvotes || 0);
    setDownvotes(post.downvotes || 0);
  }, [post.upvotes, post.downvotes]);

  useEffect(() => {
    // Load local storage vote indicator
    const savedVote = localStorage.getItem(`vote_${post.id}_${currentUser?.id || 'guest'}`);
    if (savedVote === 'up' || savedVote === 'down') {
      setHasVoted(savedVote as 'up' | 'down');
    } else {
      setHasVoted(null);
    }
    
    // Load comments for this post
    loadComments();
  }, [post.id, currentUser?.id]);

  const loadComments = async () => {
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

  
  const requireAuth = () => {
    if (!currentUser && onRequireAuth) {
      onRequireAuth();
      return true;
    }
    if (!currentUser) {
      alert("Please log in to interact with this post.");
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
          user_id: currentUser?.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUpvotes(data.upvotes);
        setDownvotes(data.downvotes);
        
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
          parent_id: replyingTo?.id || null,
        }),
      });

      if (res.ok) {
        setNewComment('');
        setReplyingTo(null);
        loadComments();
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Group comments into parents and replies
  const parentComments = comments.filter((c) => !c.parent_id);
  const getRepliesFor = (parentId: string) => comments.filter((c) => c.parent_id === parentId);

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-xl mb-6">
      {/* Author Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectProfile && post.username) onSelectProfile(post.username);
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src={post.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username || 'user'}`}
            alt={post.username}
            className="w-9 h-9 rounded-full object-cover border border-white/20 group-hover:border-white/55 transition-all"
            referrerPolicy="no-referrer"
          />
          <div>
            <p className="font-bold text-sm text-white group-hover:text-[#FF2D55] transition-all">@{post.username || 'creator'}</p>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Follow Button next to profile picture header */}
        {(!currentUser || currentUser.id !== post.user_id) && (
          <button
            onClick={handleFollowToggle}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
              isFollowing 
                ? 'bg-white/10 text-gray-300 border border-white/10 hover:bg-white/20' 
                : 'bg-[#FF2D55] text-white hover:bg-[#ff4466]'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Title & Stats */}
      <div className="p-4 pb-2">
        <h3 className="font-black text-lg text-white mb-1">{post.title}</h3>
        <p className="text-xs text-gray-400 mb-2">{post.description}</p>
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <Eye className="w-3.5 h-3.5" />
          <span>{((post.views_count || 0) + 1).toLocaleString()} views</span>
        </div>
      </div>

      {/* Main Image */}
      <div className="w-full bg-black max-h-[500px] overflow-hidden flex items-center justify-center border-t border-b border-white/5">
        <img
          src={post.image_url}
          alt={post.title}
          className="w-full h-auto object-contain max-h-[500px]"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Voting Bar */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white/5 rounded-full p-1 border border-white/10">
          <button
            onClick={() => handleVote('up')}
            className={`px-3 py-2 rounded-full flex items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
              hasVoted === 'up'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>{upvotes}</span>
          </button>
          
          <div className="w-px h-4 bg-white/10" />

          <button
            onClick={() => handleVote('down')}
            className={`px-3 py-2 rounded-full flex items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
              hasVoted === 'down'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>{downvotes}</span>
          </button>
        </div>

        <span className="text-xs font-semibold text-gray-400">
          Score: {upvotes - downvotes > 0 ? `+${upvotes - downvotes}` : upvotes - downvotes}
        </span>
      </div>

      {/* Comments List & Input */}
      <div className="p-4 bg-black/40 border-t border-white/5">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments ({comments.length})</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-[10px] font-bold text-gray-500 hover:text-[#FF2D55] transition-colors cursor-pointer px-2 py-1 bg-white/5 rounded-md hover:bg-white/10"
          >
            {showComments ? 'Close Comments' : 'Open Comments'}
          </button>
        </div>

        {showComments && (
          <div>
            {/* Input box */}
            {currentUser ? (
              <div className="mb-4">
                {replyingTo && (
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 px-3 py-1.5 rounded-t-xl text-[10px] text-gray-400">
                    <span>Replying to <strong className="text-white">@{replyingTo.username}</strong></span>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="text-rose-400 hover:text-rose-300 font-bold ml-2"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : "Write a comment..."}
                    className={`flex-1 px-3 py-1.5 bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-gray-500 ${
                      replyingTo ? 'rounded-b-xl rounded-t-none border-t-0' : 'rounded-full'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="p-1.5 bg-white text-black hover:bg-gray-200 transition-colors rounded-full cursor-pointer disabled:opacity-40 shrink-0 self-end"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center mb-4">
                <p className="text-[10px] text-gray-400">
                  Please sign in or register to write comments.
                </p>
              </div>
            )}

            {/* List of comments */}
            {loadingComments && comments.length === 0 ? (
              <div className="py-2 text-center text-[10px] text-gray-500">Loading...</div>
            ) : comments.length === 0 ? (
              <div className="py-2 text-center text-[10px] text-gray-600">No comments yet.</div>
            ) : (
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {parentComments.map((parent) => (
                  <div key={parent.id} className="space-y-2">
                    {/* Parent Comment */}
                    <div className="flex gap-2 text-xs items-start">
                      <img
                        src={parent.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${parent.username}`}
                        alt={parent.username}
                        className="w-6 h-6 rounded-full object-cover border border-white/10 shrink-0 cursor-pointer hover:border-white/40 transition-all"
                        referrerPolicy="no-referrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectProfile && parent.username) onSelectProfile(parent.username);
                        }}
                      />
                      <div className="flex-1 bg-white/5 p-2 rounded-xl">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectProfile && parent.username) onSelectProfile(parent.username);
                            }}
                            className="font-bold text-[10px] text-white cursor-pointer hover:underline hover:text-[#FF2D55] transition-all"
                          >
                            @{parent.username}
                          </span>
                          <span className="text-[8px] text-gray-500">
                            {new Date(parent.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-300 leading-snug">{parent.content}</p>
                        
                        {/* Reply triggers */}
                        {currentUser && (
                          <div className="mt-1 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setReplyingTo({ id: parent.id, username: parent.username })}
                              className="text-[9px] text-[#FF2D55] hover:underline font-bold cursor-pointer"
                            >
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nested Replies */}
                    {getRepliesFor(parent.id).map((reply) => (
                      <div key={reply.id} className="flex gap-2 text-xs items-start ml-6 border-l border-white/10 pl-2">
                        <img
                          src={reply.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.username}`}
                          alt={reply.username}
                          className="w-5 h-5 rounded-full object-cover border border-white/10 shrink-0 cursor-pointer hover:border-white/40 transition-all"
                          referrerPolicy="no-referrer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectProfile && reply.username) onSelectProfile(reply.username);
                          }}
                        />
                        <div className="flex-1 bg-white/5 p-1.5 rounded-xl">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectProfile && reply.username) onSelectProfile(reply.username);
                              }}
                              className="font-bold text-[9px] text-gray-300 cursor-pointer hover:underline hover:text-[#FF2D55] transition-all"
                            >
                              @{reply.username}
                            </span>
                            <span className="text-[8px] text-gray-500">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-300 leading-snug">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
