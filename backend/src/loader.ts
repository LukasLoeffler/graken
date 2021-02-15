import { NodeManager } from "./nodes/node-manager";
import { NodeRegistry } from "./nodes/node-registry";
import chalk from "chalk";

export class Loader {
    static loadConfig(dbo: any) {
        loadConfig(dbo);
    }
}

interface StringMap { [key: string]: string; }

let frontendNodes: any;

function getSuccessTargets(node: any) {
    let targetType = "onSuccess";
    return getConnectedNodeByInterface(node, targetType)
}

function getFailureTargets(node: any) {
    let targetType = "onFailure";
    return getConnectedNodeByInterface(node, targetType)
}



function getConnectedNodeByInterface(node: any, type: string) {
    let outInterface = node.interfaces.find((intface: any) => intface[0] === type);

    if (!outInterface) return [];

    let outConnections = frontendNodes.connections.filter((conn: any) => conn.from === outInterface[1].id);
    
    let targetNodes: any = []

    outConnections.forEach((out: any) => {
        frontendNodes.nodes.forEach((node: any) => {
            node.interfaces.forEach((intf: any) => {
                if (out.to === intf[1].id) targetNodes.push(node.id);
            });
        });
    });
    return targetNodes;
}


/**
 * Baklava holds the node options in a format not usable by backend.
 * This function takes a node as an input and extracts the options as a key-value pair usable by the backend.
 * @param node 
 */
function extractOptionsFromNode(node: any): StringMap {
    let options: Array<String> = node.options;
    let optionsArray = options.map((option: any) => {
        let optionName = option[0];
        let optionValue = option[1];
        return {
            name: optionName,
            value: optionValue
        }
    });
    // Converting array of objects into object with optionName and optionKey
    let output: StringMap = {}
    optionsArray.forEach((option) => {
        output[option.name.toLowerCase()] = option.value;
    });
    return output;
}



function loadConfig(dbo: any) {
    NodeManager.reset();
    console.log(chalk.blueBright("LOADING CONFIG"))

    let numberofTotalNodes = 0;

    dbo.collection("node-configs").find({}).toArray(function(err: any, nodes: any) {
        nodes.forEach((data: any)=> {
            frontendNodes = data;
            data.nodes.forEach((node: any) => {

                let newCls: any;
                try {
                    newCls = NodeRegistry.getNodeClassByName(node.type);

                } catch (error) {
                    console.log(`Loader: Node type ${chalk.red(node.type)} not found`);
                }
                let successTargets = getSuccessTargets(node);
                let failureTargets = getFailureTargets(node);
                let options = extractOptionsFromNode(node);
                new newCls.clss(node.name, node.id, options, successTargets, failureTargets);
            });
            numberofTotalNodes = numberofTotalNodes + data.nodes.length;
        });

        let numberOfNodesInit = NodeManager.getActiveNodes().length;
    
        if (numberOfNodesInit !== numberofTotalNodes) {
            console.log(`${chalk.redBright(numberOfNodesInit)}/${chalk.redBright(numberofTotalNodes)} nodes initalized.`)
        } else {
            console.log(`${chalk.greenBright(numberOfNodesInit)}/${chalk.greenBright(numberofTotalNodes)} nodes initalized.`)
        }
    });
}