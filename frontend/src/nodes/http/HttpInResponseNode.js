import { Node } from "@baklavajs/core";


export default class HttpInResponseNode extends Node {
    type = "http-in-response";
    name = "HTTP In Response";

    constructor() {
        super();
        this.addInputInterface("onTrigger")
        this.addOption("color", undefined, "#ad173a");
        this.addOption("running", undefined, true);
    }
}