import { Message } from "../../message";
import { BaseNode } from "../base-node";
import { NodeManager } from "../node-manager";
import { format } from 'date-fns'
var _ = require('lodash');


const NODE_TYPE = "OBJECT_MAPPER"

export class ObjectMapperNode extends BaseNode {
    mapper: any;
    lastValue: any = {};

    constructor(name: string, id: string, options: any, targetsSuccess: Array<string>, targetsFailure: Array<string>) {
        super(name, NODE_TYPE, id, targetsSuccess, targetsFailure);

        this.mapper = options.mapping.mappings;
        NodeManager.addNode(this);
    }

    execute(msgIn: Message) {
        this.lastValue = msgIn.payload;
        let newObject = mapObject(msgIn.payload, this.mapper);
        let msgOut = new Message(this.id, NODE_TYPE, newObject);
        this.onSuccess(msgOut);
    }

    getLastValue() {
        if (Array.isArray(this.lastValue)) {
            return this.lastValue.slice(0, 10);
        }
        return this.lastValue;
    }

    test(mapping: any) {
        if (Array.isArray(this.lastValue)) {
            return mapObject(this.lastValue.slice(0, 10), mapping);
        }
        return mapObject(this.lastValue, mapping);
    }
}

function setCustomTime(mapper: any, newObject: object) {
    try {
        let timeCode = mapper.source.replace("{{time-", "").replace("}}", "");  // Extract time code
        let datetimeStringOut = format(new Date(), timeCode)
        _.set(newObject, mapper.target, datetimeStringOut);
    } catch {
        _.set(newObject, mapper.target, "Wrong encoding");
    }
}


export function mapObject(input_object: any, mapping: any, mode = "explicit") {
    let newObject = {};
    if (mode == "implicit") {
        newObject = input_object;
    }
    mapping.forEach((mapper: any) => {
        if (mapper.source.includes("'")) {
            // If source is string set string as value
            _.set(newObject, mapper.target, mapper.source.replace(/'/g, ''));
        } else if (mapper.source.includes("{{time}}")) {
            //check for {{time}} only temporary until a better concept is implemented
            _.set(newObject, mapper.target, new Date());
        } else if (mapper.source.includes("{{time-")) {
            setCustomTime(mapper, newObject);
        } else if (mapper.source.includes("{{payload}}")) {
            _.set(newObject, mapper.target, input_object);
        } else {
            // If source is path set origin as value
            _.set(newObject, mapper.target, _.get(input_object, mapper.source));
        }

        if (mode === "implicit") {
            _.set(input_object, mapper.source, undefined);
        }
    });
    return newObject;
}
