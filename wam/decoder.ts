import { FLAG_BYTE, FLAG_EVENT, FLAG_EXTENDED, FLAG_FIELD, FLAG_GLOBAL, WAM_EVENTS, WAM_GLOBALS } from "./utils.js";

export function deserializeBufferHeader(buffer: Buffer) {
	if (buffer.subarray(0, 3).toString("utf8") !== "WAM") throw "Invalid payload";

	let position = 3; // Start after the "WAM" string

	// Assuming the next byte after "WAM" is the protocol version
	const wamVersion = buffer.readUInt8(position++);
	// Assuming the next byte is a flag
	const flag = buffer.readUInt8(position++);
	// Assuming the next two bytes form the sequence number
	const sequenceNumber = buffer.readUInt16BE(position);
	position += 2;

	const regular = buffer.readUInt8(position) === 0;
	position += 1;

	return { header: { wamVersion, flag, sequenceNumber, regular }, position };
}

export function decodeData(buffer: Buffer) {
	let {
		header: { wamVersion, sequenceNumber, regular },
		position,
	} = deserializeBufferHeader(buffer);
	console.log(position);
	const data = [] as ReturnType<typeof deserializeData>[];
	const deserializeNextData = () => {
		const deserializedData = deserializeData(buffer, position);
		data.push(deserializedData);
		position = deserializedData.offset;
		if (position < buffer.length) {
			deserializeNextData();
		}
	};

	deserializeNextData();

	return { header: { wamVersion, sequenceNumber, regular }, position, data };
}

/**
 *
 * @param {Buffer} buffer
 * @param {*} position
 */
function deserializeData(buffer: Buffer, position: number) {
	let offset = position;
	let flag = buffer.readUint8(offset++);
	let key;

	// Determine if the key is extended (2 bytes) or not (1 byte)
	if ((flag & FLAG_BYTE) === 8) {
		key = buffer.readUint16LE(offset);
		offset += 2;
	} else {
		key = buffer.readUint8(offset++);
	}

	// Determine the type of the value
	const type = flag >> 4;
	const flagType = flag & 0x07;
	// extended event = 6, 0 global, 1, 2, ...

	let value;

	switch (type) {
		case 0:
			value = null;
			break;
		case 1:
		case 2:
			value = type - 1;
			break;
		case 3:
			value = buffer.readUInt8(offset);
			offset += 1;
			break;
		case 4:
			value = buffer.readUInt16LE(offset);
			offset += 2;
			break;
		case 5:
			value = buffer.readUInt32LE(offset);
			offset += 4;
			break;
		case 7:
			value = buffer.readFloatLE(offset);
			offset += 8;
			break;
		case 8:
		case 9:
		case 10:
			let length;
			if (type === 8) {
				length = buffer.readUint8(offset++);
			} else if (type === 9) {
				length = buffer.readUint16LE(offset);
				offset += 2;
			} else {
				// type === 10
				length = buffer.readUint32LE(offset);
				offset += 4;
			}
			value = buffer.toString("utf8", offset, offset + length);
			offset += length;
			break;
		default:
			throw new Error("Unknown value type");
	}

	return {
		key,
		value,
		offset,
		type,
		flag,
		position,
		flagType:
			flagType === 0
				? "global"
				: flagType === 1
				? "event"
				: flagType === 2
				? "field"
				: flagType === 5
				? "ext_event"
				: flagType === 6
				? "ext_field"
				: "unknown",
	};
}
