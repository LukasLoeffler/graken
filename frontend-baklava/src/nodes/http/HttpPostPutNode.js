import { Node } from "@baklavajs/core";


export default class HttpPostPutNode extends Node {
    type = "httpPostPut";
    name = "HTTP POST/PUT";

    constructor() {
        super();
        this.addInputInterface("Payload");
        this.addOutputInterface("onSuccess");
        this.addOutputInterface("onFailure");
        this.addOption("settings", "HttpPostPutDialog", {url: "google.de", requestType: "POST", headers: []});
        this.addOption("color", undefined, "#ad173a");
        this.addOption("running", undefined, true);
    }
}