// This is a buffer payload, try decrypting it
/**
check encoded_sample.payload in consts
 */

import { encodeWAM, BinaryInfo } from "../dist/wam/index.js";

import file from "../file.json" assert { type: "json" };

const {
    header: {
        wamVersion,
        sequenceNumber,
    },
    globals,
    events,
} = file;

const binaryInfo = new BinaryInfo({
    protocolVersion: wamVersion,
    sequence: sequenceNumber,
    globalAttributes: globals,
    events: events
})

const buf = encodeWAM(binaryInfo);

console.log(buf.toString("base64"))
