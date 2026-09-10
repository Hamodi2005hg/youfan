import React from 'react';
import { Post, Profile } from '../types';
import { FeedPostCard } from './FeedPostCard';

interface GlobalFeedViewProps {
  posts: Post[];
  currentUser: Profile | null;
  onSelectPost: (post: Post) => void;
  onSelectProfile: (username: string) => void;
  onRequireAuth: () => void;
}

export const GlobalFeedView: React.FC<GlobalFeedViewProps> = ({
  posts,
  currentUser,
  onSelectPost,
  onSelectProfile,
  onRequireAuth
}) => {
  return (
    <div className="w-full min-h-screen bg-[#000000] text-white flex flex-col items-center py-10">
      <div className="w-full max-w-[600px] px-4">
        <h1 className="text-3xl font-extrabold mb-8">Creators Feed</h1>
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map(post => (
              <FeedPostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onSelectPost={() => onSelectPost(post)}
                onSelectProfile={onSelectProfile}
                onRequireAuth={onRequireAuth}
                onVoteSuccess={() => {}}
              />
            ))
          ) : (
            <div className="text-gray-400 text-center py-10">No posts available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
