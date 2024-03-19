// This is a buffer payload, try decrypting it
/**
check encoded_sample.payload in consts
 */

import { decodeData, WAM_EVENTS, WAM_GLOBALS } from "../dist/wam/index.js";
import { readFileSync, writeFileSync } from "fs";

const test = false
const buf = readFileSync(test ? "./test_encode.payload" : "./test_extract.payload")
const { header, data } = decodeData(buf);

const events = []
let dirtyGlobals = {}
for (const { key, value, flagType } of data) {
    if (flagType == "global") {
        const field = Object.values(WAM_GLOBALS).find((a) => a.id === key) || [];
        const fieldValue = field.type === "boolean" ? value === 1 ? true : false : value
        dirtyGlobals[field.name] = fieldValue
    } else if (flagType == "event" || flagType == "ext_event") {
        const event = WAM_EVENTS.find(a => a.id === key);
        events.push({ name: event.name, props: [], weight: -value, id: event.id, globals: dirtyGlobals })
        dirtyGlobals = {}
    } else if (flagType == "field" || flagType == "ext_field") {
        const lastEvent = events[events.length - 1];
        const event = WAM_EVENTS.find(a => a.id === lastEvent.id);
        const [name, [id, fieldType]] = Object.entries(event.props).find(([ki, val]) => val[0] === key) || [];

        events[events.length - 1].props.push({
            key: name || "unknown!!",
            value: fieldType === "boolean" ? value === 1 ? true : false : value
        })
    }
}
const events_ = [];
let i = 0;
for (const { name, props, globals } of events) {
    events_[i] = { [name]: { props: {}, globals } };
    for (const { key, value } of props) {
        events_[i][name].props[key] = value
    }
    i++;
}

const bigIntEncoder = (key,value) => {
    if (typeof value == "bigint") {
        return "BIGINT_"+value.toString()+"_T"
    }
    return value;
};

writeFileSync(
    "./file"+ (test ? "_b" : "") +".json",
    JSON.stringify(
        { header, events: events_, }, 
        bigIntEncoder, 
        2
    )
)
writeFileSync("./data"+ (test ? "_b" : "") +".json", JSON.stringify(data, bigIntEncoder, 2))


