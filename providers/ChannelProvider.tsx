import Loader from '@/components/Loader';
import { useUser } from '@clerk/nextjs';
import React, { ReactNode, useEffect, useState } from 'react';
import { Channel as type } from 'stream-chat';
import { Channel } from 'stream-chat-react';
import { useChatContext } from 'stream-chat-react';

const ChannelProvider = ({ callId, children }: { callId: any, children: ReactNode }) => {
    const [channel, setChannel] = useState<type | null>(null);
    const { client } = useChatContext();
    const { user } = useUser();

    useEffect(() => {
        if (!client || !user?.id || !callId) {
            console.log("Missing necessary data: client, user.id, or callId");
            return;
        }

        async function init() {
            try {
                console.log('Initializing channel with callId:', callId, 'userId:', user?.id);

                // Fetch or create the channel
                const channel = client.channel('messaging', callId, {
                    name: `Meeting - ${callId}`, // Descriptive name for the channel
                });

                // Watch the channel
                await channel.watch();
                console.log('Channel initialized successfully:', channel);

                // Add the user to the channel if not already a member
                if (!channel.state.members[user?.id || '']) {
                    await channel.addMembers([user?.id || '']);
                    console.log(`Added user ${user?.id} to the channel`);
                }

                setChannel(channel);
            } catch (error) {
                console.error('Error initializing channel:', error);
            }
        }

        init();
    }, [callId, client, user?.id]);

    // If the channel is not initialized, show a loader
    if (!channel) {
        return <Loader />;
    }

    return (
        <Channel channel={channel}>
            {children}
        </Channel>
    );
};

export default ChannelProvider;
