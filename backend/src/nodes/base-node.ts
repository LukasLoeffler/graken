var crypto = require("crypto");
import chalk from "chalk";
import { Message } from "../message";
import { NodeManager } from "../nodes/node-manager";
import { WsManager } from "../ws";
import { ExecutionCounter } from "../exec-info"

const NODE_TYPE = "BASE_NODE";


export class BaseNode {
    name: string;
    id: string;
    type: string;
    targetsSuccess: Array<any>;
    targetsFailure: Array<any>;
    outputInterfaces: Array<any>;
    running: boolean;

    constructor(name: string, type: string, id: string = "", outputInterfaces: Array<any>) {
        this.name = name;
        this.type = type;
        if (id) this.id = id;
        else this.id = crypto.randomBytes(10).toString('hex');
        this.outputInterfaces = outputInterfaces;
        this.targetsSuccess = outputInterfaces.filter((intf: any) => intf.from.name === "onSuccess");
        this.targetsFailure = outputInterfaces.filter((intf: any) => intf.from.name === "onFailure");
        this.running = true;
    }

    public toString = () : string => {
        return `${this.type} (id: ${this.id}, name: ${this.name})`;
    }

    onSuccess(payload: any, additional: any = null) {
        ExecutionCounter.incrCountType(this.id, "success");
        this.targetsSuccess.forEach(target => {
            this.sendConnectionExec(target.from.id, target.to.id);
            let message = new Message(target.from.id, target.to.id, target.from.name, target.to.name, this.id, target.from.nodeId, target.to.nodeId, payload, additional);
            NodeManager.getNodeById(target.to.nodeId).execute(message);
        });
    }

    onFailure(payload: any, additional: any = null) {
        ExecutionCounter.incrCountType(this.id, "failure");
        WsManager.sendMessage(this.buildErrorMessage(this.id));  // Red shadow pulse trigger
        this.targetsFailure.forEach(target => {
            this.sendConnectionExec(target.from.id, target.to.id);
            let message = new Message(target.from.id, target.to.id, target.from.name, target.to.name, this.id, target.from.nodeId, target.to.nodeId, payload, additional);
            NodeManager.getNodeById(target.to.nodeId).execute(message);
        });
    }

    on(trigger: string, payload: any, additional: any = null) {
        let targets =  this.outputInterfaces.filter((intf: any) => intf.from.name === trigger);
        targets.forEach(target => {
            this.sendConnectionExec(target.from.id, target.to.id);
            let message = new Message(target.from.id, target.to.id, target.from.name, target.to.name, this.id, target.from.nodeId, target.to.nodeId, payload, additional);
            NodeManager.getNodeById(target.to.nodeId).execute(message);
        });
    }

    start() {
        console.log(chalk.red("Start method not implemented for node type:", this.type));
    }

    stop() {
        //console.log(chalk.red("Stop method not implemented for node type:", this.type));
    }

    reset(): boolean {
        console.log(chalk.red("Reset method not implemented for node type:", this.type));
        return false;
    }

        /**
     * Options are generated by the frontend end therefore a source for errors.
     * This method checks the passed options of the constructor against the requiredOptions of this class.
     * @param options Passed options
     */
    validateOptions(options: any, requiredOptions: any) {
        requiredOptions.forEach((option: any) => {
            let cronExpression = options[option];
            if (!cronExpression) throw new Error(`${chalk.red(NODE_TYPE)}: Option '${option}' is not present`);
        });
    }

    /**
     * Extracts the optionValue for optionName
     * @param options 
     */
    getOption(optionName: string, options: any) {
        return options[optionName];
    }

    sendConnectionExec(fromNodeId: string, toNodeId: string): void {
        let message = {
            type: "ConnectionExecution",
            data: {
                from: fromNodeId,
                to: toNodeId
            }
        }
        WsManager.sendMessage(JSON.stringify(message));
    }

    
    buildErrorMessage(nodeId: string): string {
        let message = {
            type: "NodeExecutionError",
            data: {
                nodeId: nodeId
            }
        }
        return JSON.stringify(message);
    }
}