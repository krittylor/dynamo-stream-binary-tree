let nodes = [];
const limits = [1, 10, 100, 1000];
const maxLimit = limits[limits.length - 1];
function getRelatedAbove(node){
    if(node.relatedAbove){
        for(let i = 0; i < nodes.length; i++)
            if(nodes[i].uniqueId === node.relatedAbove)
                return nodes[i];
    }
}

function getNodeFromId(uniqueId){
    for(let i = 0; i < nodes.length; i++)
        if(nodes[i].uniqueId === uniqueId)
            return nodes[i];
    return null;
}

function getLimit(leftCount, rightCount) {
    for (let i = 0; i < limits.length; i++) {
        if (leftCount <= limits[i] && rightCount <= limits[i]) {
            if (leftCount === rightCount && leftCount === limits[i]) {
                if (limits.length === i + 1)
                    return -1;
                else
                    return limits[i + 1];
            }
            return limits[i];
        }
    }
    return limits[0];
}

const PositionType = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT'
};

/**
 * Returns { positionType, directParent }
 * @param relatedAbove - The related parent node that shows by who the node is introduced
 */
function getNewPosition(uniqueId){
    const node = getNodeFromId(uniqueId);
    const leftCount = node.relatedLeftCount;
    const rightCount = node.relatedRightCount;

    // Get limit of current subtree
    const limit = getLimit(leftCount, rightCount);

    //Exceeded limit of max
    if(limit === -1)
        return null;
    /**
     * If limit is 1, return empty side of current node
     */
    if(limit === 1){
        if(leftCount === 0)
            return { position: PositionType.LEFT, directAbove: uniqueId};
        else if(rightCount === 0)
            return { position: PositionType.RIGHT, directAbove: uniqueId};
    }

    /**
     * There are 3 kinds of subtrees
     * 1. Left is full, right is free - will choose right
     * 2. Right is full, left is free - will choose left
     * 3. Both of them are free - will choose left
     */

    if(leftCount === limit && rightCount < limit){
        return getNewPosition(node.relatedRight);
    }
    else if(rightCount === limit && leftCount < limit){
        return getNewPosition(node.relatedLeft);
    }
    else {
        return getNewPosition(node.relatedLeft);
    }
}

function addNode(node){

    //Check left or right in tree
    //Only check if it's not root
    if(nodes.length > 0) {
        let parentNode = getNodeFromId(node.relatedAbove);
        let path = parentNode.path;
        let leftCount = nodes[0].relatedLeftCount;
        let rightCount = nodes[0].relatedRightCount;
        //If parent is not root node, check availability.
        if (path.length >= 2) {
            if (path[1] === '0' && leftCount === maxLimit)
                return console.log("Oops, left subtree is full!")
            if (path[1] === '1' && rightCount === maxLimit)
                return console.log("Oops, right subtree is full!")
        }
    }

    let newNode = Object.assign({}, node, {
        directAbove: null,
        path: "1",
        relatedLeft: null,
        relatedLeftCount: 0,
        relatedRight: null,
        relatedRightCount: 0
    });
    //Determine this is the first node
    if(nodes.length === 0){
        nodes.push(newNode);
        return;
    }

    //Get new position
    let pos = getNewPosition(newNode.relatedAbove);

    //Limit exceeded
    if(!pos)
        return console.log("Limit exceeded!");
    let directAboveNode = getNodeFromId(pos.directAbove);

    newNode.path = directAboveNode.path + (pos.position === PositionType.LEFT ? '0' : '1');
    newNode.directAbove = pos.directAbove;

    nodes.push(newNode);

    /* Update parent nodes */

    //Update direct above node
    if(pos.position === PositionType.LEFT){
        directAboveNode.relatedLeft = newNode.uniqueId;
    } else if(pos.position === PositionType.RIGHT){
        directAboveNode.relatedRight = newNode.uniqueId;
    }

    //Save directNode to database

    //Update related above nodes(relatedLeftCount, relatedRightCount)
    let current = newNode;
    while(true){
        if(current.directAbove === null)
            break;
        let directAbove = getNodeFromId(current.directAbove);
        //Determine current node is in left or right of directAbove
        if(directAbove.relatedLeft === current.uniqueId)
            directAbove.relatedLeftCount++;
        if(directAbove.relatedRight === current.uniqueId)
            directAbove.relatedRightCount++;

        //Store directAbove node

        current = directAbove;
    }
}

addNode({uniqueId: "0"});
for(let i = 1; i <= 25; i++)
    addNode({uniqueId: i + "", relatedAbove: "0"})
for(let i = 26; i <= 1300; i++)
    addNode({uniqueId: i + "", relatedAbove: "13"})