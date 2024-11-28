'use client';
import { useState } from 'react';
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
import { Users, LayoutList } from 'lucide-react';

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

import { Window, ChannelHeader, MessageList, MessageInput, Thread, LoadingIndicator } from 'stream-chat-react';
import ChannelProvider from '@/providers/ChannelProvider';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const {id} = useParams()
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();

  // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
  const callingState = useCallCallingState();

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
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className=" flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>

        <ChannelProvider callId={id}>
              <Window>
                <ChannelHeader/>
                <MessageList/>
                <MessageInput/>
              </Window>
          </ChannelProvider>
      </div>
      {/* video layout and call controls */}
      <div className="fixed left-0 bottom-0 flex w-[600px] items-center justify-center gap-5">
        <CallControls onLeave={() => router.push(`/`)} />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
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
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton />
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
            <Users size={20} className="text-white" />
          </div>
        </button>
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;

// 'use client';
// import { useState } from 'react';
// import {
//   CallControls,
//   CallParticipantsList,
//   CallStatsButton,
//   CallingState,
//   PaginatedGridLayout,
//   SpeakerLayout,
//   useCallStateHooks,
// } from '@stream-io/video-react-sdk';
// import { useParams, useRouter, useSearchParams } from 'next/navigation';
// import { Users, LayoutList } from 'lucide-react';

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from './ui/dropdown-menu';
// import Loader from './Loader';
// import EndCallButton from './EndCallButton';
// import { cn } from '@/lib/utils';

// import { Window, ChannelHeader, MessageList, MessageInput } from 'stream-chat-react';
// import ChannelProvider from '@/providers/ChannelProvider';

// type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

// const MeetingRoom = () => {
//   const {id} = useParams()
//   const searchParams = useSearchParams();
//   const isPersonalRoom = !!searchParams.get('personal');
//   const router = useRouter();
//   const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
//   const [showParticipants, setShowParticipants] = useState(false);
//   const [activeTab, setActiveTab] = useState<'participants' | 'messages'>('participants');
//   const { useCallCallingState } = useCallStateHooks();

//   // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
//   const callingState = useCallCallingState();

//   if (callingState !== CallingState.JOINED) return <Loader />;

//   const CallLayout = () => {
//     switch (layout) {
//       case 'grid':
//         return <PaginatedGridLayout />;
//       case 'speaker-right':
//         return <SpeakerLayout participantsBarPosition="left" />;
//       default:
//         return <SpeakerLayout participantsBarPosition="right" />;
//     }
//   };

//   return (
//     <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
//       <div className="relative flex size-full items-center justify-center">
//         <div className=" flex size-full max-w-[1000px] items-center">
//           <CallLayout />
//         </div>
//         {/* Sidebar */}
//         <div className="h-[550px] w-1/4 bg-gray-800 shadow-md mb-[100px]">
//           <div className="flex justify-between px-4 py-2 bg-gray-900">
//             <button
//               className={cn(
//                 'px-4 py-2 text-white',
//                 activeTab === 'participants' && 'bg-gray-700 rounded'
//               )}
//               onClick={() => setActiveTab('participants')}
//             >
//               Participants
//             </button>
//             <button
//               className={cn(
//                 'px-4 py-2 text-white',
//                 activeTab === 'messages' && 'bg-gray-700 rounded'
//               )}
//               onClick={() => setActiveTab('messages')}
//             >
//               Messages
//             </button>
//           </div>
//           <div className="overflow-y-auto h-full">
//             {activeTab === 'participants' && (
//               <CallParticipantsList onClose={() => {}} />
//             )}
//             {activeTab === 'messages' && (
//               <ChannelProvider callId={id}>
//                 <Window>
//                   <ChannelHeader />
//                   <MessageList />
//                   <MessageInput />
//                 </Window>
//               </ChannelProvider>
//             )}
//           </div>
//         </div>
//       </div>
//       {/* video layout and call controls */}
//       <div className="fixed left-0 bottom-0 flex w-[600px] items-center justify-center gap-5">
//         <CallControls onLeave={() => router.push(`/`)} />

//         <DropdownMenu>
//           <div className="flex items-center">
//             <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
//               <LayoutList size={20} className="text-white" />
//             </DropdownMenuTrigger>
//           </div>
//           <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
//             {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
//               <div key={index}>
//                 <DropdownMenuItem
//                   onClick={() =>
//                     setLayout(item.toLowerCase() as CallLayoutType)
//                   }
//                 >
//                   {item}
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator className="border-dark-1" />
//               </div>
//             ))}
//           </DropdownMenuContent>
//         </DropdownMenu>
//         <CallStatsButton />
//         <button onClick={() => setShowParticipants((prev) => !prev)}>
//           <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
//             <Users size={20} className="text-white" />
//           </div>
//         </button>
//         {!isPersonalRoom && <EndCallButton />}
//       </div>
//     </section>
//   );
// };

// export default MeetingRoom;
