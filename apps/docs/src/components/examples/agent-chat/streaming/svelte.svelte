<!-- apps/docs/src/components/examples/agent-chat/streaming/svelte.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { AgentChat, AgentStreamingMessage, ChatInput, ChatThread, useAgenticChat } from '@cloudvoyant/vortex-svelte';

  const LOREM_LINES = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    'Nisi ut aliquip ex ea commodo consequat duis aute irure dolor.',
    'In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  ];

  const chat = useAgenticChat();
  let timer: ReturnType<typeof setInterval> | undefined;

  onMount(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  });

  function handleSend(text: string) {
    chat.addMessage({ id: crypto.randomUUID(), variant: 'user', content: text });
    chat.dispatch({ type: 'start' });
    const words = LOREM_LINES.join(' ').split(' ');
    let index = 0;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      index += 2;
      chat.setStreamingText(words.slice(0, index).join(' '));
      if (index >= words.length) {
        clearInterval(timer);
        chat.dispatch({ type: 'done', id: crypto.randomUUID() });
      }
    }, 120);
  }

  function loadHistory() {
    chat.prependMessages([{ id: crypto.randomUUID(), variant: 'default', content: '— earlier history —', from: 'Sam' }]);
  }
</script>

<AgentChat {chat} class="h-72">
  <ChatThread variant="minimal" messages={chat.state.messages} virtual onScrollTop={loadHistory} />
  <AgentStreamingMessage />
  <ChatInput onSend={handleSend} />
</AgentChat>
