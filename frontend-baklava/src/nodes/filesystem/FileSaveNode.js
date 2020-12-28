import { Node } from "@baklavajs/core";


export default class FileSaveNode extends Node {
    type = "fileSave";
    name = "FileSave";

    constructor() {
        super();
        this.addInputInterface("Payload")
        this.addOption("Path", "InputOption")
        this.addOption("Filename", "InputOption", "example")
        this.addOption("Filetype", "SelectOption", "json", undefined, {
            items: [ "json", "csv"]
        })
    }

    save() {
        const state = super.save();
        state.interfaces.forEach(([name, intfState]) => {
            intfState.isInput = this.getInterface(name).isInput;
        });
        return state;
    }

    load(state) {
        state.interfaces.forEach(([name, intfState]) => {
            const intf = intfState.isInput ? this.addInputInterface(name) : this.addOutputInterface(name);
            intf.id = intfState.id;
        });
        super.load(state);
    }
}