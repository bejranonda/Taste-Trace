/**
 * FoodieMatch Component - Find dining partners
 */
import React, { useState, useEffect } from 'react';
import { Users, Clock, Plus, Check, X } from 'lucide-react';
import { Modal, Spinner, ErrorMessage } from '../../shared';
import { matchApi } from '../../../services/api';

export function FoodieMatch({ isOpen, onClose, restaurant, t }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newSession, setNewSession] = useState({
    scheduledTime: '',
    displayName: ''
  });
  const [error, setError] = useState(null);

  // Fetch sessions
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    async function fetchSessions() {
      setLoading(true);
      try {
        const data = await matchApi.getSessions(restaurant?.id);
        if (mounted) {
          setSessions(data.sessions || []);
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchSessions();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchSessions, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isOpen, restaurant?.id]);

  // Join session
  const handleJoin = async (sessionId) => {
    setJoining(sessionId);
    setError(null);

    try {
      await matchApi.joinSession(sessionId, newSession.displayName || 'Foodie');
      // Refresh sessions
      const data = await matchApi.getSessions(restaurant?.id);
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err);
    } finally {
      setJoining(null);
    }
  };

  // Create session
  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    try {
      await matchApi.createSession({
        restaurantId: restaurant?.id,
        scheduledTime: newSession.scheduledTime || null,
        displayName: newSession.displayName || 'Foodie'
      });

      // Refresh sessions
      const data = await matchApi.getSessions(restaurant?.id);
      setSessions(data.sessions || []);
      setShowCreate(false);
      setNewSession({ scheduledTime: '', displayName: '' });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate avatar colors
  const getAvatarColor = (index) => {
    const colors = ['bg-pink-400', 'bg-purple-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400'];
    return colors[index % colors.length];
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t ? t('findPartners') : 'Find Dining Partners'}
      icon="🤝"
    >
      <div className="space-y-4">
        {loading && sessions.length === 0 ? (
          <div className="flex justify-center py-4">
            <Spinner className="text-pink-500" />
          </div>
        ) : (
          <>
            {/* Restaurant info */}
            {restaurant && (
              <p className="text-sm text-gray-600 text-center">
                Find partners for <strong>{restaurant.name}</strong>
              </p>
            )}

            {/* Sessions list */}
            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        <span className="text-sm font-medium">
                          {session.participant_count || 0} / {session.max_participants || 10}
                        </span>
                      </div>
                      {session.scheduled_time && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={12} />
                          {session.scheduled_time}
                        </div>
                      )}
                    </div>

                    {/* Participant avatars */}
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: Math.min(session.participant_count || 3, 5) }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-8 h-8 rounded-full ${getAvatarColor(i)} flex items-center justify-center text-white text-xs font-bold border-2 border-white`}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                      {(session.participant_count || 0) > 5 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 border-2 border-white">
                          +{(session.participant_count || 0) - 5}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleJoin(session.id)}
                      disabled={joining === session.id}
                      className="w-full py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {joining === session.id ? (
                        <Spinner size="sm" className="text-white" />
                      ) : (
                        <>
                          <Check size={16} />
                          {t ? t('joinGroup') : 'Join Group'}
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No active sessions</p>
                <p className="text-xs text-gray-400 mt-1">Be the first to create one!</p>
              </div>
            )}

            {/* Create new session */}
            {showCreate ? (
              <div className="p-3 bg-pink-50 rounded-lg border border-pink-100 space-y-3">
                <input
                  type="text"
                  placeholder="Your display name"
                  value={newSession.displayName}
                  onChange={(e) => setNewSession({ ...newSession, displayName: e.target.value })}
                  className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
                <input
                  type="time"
                  value={newSession.scheduledTime}
                  onChange={(e) => setNewSession({ ...newSession, scheduledTime: e.target.value })}
                  className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="flex-1 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? <Spinner size="sm" className="mx-auto text-white" /> : 'Create'}
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full py-2 border-2 border-dashed border-pink-300 text-pink-500 rounded-lg text-sm font-medium hover:bg-pink-50 flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Create New Session
              </button>
            )}
          </>
        )}

        {error && <ErrorMessage error={error} />}

        <button
          onClick={onClose}
          className="w-full text-sm text-gray-400 underline hover:text-gray-600 py-2"
        >
          Maybe later
        </button>
      </div>
    </Modal>
  );
}

export default FoodieMatch;
