/**
 * Created by rosia on 7/4/17.
 **/


function Trie() {
    this.head = {
        key : '',
        depth: 0,
        // value:,
        children: {}
    }
}

Trie.prototype.add = function(key, leafNodeValue, hashKey)  {
    let curNode = this.head, newNode = null, curChar = key.slice(0,1);
    let depthCount  = 1 ;
    key = key.slice(1);

    while(typeof curNode.children[curChar] !== 'undefined' && curChar.length > 0){
        if(curNode.children[curChar].value) {
            curNode.children[curChar].value = [].concat(curNode.children[curChar].value).concat(leafNodeValue);
        }
        curNode = curNode.children[curChar];
        depthCount = curNode.depth + 1;
        curChar = key.slice(0,1);
        key = key.slice(1);
    }

    while(curChar.length > 0) {
        newNode = {
            key : curChar,
            value : key.length === 0 ? leafNodeValue : undefined,
            hashKey: key.length === 0 ? hashKey : '',
            depth: depthCount,
            children: {}
        };

        curNode.children[curChar] = newNode;
        curNode = newNode;
        depthCount++;
        curChar = key.slice(0,1);
        key = key.slice(1);
    }
};

/**
 * Depth First Search Traversal
 * Done by using recursion
 **/
Trie.prototype.traverse= function(depth) {
    let resArr = [];
    let curNode = this.head.children;
    recursiveTreeTraversing(curNode, depth, resArr);
    return resArr;
}

/**
 * Also done by using recursion
 **/
Trie.prototype.getLeafNodes = function (node = '', valueFields) {
    let leafNodes = [];
    let curNode = node ? node : this.head.children;
    recursiveLeafNodeTraversing(curNode, leafNodes, valueFields);
    return leafNodes;
}

/**
 * Recursive functions
 */
/**
 * This function traverses according to the depth
 * @param curNode
 * @param depth
 * @param resArr
 */
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

/**
 * This function traverses to the leaf node to get the leafNode Values
 * @param curNode
 * @param leafNodes
 * @param valueFields
 */
let recursiveLeafNodeTraversing = (curNode, leafNodes, valueFields) => {
    Object.keys(curNode).forEach( (node) => {
        if(Object.keys(curNode[node].children).length >= 1) {//Condition to check for the children of the given node
            recursiveLeafNodeTraversing(curNode[node].children, leafNodes, valueFields);
        }
        else{
            if(Array.isArray(curNode[node].value)) {
                let combinedValueObj = curNode[node].value[0];
                (curNode[node].value).slice(1).map( leaf => {
                    valueFields.map( eachField => {
                        combinedValueObj[eachField] = parseFloat(combinedValueObj[eachField]) + parseFloat(leaf[eachField]) ;
                    })
                });
                leafNodes.push(combinedValueObj);
            }
            else {
                leafNodes.push(curNode[node].value);
            }
        }
    });
}

export default Trie;
