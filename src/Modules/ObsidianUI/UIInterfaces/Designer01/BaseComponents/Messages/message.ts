import type { MessageTypeTypes } from "./StaticMessageHandler.svelte";

export interface Message{
	msg:string;
	type:MessageTypeTypes;
}
export type messageList = Record<string,Message>;