import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { postsAPI } from "../services/api";
import "./Posts.css";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await postsAPI.getPosts();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(
        error.response?.data?.error || "Failed to load posts. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPosts();
  };

  if (loading) {
    return (
      <div className="posts-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="posts-container">
      <div className="posts-header">
        <div className="user-info">
          <h1>Welcome, {user?.name}!</h1>
          <p>Here are your posts</p>
        </div>
        <button onClick={handleRefresh} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="error-container">
          <div className="error-message">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
          <button onClick={handleRefresh} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {!error && posts.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No posts found</h3>
          <p>You don't have any posts yet.</p>
        </div>
      )}

      {!error && posts.length > 0 && (
        <div className="posts-grid">
          {posts.map((post, index) => (
            <div key={index} className="post-card">
              <div className="post-header">
                <span className="post-author">{post.username}</span>
                <span className="post-number">#{index + 1}</span>
              </div>
              <h3 className="post-title">{post.title}</h3>
              <div className="post-meta">
                <span className="post-date">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="posts-footer">
        <p>
          Total posts: <strong>{posts.length}</strong>
        </p>
      </div>
    </div>
  );
};

export default Posts;
