import events from "../consts/events.js";
import global from "../consts/global_attributes.js";

export const WAM_EVENTS = events;
export const WAM_GLOBALS = global;

export const FLAG_BYTE = 8,
	FLAG_GLOBAL = 0,
	FLAG_EVENT = 1,
	FLAG_FIELD = 2,
	FLAG_EXTENDED = 4;

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
type TypeOfString<A> = A extends "string"
	? string
	: A extends "number"
	? number
	: A extends "boolean"
	? boolean
	: A extends object // get value of object
	? A extends { [key: string]: infer T }
		? T
		: never
	: never;

export type Event = ArrayElement<typeof WAM_EVENTS>;
type EventByName<T extends Event["name"]> = Extract<Event, { name: T }>;

export type EventType = {
	[key in Event["name"]]: {
		commitTime: number;
		sequenceNumber: number;
		props: {
			// @ts-ignore
			[k in keyof EventByName<key>["props"]]: any;
		};
	};
} & {};
