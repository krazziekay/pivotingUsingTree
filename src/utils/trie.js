/**
 * Created by rosia on 7/4/17.
 */
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';

function Trie() {
    this.head = {
        key : '',
        depth: 0,
        // value:,
        children: {}
    }
}

Trie.prototype.add = function(key, leafNodeValue, hashKey)  {

    let curNode = this.head, newNode = null, curChar = key.slice(0,1), depthCount =1;

    key = key.slice(1);

    while(typeof curNode.children[curChar] !== "undefined" && curChar.length > 0){
        curNode = curNode.children[curChar];
        curNode.depth = depthCount;
        curChar = key.slice(0,1);
        key = key.slice(1);
        depthCount++;
    }

    while(curChar.length > 0) {
        newNode = {
            key : curChar,
            value : key.length === 0 ? leafNodeValue : undefined,
            hashKey: key.length === 0 ? hashKey : '',
            children: {}
        };

        curNode.children[curChar] = newNode;

        curNode = newNode;

        curChar = key.slice(0,1);
        key = key.slice(1);
    }
};

Trie.prototype.search = function(key) {
    let curNode = this.head, curChar = key.slice(0,1), d = 0;

    key = key.slice(1);

    while(typeof curNode.children[curChar] !== "undefined" && curChar.length > 0){
        curNode = curNode.children[curChar];
        curChar = key.slice(0,1);
        key = key.slice(1);
        d += 1;
    }

    if (curNode.value !== undefined && key.length === 0) {
        return curNode;
    } else {
        return -1;
    }
}

Trie.prototype.searchNode = function(key) {
    let curNode = this.head, curChar = key.slice(0,1);

    key = key.slice(1);

    while(typeof curNode.children[curChar] !== "undefined" && curChar.length > 0){
        curNode = curNode.children[curChar];
        curChar = key.slice(0,1);
        key = key.slice(1);
    }

    if(curNode.children) {
        return curNode.children;
    }
    else{
        return -1;
    }
}

Trie.prototype.traverse= function(depth) {
    let resArr = [];
    let curNode = this.head.children;
    recursiveTreeTraversing(curNode, depth, resArr);
    return resArr;
}

Trie.prototype.groupByNodes = (fields, nodes) => {
    let temp = {};
    nodes.map( (node) => {
        node.value.map( (record) => {
            // fields.slice(1,fields.length).map( (field) => {
            if(!temp[fields]) {
                temp[fields] = record[fields];
            }
            else{
                temp[fields] = [].concat(temp[fields]).concat(record[fields]);
            }
            // })
        } )
    })
}


Trie.prototype.getLeafNodes = function (node = '') {
    let leafNodes = [];
    let curNode = node ? node : this.head.children;
    recursiveLeafNodeTraversing(curNode, leafNodes);
    return leafNodes;
}

Trie.prototype.remove = function(key) {
    let d = this.search(key);
    if (d > -1){
        removeH(this.head, key, d);
    }
}

let removeH = (node, key, depth) => {
    if (depth === 0 && Object.keys(node.children).length === 0){
        return true;
    }

    let curChar = key.slice(0,1);

    if (removeH(node.children[curChar], key.slice(1), depth-1)) {
        delete node.children[curChar];
        if (Object.keys(node.children).length === 0) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}


//Helper functions
let recursiveTreeTraversing = (curNode, depth, resArr) => {
    Object.keys(curNode).forEach( (node) => {
        let nodeFlag = true;//Flag to stop the infinite loop
        if(curNode[node].depth === depth) {//Condition for the recursive loop to break
            resArr.push({[node]: curNode[node]});
            nodeFlag = false;
        }
        if(nodeFlag && Object.keys(curNode[node].children).length >= 1) {//Condition to check for the children of the given node
            recursiveTreeTraversing(curNode[node].children, depth, resArr);
        }

    });
}

let recursiveLeafNodeTraversing = (curNode, leafNodes) => {
    Object.keys(curNode).forEach( (node) => {
        if(Object.keys(curNode[node].children).length >= 1) {//Condition to check for the children of the given node
            recursiveLeafNodeTraversing(curNode[node].children, leafNodes);
        }
        else{
            leafNodes.push(curNode[node].value);
        }
    });
}

export default Trie;
