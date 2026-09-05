import { describe, it, expect } from 'vitest';
import {
  agenticChatReducer,
  initialAgenticChatState,
  chatBubbleVariants,
  chatRowVariants,
} from '@cloudvoyant/vortex-ui';

const userMessage = { id: 'u1', variant: 'user' as const, content: 'hello' };

describe('agenticChatReducer', () => {
  it('starts in the initial state', () => {
    expect(initialAgenticChatState).toEqual({ messages: [], pending: '', status: 'idle' });
  });

  it('start arms waiting and clears a stale error', () => {
    const failed = agenticChatReducer(initialAgenticChatState, { type: 'fail', error: 'boom' });
    const restarted = agenticChatReducer(failed, { type: 'start' });
    expect(restarted.status).toBe('waiting');
    expect(restarted.error).toBeUndefined();
  });

  it('delta appends text and promotes waiting to streaming', () => {
    let state = agenticChatReducer(initialAgenticChatState, { type: 'start' });
    state = agenticChatReducer(state, { type: 'delta', text: 'Hel' });
    state = agenticChatReducer(state, { type: 'delta', text: 'lo' });
    expect(state.pending).toBe('Hello');
    expect(state.status).toBe('streaming');
  });

  it('delta promotes retrying back to streaming', () => {
    let state = agenticChatReducer(initialAgenticChatState, { type: 'start' });
    state = agenticChatReducer(state, { type: 'delta', text: 'par' });
    state = agenticChatReducer(state, { type: 'fail', error: 'drop' });
    state = agenticChatReducer(state, { type: 'retry' });
    state = agenticChatReducer(state, { type: 'delta', text: 'tial' });
    expect(state.status).toBe('streaming');
    expect(state.pending).toBe('partial');
  });

  it('fail cancels and records the error but keeps partial text', () => {
    let state = agenticChatReducer(initialAgenticChatState, { type: 'start' });
    state = agenticChatReducer(state, { type: 'delta', text: 'par' });
    state = agenticChatReducer(state, { type: 'fail', error: 'drop' });
    expect(state.status).toBe('cancelled');
    expect(state.error).toBe('drop');
    expect(state.pending).toBe('par');
  });

  it('done commits pending as an agent message and completes', () => {
    let state = agenticChatReducer(initialAgenticChatState, { type: 'start' });
    state = agenticChatReducer(state, { type: 'delta', text: 'answer' });
    state = agenticChatReducer(state, { type: 'done', id: 'a1' });
    expect(state.messages).toEqual([{ id: 'a1', variant: 'agent', content: 'answer' }]);
    expect(state.pending).toBe('');
    expect(state.status).toBe('completed');
  });

  it('done with empty pending completes without adding a message', () => {
    const state = agenticChatReducer(initialAgenticChatState, { type: 'done', id: 'a2' });
    expect(state.messages).toEqual([]);
    expect(state.status).toBe('completed');
  });

  it('add appends and prepend inserts before existing messages', () => {
    let state = agenticChatReducer(initialAgenticChatState, { type: 'add', message: userMessage });
    state = agenticChatReducer(state, {
      type: 'prepend',
      messages: [
        { id: 'h1', variant: 'default', content: 'earlier' },
        { id: 'h2', variant: 'default', content: 'earliest' },
      ],
    });
    expect(state.messages.map((m) => m.id)).toEqual(['h1', 'h2', 'u1']);
  });

  it('status and pending set their fields directly', () => {
    let state = agenticChatReducer(initialAgenticChatState, { type: 'status', status: 'cancelled' });
    state = agenticChatReducer(state, { type: 'pending', text: 'raw' });
    expect(state.status).toBe('cancelled');
    expect(state.pending).toBe('raw');
  });

  it('never mutates the previous state', () => {
    const before = agenticChatReducer(initialAgenticChatState, { type: 'add', message: userMessage });
    const snapshot = [...before.messages];
    agenticChatReducer(before, { type: 'delta', text: 'x' });
    agenticChatReducer(before, { type: 'done', id: 'a3' });
    expect(before.messages).toEqual(snapshot);
    expect(before.pending).toBe('');
  });
});

describe('chat variants', () => {
  it('ios floats user rows right and leaves others left', () => {
    expect(chatRowVariants({ variant: 'ios', role: 'user' })).toContain('justify-end');
    expect(chatRowVariants({ variant: 'ios', role: 'agent' })).not.toContain('justify-end');
    expect(chatRowVariants({ variant: 'slack', role: 'user' })).not.toContain('justify-end');
  });

  it('styles the user bubble with the accent in slack and ios, transparently in minimal', () => {
    expect(chatBubbleVariants({ variant: 'slack', role: 'user' })).toContain('bg-primary');
    expect(chatBubbleVariants({ variant: 'ios', role: 'user' })).toContain('bg-primary');
    const minimal = chatBubbleVariants({ variant: 'minimal', role: 'user' });
    expect(minimal).not.toMatch(/bg-(primary|muted|card)/);
    expect(minimal).not.toContain('border');
    expect(minimal).not.toContain('rounded-2xl');
  });
});
