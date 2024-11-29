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

  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [activeTab, setActiveTab] = useState<'participants' | 'messages'>(
    'participants'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();

  useEffect(() => {
    if (!client) return;

    const handleNotification = () => {
      setHasNewMessage(true);
    };

    const handleMarkRead = () => {
      setHasNewMessage(false);
    };

    client.on('notification.message_new', handleNotification);
    client.on('notification.mark_read', handleMarkRead);

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
    <section className="relative h-screen w-full text-white !overflow-hidden">
      <div className="relative flex flex-col h-full w-full justify-center md:flex-row">
        {/* Main Content Area */}
        <div
          className={`pt-2 h-full flex flex-col items-center justify-between flex-1 w-full max-w-[1000px] transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'md:mr-[20rem]' : 'md:mr-20'
          }`}
        >
          <div className="flex flex-1 items-center w-full">
            <CallLayout />
          </div>
          {/* Call Controls */}
          <div className="flex w-full items-center justify-center gap-3 py-2 md:py-0 md:gap-5 bg-black md:bg-transparent">
            <CallControls onLeave={() => router.push(`/`)} />
            <button
              className="rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]"
              onClick={() => {
                setSidebarOpen(true);
                setActiveTab('participants');
              }}
            >
              <User2 />
            </button>
            <button
              className="relative rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]"
              onClick={() => {
                setSidebarOpen(true);
                setActiveTab('messages');
                setHasNewMessage(false);
              }}
            >
              <MessageCircle className="cursor-pointer text-gray-500" size={24} />
              {hasNewMessage && (
                <span className="absolute -top-2 -right-2 inline-flex h-3 w-3 rounded-full bg-red-400"></span>
              )}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
                <LayoutList size={20} className="text-white" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
                {['Grid', 'Speaker-Left', 'Speaker-Right'].map(
                  (item, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() =>
                        setLayout(item.toLowerCase() as CallLayoutType)
                      }
                    >
                      {item}
                    </DropdownMenuItem>
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
    'fixed top-0 right-0 h-full w-full md:w-[25%]  shadow-md flex flex-col transition-transform duration-300 ease-in-out',
    sidebarOpen ? 'translate-x-0' : 'translate-x-full'
  )}
>
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

  <div className="flex-1 overflow-y-auto">
    {activeTab === 'participants' && (
      <div className="h-full overflow-y-auto">
        <CallParticipantsList onClose={() => setActiveTab('messages')} />
      </div>
    )}
    {activeTab === 'messages' && (
      <ChannelProvider callId={id}>
        <Window>
          <MessageList />
          <MessageInput />
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
