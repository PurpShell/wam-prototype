// This is a buffer payload, try decrypting it
/**
check encoded_sample.payload in consts
 */

import { decodeData, WAM_EVENTS, WAM_GLOBALS } from "../dist/wam/index.js";
import { readFileSync, writeFileSync } from "fs";

const test = false
const buf = readFileSync(test ? "./test.payload" : "./bigger.payload")
const { header, data } = decodeData(buf);

const events = []
const globals = {}
for (const { key, value, flagType } of data) {
    if (flagType == "global") {
        const field = Object.values(WAM_GLOBALS).find((a) => a.id === key) || [];
        const fieldValue = field.type === "boolean" ? value === 1 ? true : false : value
        if (field.type === "integer") console.log(value)
        if (field.name) {
            if (field.name == "commitTime" || field.name == "sequenceNumber") {
                if (!globals[field.name]) globals[field.name] = new Map();
                globals[field.name].set(globals[field.name].size, fieldValue)
            } else {
                globals[field.name] = fieldValue
            }
        }
    } else if (flagType == "event" || flagType == "ext_event") {
        const event = WAM_EVENTS.find(a => a.id === key);
        events.push({ name: event.name, props: [], weight: -value, id: event.id })
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

globals.commitTime = Object.fromEntries(Array.from(globals.commitTime.entries()))
globals.sequenceNumber = Object.fromEntries(Array.from(globals.sequenceNumber.entries()))

console.log(globals)
const events_ = [];
let i = 0;
for (const { name, props } of events) {
    events_[i] = { [name]: { props: {} } };
    for (const { key, value } of props) {
        events_[i][name].props[key] = value
    }

    if (i > 0) {
        events_[i][name].commitTime = globals.commitTime[i]
        events_[i][name].sequenceNumber = globals.sequenceNumber[i]
    }
    i++;
}

globals.commitTime = globals.commitTime[0];
globals.sequenceNumber = globals.sequenceNumber[0];

//console.log(data)
writeFileSync("./file.json", JSON.stringify({ header, globals, events: events_, }, null, 2))
writeFileSync("./data.json", JSON.stringify(data, null, 2))


