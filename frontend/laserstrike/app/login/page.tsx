'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterPlayer } from '@/lib/actions/game.actions';
import { getSocket } from '@/lib/socket';
import TargetIcon from '@/components/TargetIcon';

interface PlayerRegisterProps {
  name: string;
  tagId: string; // Keep as string for form input, convert when needed
}

export default function LoginPage() {
  const [player, setPlayer] = useState<PlayerRegisterProps>({ name: '', tagId: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for the error popup
  const router = useRouter();

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); // Clear error when user types
    setPlayer(prev => ({ ...prev, name: e.target.value }));
  };

  const handleTagIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); // Clear error when user types
    setPlayer(prev => ({ ...prev, tagId: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Clear previous errors on new submission

    if (!player.name || !player.tagId) {
      setError('Both Strike Name and Tag ID are required.');
      return;
    }

    setIsLoading(true);
    try {
      //  Register via REST API
      const registered = await RegisterPlayer({
        name: player.name,
        tagId: parseInt(player.tagId) // Convert string to number
      });

      if (registered && registered.id) {
        //Persist to session
        sessionStorage.setItem('player', JSON.stringify(registered));
        //Initialize WebSocket with the returned player ID
        getSocket(registered.id);
        //navigate into the app
        router.push('/');
      } else {
        // Handle failed registration (e.g., player ID already exists)
        setError('Registration failed. This Tag ID might already be in use.');
        console.error('Registration failed:', registered);
      }
    } catch (err) {
      // This completes the TODO
      console.error('Registration error:', err);
      // Set a generic but friendly error message
      setError('Could not connect to the game server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-black to-gray-900 p-6">
      <div className="w-full max-w-md bg-black/80 backdrop-blur rounded-2xl shadow-2xl p-8 border border-red-500/20">
        <div className="text-center mb-8">
          <TargetIcon />
          <h1 className="text-3xl font-bold text-white mb-2">LaserStrike</h1>
          <p className="text-gray-100">Enter your name to join the battle</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-2">
              Strike Name
            </label>
            <input
              id="playerName"
              type="text"
              value={player.name}
              onChange={handlePlayerNameChange}
              placeholder="Enter your strike name..."
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-lg text-white placeholder-gray-400"
              maxLength={20}
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="tagId" className="block text-sm font-medium text-gray-100 mb-2">
              Strike Tag Id
            </label>
            <input
              id="tagId"
              type="text"
              // Only allow numbers in the input
              pattern="[0-9]*"
              inputMode="numeric"
              value={player.tagId}
              onChange={handleTagIdChange}
              placeholder="Enter your tag id..."
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-lg text-white placeholder-gray-400"
              maxLength={20}
            />
          </div>

          {/* --- The Error Popup --- */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center text-sm">
              <p>{error}</p>
            </div>
          )}
          {/* --- End Error Popup --- */}

          <button
            type="submit"
            disabled={isLoading || !player.name || !player.tagId}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-red-600 text-white rounded-lg text-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />}
            <span>{isLoading ? 'Entering Battle...' : 'Enter Battle'}</span>
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Take precise shots and dominate the leaderboard!
        </div>
      </div>
    </div>
  );
}