import { BaseNode } from "../base-node";
import { NodeManager } from "../../nodes/node-manager";
import { Message } from "../../message";
const fs = require('fs');
const converter = require('json-2-csv');

const NODE_TYPE = "FILE_SAVE"



export class FileSaveNode extends BaseNode {
    fileName: string;
    fileType: string;
    filePath: string;
    constructor(name: string, id: string, options: any, outputConnections: Array<any> = []) {
        super(name, NODE_TYPE, id, outputConnections);

        this.fileName = this.getOption("filename", options);
        this.fileType = this.getOption("filetype", options);
        this.filePath = this.getOption("path", options);
        NodeManager.addNode(this);
    }

    execute(msg: Message) {
        let payload = msg.payload;
        let datetime = new Date().toISOString().replace(/:/g, "-")
        let file = `${this.filePath}/${this.fileName}-${datetime}.${this.fileType}`

        // FileType JSON: saving json
        if (this.fileType === "json") {
            fs.writeFile(file, JSON.stringify(payload,  null, 4),  (err: any) => {
                if (err) {
                    this.onFailure(err, msg.additional);
                } else {
                    this.onSuccess(payload, msg.additional);
                }
            });
        } else if (this.fileType === "csv") {
            this.writeToCsv(payload, file, msg);
        } else {
            fs.writeFile(file, payload,  (err: any) => {
                if (err) {
                    this.onFailure(err, msg.additional);
                } else {
                    this.onSuccess(payload, msg.additional);
                }
            });
        }
    }


    writeToCsv(payload: any, filePath: string, msg: Message) {
        converter.json2csv(payload, (err: any, csv: any) => {
            if (err) {
                throw err;
            }
            // write CSV to a file
            fs.writeFileSync(filePath, csv);
            this.onSuccess(csv, msg.additional);
        });
    }
}