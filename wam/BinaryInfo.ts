import { EventType, type WAM_GLOBALS } from "./utils.js";

export class BinaryInfo {
	protocolVersion = 5;
	sequence = 0;
	events = [] as EventType[];
	buffer: Buffer[] = [];

	constructor(options: Partial<BinaryInfo> = {}) {
		Object.assign(this, options);
	}
}
