// This is a buffer payload, try decrypting it
/**
check encoded_sample.payload in consts
 */

import { readFileSync, writeFileSync } from "fs";
import { encodeWAM, BinaryInfo } from "../dist/wam/index.js";

const fileJson = readFileSync("./file.json", "utf-8")
const file = JSON.parse(fileJson, (key,value) => {
    if (typeof value == "string" && value.startsWith("BIGINT_") && value.endsWith("_T")) {
        return value.split("_")[1];
    }
    return value
})
const {
    header: {
        wamVersion,
        sequenceNumber,
    },
    events,
} = file;

const binaryInfo = new BinaryInfo({
    protocolVersion: wamVersion,
    sequence: sequenceNumber,
    events: events
})

const buf = encodeWAM(binaryInfo);

writeFileSync("./test_encode.payload", buf);
console.log(buf.toString("base64"))
