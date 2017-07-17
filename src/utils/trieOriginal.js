/**
 * Created by rosia on 7/4/17.
 */
function Trie() {
    this.head = {
        key : '',
        children: {}
    }
}

Trie.prototype.add = function(key, leafNodeValue)  {

    let curNode = this.head, newNode = null, curChar = key.slice(0,1);

    key = key.slice(1);

    while(typeof curNode.children[curChar] !== "undefined" && curChar.length > 0){
        curNode = curNode.children[curChar];
        curChar = key.slice(0,1);
        key = key.slice(1);
    }

    while(curChar.length > 0) {
        newNode = {
            key : curChar,
            value : key.length === 0 ? leafNodeValue : undefined,
            children : {}
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
        return curNode.value;
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

Trie.prototype.traverse= function(tree, key) {
    console.log("Get the nodes from here: ", key);

}

Trie.prototype.remove = function(key) {
    let d = this.search(key);
    if (d > -1){
        removeH(this.head, key, d);
    }
}

let removeH = function(node, key, depth) {
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

export default Trie;
