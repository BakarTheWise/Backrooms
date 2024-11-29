'use client';
import { useEffect, useState } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { LayoutList, X, MessageCircle, User2 } from 'lucide-react';
import { useChatContext } from 'stream-chat-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';

import { Window, MessageList, MessageInput } from 'stream-chat-react';
import ChannelProvider from '@/providers/ChannelProvider';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const { client } = useChatContext();

  const { id } = useParams();
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();

  const [hasNewMessage, setHasNewMessage] = useState(false); // Tracks if there's a new message
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [activeTab, setActiveTab] = useState<'participants' | 'messages'>(
    'participants'
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();

  useEffect(() => {
    if (!client) return;

    // Show the red circle when a new message is received
    const handleNotification = () => {
      setHasNewMessage(true);
    };

    // Hide the red circle when messages are read
    const handleMarkRead = () => {
      setHasNewMessage(false);
    };

    // Add event listeners
    client.on('notification.message_new', handleNotification);
    client.on('notification.mark_read', handleMarkRead);

    // Cleanup on unmount
    return () => {
      client.off('notification.message_new', handleNotification);
      client.off('notification.mark_read', handleMarkRead);
    };
  }, [client]);

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full text-white overflow-hidden">
      <div className="relative flex h-full w-full justify-center items-center">
        {/* Main Content Area */}
        <div
          className={`h-full flex flex-col items-center justify-between flex-1 max-w-[1000px] transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'md:pr-[15rem]' : 'md:pr-20'
          }`}
        >
          <div className="flex flex-1 items-center w-full">
            <CallLayout />
          </div>
          <div className="flex w-full items-center justify-center gap-5">
            <CallControls onLeave={() => router.push(`/`)} />
            <button
              className="rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]"
              onClick={() => {
                setSidebarOpen(true);
                setActiveTab('participants');
              }}
            >
              <User2></User2>
            </button>
            <button
              className="relative rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]"
              onClick={() => {
                setSidebarOpen(true);
                setActiveTab('messages');
                setHasNewMessage(false); // Mark messages as read when opening
              }}
            >
              <MessageCircle className="cursor-pointer text-gray-500" size={24} />
              {hasNewMessage && (
                <span className="absolute -top-2 -right-2 inline-flex h-3 w-3 rounded-full bg-red-400"></span>
              )}
            </button>
            <DropdownMenu>
              <div className="flex items-center">
                <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
                  <LayoutList size={20} className="text-white" />
                </DropdownMenuTrigger>
              </div>
              <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
                {['Grid', 'Speaker-Left', 'Speaker-Right'].map(
                  (item, index) => (
                    <div key={index}>
                      <DropdownMenuItem
                        onClick={() =>
                          setLayout(item.toLowerCase() as CallLayoutType)
                        }
                      >
                        {item}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="border-dark-1" />
                    </div>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <CallStatsButton />
            {!isPersonalRoom && <EndCallButton />}
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={cn(
            'bordering sidetrans fixed right-2 h-[94%]  shadow-md flex flex-col transition-all duration-400 ease-in-out',
            sidebarOpen ? 'translate-x-0' : 'max-w-0 !border-none'
          )}
          style={{ width: '25%' }}
        >
          {/* Close Button */}
          <div className="flex justify-between items-center px-4 py-2">
            <h3 className="text-lg font-medium text-white">
              {activeTab === 'participants' ? 'Participants' : 'Chat'}
            </h3>
            <button
              className="rounded-md p-1 hover:bg-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-between px-4 py-2">
            <button
              className={cn(
                'w-1/2 px-4 py-2 text-center',
                activeTab === 'participants'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
              onClick={() => setActiveTab('participants')}
            >
              Participants
            </button>
            <button
              className={cn(
                'w-1/2 px-4 py-2 text-center',
                activeTab === 'messages'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
              onClick={() => setActiveTab('messages')}
            >
              Messages
            </button>
          </div>

          {/* Tab Content */}
          <div className="trans-chat flex-1 overflow-hidden">
            {activeTab === 'participants' && (
              <div className="h-full overflow-y-auto">
                <CallParticipantsList
                  onClose={() => setActiveTab('messages')}
                />
              </div>
            )}
            {activeTab === 'messages' && (
              <ChannelProvider callId={id}>
                <Window>
                  <div className="flex flex-col h-full">
                    {/* Chat Header */}
                    {/* Message List */}
                    <div className="h-[90%] trans">
                      <MessageList />
                    </div>
                    {/* Chat Input */}
                    <div className="!px-6 flex-shrink-0">
                      <MessageInput />
                    </div>
                  </div>
                </Window>
              </ChannelProvider>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetingRoom;
