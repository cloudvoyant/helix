import type { ChatVariant } from '@cloudvoyant/vortex-ui';

export const CHAT_CONTEXT = Symbol('vortex-chat');
export type ChatContextValue = { variant: ChatVariant };
