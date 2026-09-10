import React from 'react';
import { Post } from '../types';
import { Flame, Eye } from 'lucide-react';

interface TrendingPostsProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
  onSelectProfile: (username: string) => void;
}

export const TrendingPosts: React.FC<TrendingPostsProps> = ({
  posts,
  onSelectPost,
  onSelectProfile,
}) => {
  // Duplicate array to ensure endless smooth marquee scrolling
  const carouselPosts = [...posts, ...posts];

  return (
    <section className="w-full mb-20 overflow-hidden">
      {/* Header */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 flex items-center justify-between mb-8">
        <div>
          <h3 className="text-3xl md:text-5xl font-extrabold text-black tracking-tight">
            Trending posts
          </h3>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-[#FFFB93] flex items-center justify-center text-black shadow-xs">
          <Flame className="w-5 h-5 text-black fill-black" />
        </div>
      </div>

      {/* Marquee Infinite Carousel */}
      <div className="relative w-full overflow-x-auto pb-4 scrollbar-none">
        <div className="animate-banner-move flex gap-5 px-5">
          {carouselPosts.map((post, idx) => (
            <div
              key={`${post.id}-${idx}`}
              onClick={() => onSelectPost(post)}
              className="relative w-[280px] sm:w-[340px] h-[220px] sm:h-[260px] rounded-3xl overflow-hidden shrink-0 group cursor-pointer shadow-md transition-transform duration-300 hover:scale-[1.03] hover:z-20"
            >
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              {/* Creator Info on Hover / Always legible at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white flex items-center justify-between">
                <div
                  className="flex items-center gap-2.5 truncate"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (post.username) onSelectProfile(post.username);
                  }}
                >
                  <img
                    src={
                      post.user_avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username || 'user'}`
                    }
                    alt={post.username || 'creator'}
                    className="w-8 h-8 rounded-full border border-white/60 object-cover shrink-0"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold leading-tight truncate hover:underline">
                      @{post.username || 'creator'}
                    </p>
                    <p className="text-[11px] text-gray-300 truncate max-w-[160px]">{post.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-semibold shrink-0">
                  <Eye className="w-3.5 h-3.5 text-gray-300" />
                  <span>{post.views_count.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
