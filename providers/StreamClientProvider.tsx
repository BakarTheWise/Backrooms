'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { StreamChat } from 'stream-chat';
import { Chat } from 'stream-chat-react';
import { useUser } from '@clerk/nextjs';

import { tokenProvider } from '@/actions/stream.actions';
import Loader from '@/components/Loader';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    
    if (!isLoaded || !user) return;
    if (!API_KEY) throw new Error('Stream API key is missing');

    // Initialize Stream Video Client
    const videoClient = new StreamVideoClient({
      apiKey: API_KEY,
      user: {
        id: user.id,
        name: user.username || user.id,
        image: user.imageUrl,
      },
      tokenProvider,
    });
    setVideoClient(videoClient);

    // Initialize Stream Chat Client
    const chatClient = StreamChat.getInstance(API_KEY);
    chatClient.connectUser(
      {
        id: user.id,
        name: user.username || user.id,
        image: user.imageUrl,
      },
      // Use the same token provider for authentication
      tokenProvider
    );

    setChatClient(chatClient);

    // Cleanup on unmount
    
  }, [user, isLoaded]);

  if (!videoClient || !chatClient) return <Loader />;

  return (
    <StreamVideo client={videoClient}>
      <Chat client={chatClient}>{children}</Chat>
    </StreamVideo>
  );
};

export default StreamVideoProvider;
