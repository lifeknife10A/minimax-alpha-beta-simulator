export const nodeCardWidth = 178;
export const nodeCardHeight = 132;

export function createTreeNode(
    nodeId,
    nodeLabel,
    nodeType,
    nodeValue,
    nodeChildren
) {
    return {
        id: nodeId,
        label: nodeLabel,
        type: nodeType,
        value: nodeValue,
        alpha: null,
        beta: null,
        heuristic: typeof nodeValue === 'number' ? nodeValue : 0,
        edgeCost: 1,
        edgeRelation: 'OR',
        pathCost: null,
        totalCost: null,
        solved: false,
        expanded: false,
        parentId: null,
        selectedChildIds: [],
        children: nodeChildren || [],
        visited: false,
        pruned: false,
        current: false,
        inBestPath: false,
    };
}

export function createSearchNode(
    nodeId,
    nodeLabel,
    nodeType,
    heuristicValue,
    edgeCost,
    nodeChildren,
    edgeRelation
) {
    const node = createTreeNode(
        nodeId,
        nodeLabel,
        nodeType,
        null,
        nodeChildren || []
    );

    node.heuristic = heuristicValue;
    node.edgeCost = edgeCost;
    node.edgeRelation = edgeRelation || 'OR';

    return node;
}

export function createExampleTree() {
    const exampleTree = createTreeNode('A', 'A', 'MAX', null, [
        createTreeNode('B', 'B', 'MIN', null, [
            createTreeNode('D', 'D', 'MAX', null, [
                createTreeNode('L1', 'L1', 'LEAF', 3, []),
                createTreeNode('L2', 'L2', 'LEAF', 5, []),
            ]),
            createTreeNode('E', 'E', 'MAX', null, [
                createTreeNode('L3', 'L3', 'LEAF', 6, []),
                createTreeNode('L4', 'L4', 'LEAF', 9, []),
            ]),
        ]),
        createTreeNode('C', 'C', 'MIN', null, [
            createTreeNode('F', 'F', 'MAX', null, [
                createTreeNode('L5', 'L5', 'LEAF', 1, []),
                createTreeNode('L6', 'L6', 'LEAF', 2, []),
            ]),
            createTreeNode('G', 'G', 'MAX', null, [
                createTreeNode('L7', 'L7', 'LEAF', 0, []),
                createTreeNode('L8', 'L8', 'LEAF', -1, []),
            ]),
        ]),
    ]);

    return assignTreeTypes(exampleTree, 0, 'MAX');
}

export function createSingleRootTree() {
    return createTreeNode('A', 'A', 'LEAF', 0, []);
}

export function createSingleSearchRootTree() {
    const rootNode = createSearchNode('A', 'A', 'OR', 0, 0, []);
    rootNode.edgeRelation = 'ROOT';

    return rootNode;
}

export function createAStarExampleTree() {
    const rootNode = createSearchNode('A', 'A', 'NODE', 7, 0, [
        createSearchNode('B', 'B', 'NODE', 6, 1, [
            createSearchNode('E', 'E', 'NODE', 3, 3, [
                createSearchNode('K', 'K', 'GOAL', 0, 2, []),
            ]),
            createSearchNode('F', 'F', 'NODE', 5, 4, []),
        ]),
        createSearchNode('C', 'C', 'NODE', 2, 4, [
            createSearchNode('G', 'G', 'GOAL', 0, 3, []),
            createSearchNode('H', 'H', 'NODE', 4, 2, []),
        ]),
        createSearchNode('D', 'D', 'NODE', 4, 2, [
            createSearchNode('I', 'I', 'GOAL', 0, 5, []),
        ]),
    ]);

    rootNode.edgeRelation = 'ROOT';

    return rootNode;
}

export function createAOStarExampleTree() {
    const rootNode = createSearchNode('A', 'A', 'OR', 0, 0, [
        createSearchNode('B', 'B', 'OR', 5, 1, [
            createSearchNode('E', 'E', 'LEAF', 7, 1, []),
            createSearchNode('F', 'F', 'LEAF', 9, 1, []),
        ], 'OR'),
        createSearchNode('C', 'C', 'AND', 2, 1, [
            createSearchNode('G', 'G', 'LEAF', 3, 1, [], 'AND'),
            createSearchNode('H', 'H', 'LEAF', 0, 1, [], 'AND'),
            createSearchNode('I', 'I', 'LEAF', 0, 1, [], 'AND'),
        ], 'AND'),
        createSearchNode('D', 'D', 'OR', 4, 1, [
            createSearchNode('J', 'J', 'LEAF', 0, 1, []),
        ], 'AND'),
    ]);

    rootNode.edgeRelation = 'ROOT';

    return rootNode;
}

export function cloneTree(node) {
    const clonedChildren = [];

    for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex = childIndex + 1
    ) {
        clonedChildren.push(cloneTree(node.children[childIndex]));
    }

    return {
        id: node.id,
        label: node.label,
        type: node.type,
        value: node.value,
        alpha: node.alpha,
        beta: node.beta,
        heuristic: getNumberOrDefault(node.heuristic, 0),
        edgeCost: getNumberOrDefault(node.edgeCost, 1),
        edgeRelation: node.edgeRelation || 'OR',
        pathCost: node.pathCost === undefined ? null : node.pathCost,
        totalCost: node.totalCost === undefined ? null : node.totalCost,
        solved: node.solved === true,
        expanded: node.expanded === true,
        parentId: node.parentId || null,
        selectedChildIds: node.selectedChildIds || [],
        children: clonedChildren,
        visited: node.visited,
        pruned: node.pruned,
        current: node.current,
        inBestPath: node.inBestPath,
    };
}

export function assignTreeTypes(node, currentDepth, rootNodeType) {
    const typedChildren = [];

    for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex = childIndex + 1
    ) {
        typedChildren.push(
            assignTreeTypes(
                node.children[childIndex],
                currentDepth + 1,
                rootNodeType
            )
        );
    }

    let nodeType = 'LEAF';
    let nodeValue = node.value;

    if (typedChildren.length > 0) {
        nodeType = getInternalNodeType(currentDepth, rootNodeType);
        nodeValue = null;
    } else if (typeof nodeValue !== 'number' || Number.isNaN(nodeValue)) {
        nodeValue = 0;
    }

    return {
        id: node.id,
        label: node.label,
        type: nodeType,
        value: nodeValue,
        alpha: node.alpha,
        beta: node.beta,
        heuristic: getNumberOrDefault(node.heuristic, 0),
        edgeCost: getNumberOrDefault(node.edgeCost, currentDepth === 0 ? 0 : 1),
        edgeRelation: node.edgeRelation || 'OR',
        pathCost: node.pathCost === undefined ? null : node.pathCost,
        totalCost: node.totalCost === undefined ? null : node.totalCost,
        solved: node.solved === true,
        expanded: node.expanded === true,
        parentId: node.parentId || null,
        selectedChildIds: node.selectedChildIds || [],
        children: typedChildren,
        visited: node.visited,
        pruned: node.pruned,
        current: node.current,
        inBestPath: node.inBestPath,
    };
}

export function clearSimulationFromTree(node) {
    const cleanChildren = [];

    for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex = childIndex + 1
    ) {
        cleanChildren.push(clearSimulationFromTree(node.children[childIndex]));
    }

    let cleanValue = node.value;

    if (node.type !== 'LEAF') {
        cleanValue = null;
    }

    return {
        id: node.id,
        label: node.label,
        type: node.type,
        value: cleanValue,
        alpha: null,
        beta: null,
        heuristic: getNumberOrDefault(node.heuristic, 0),
        edgeCost: getNumberOrDefault(node.edgeCost, 1),
        edgeRelation: node.edgeRelation || 'OR',
        pathCost: null,
        totalCost: null,
        solved: false,
        expanded: false,
        parentId: null,
        selectedChildIds: [],
        children: cleanChildren,
        visited: false,
        pruned: false,
        current: false,
        inBestPath: false,
    };
}

export function clearSearchSimulationFromTree(node) {
    const cleanChildren = [];

    for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex = childIndex + 1
    ) {
        cleanChildren.push(clearSearchSimulationFromTree(node.children[childIndex]));
    }

    return {
        id: node.id,
        label: node.label,
        type: node.type || 'NODE',
        value: null,
        alpha: null,
        beta: null,
        heuristic: getNumberOrDefault(node.heuristic, 0),
        edgeCost: getNumberOrDefault(node.edgeCost, 1),
        edgeRelation: node.edgeRelation || 'OR',
        pathCost: null,
        totalCost: null,
        solved: false,
        expanded: false,
        parentId: null,
        selectedChildIds: [],
        children: cleanChildren,
        visited: false,
        pruned: false,
        current: false,
        inBestPath: false,
    };
}

export function normalizeAStarTree(node) {
    const cleanTree = clearSearchSimulationFromTree(node);

    normalizeAStarNode(cleanTree, true);

    return cleanTree;
}

function normalizeAStarNode(node, isRootNode) {
    node.edgeRelation = isRootNode ? 'ROOT' : 'OR';

    if (node.type !== 'GOAL') {
        node.type = 'NODE';
    }

    for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex = childIndex + 1
    ) {
        normalizeAStarNode(node.children[childIndex], false);
    }
}

export function normalizeAOStarTree(node) {
    const cleanTree = clearSearchSimulationFromTree(node);

    normalizeAOStarNode(cleanTree, true);

    return cleanTree;
}

function normalizeAOStarNode(node, isRootNode) {
    if (isRootNode) {
        node.edgeRelation = 'ROOT';
        node.edgeCost = 0;
    } else if (node.edgeRelation !== 'AND') {
        node.edgeRelation = 'OR';
    }

    if (node.children.length === 0) {
        node.type = 'LEAF';
    } else if (node.type !== 'AND' && node.type !== 'OR') {
        node.type = 'OR';
    }

    for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex = childIndex + 1
    ) {
        normalizeAOStarNode(node.children[childIndex], false);
    }
}

export function findNodeById(node, nodeId) {
    if (node.id === nodeId) {
        return node;
    }

    for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex = childIndex + 1
    ) {
        const foundNode = findNodeById(node.children[childIndex], nodeId);

        if (foundNode !== null) {
            return foundNode;
        }
    }

    return null;
}

export function findParentNodeById(node, childNodeId) {
    for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex = childIndex + 1
    ) {
        const childNode = node.children[childIndex];

        if (childNode.id === childNodeId) {
            return node;
        }

        const foundParent = findParentNodeById(childNode, childNodeId);

        if (foundParent !== null) {
            return foundParent;
        }
    }

    return null;
}

export function removeNodeById(node, nodeId) {
    for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex = childIndex + 1
    ) {
        if (node.children[childIndex].id === nodeId) {
            node.children.splice(childIndex, 1);
            return true;
        }

        const wasRemoved = removeNodeById(node.children[childIndex], nodeId);

        if (wasRemoved) {
            return true;
        }
    }

    return false;
}

export function getNextNodeId(tree) {
    const nodeIds = [];
    collectNodeIds(tree, nodeIds);

    let nodeNumber = 1;
    let possibleNodeId = 'X' + nodeNumber;

    while (nodeIds.indexOf(possibleNodeId) !== -1) {
        nodeNumber = nodeNumber + 1;
        possibleNodeId = 'X' + nodeNumber;
    }

    return possibleNodeId;
}

export function calculateTreeLayout(rootNode) {
    const positions = {};
    const horizontalGap = 230;
    const verticalGap = 190;
    const leftMargin = 120;
    const topMargin = 34;
    let leafCounter = 0;
    let maximumDepth = 0;

    function placeNode(currentNode, currentDepth) {
        if (currentDepth > maximumDepth) {
            maximumDepth = currentDepth;
        }

        let positionX = 0;

        if (currentNode.children.length === 0) {
            positionX = leftMargin + leafCounter * horizontalGap;
            leafCounter = leafCounter + 1;
        } else {
            const childPositions = [];

            for (
                let childIndex = 0;
                childIndex < currentNode.children.length;
                childIndex = childIndex + 1
            ) {
                childPositions.push(
                    placeNode(currentNode.children[childIndex], currentDepth + 1)
                );
            }

            const firstChildPosition = childPositions[0];
            const lastChildPosition = childPositions[childPositions.length - 1];
            positionX = (firstChildPosition + lastChildPosition) / 2;
        }

        positions[currentNode.id] = {
            xCoordinate: positionX,
            yCoordinate: topMargin + currentDepth * verticalGap,
        };

        return positionX;
    }

    placeNode(rootNode, 0);

    return {
        positions: positions,
        width: Math.max(960, leafCounter * horizontalGap + leftMargin * 2),
        height: Math.max(560, (maximumDepth + 1) * verticalGap + 90),
    };
}

export function formatValue(numberValue) {
    if (numberValue === null || numberValue === undefined) {
        return '-';
    }

    if (numberValue === Infinity) {
        return '+∞';
    }

    if (numberValue === -Infinity) {
        return '-∞';
    }

    return String(numberValue);
}

export function createMinimaxSteps(sourceTree, rootNodeType) {
    const typedTree = assignTreeTypes(sourceTree, 0, rootNodeType);
    const workingTree = clearSimulationFromTree(typedTree);
    const steps = [];

    function minimaxRecursive(currentNode) {
        currentNode.visited = true;

        recordStep(
            workingTree,
            currentNode.id,
            steps,
            'Visiting node ' + currentNode.label + ' as ' + currentNode.type,
            getVisitExplanation(currentNode)
        );

        if (currentNode.type === 'LEAF') {
            recordStep(
                workingTree,
                currentNode.id,
                steps,
                'Leaf node ' +
                    currentNode.label +
                    ' returns utility ' +
                    currentNode.value,
                'A leaf node already has a utility value. Minimax sends this value back to its parent.'
            );

            return currentNode.value;
        }

        let bestValue = -Infinity;

        if (currentNode.type === 'MIN') {
            bestValue = Infinity;
        }

        for (
            let childIndex = 0;
            childIndex < currentNode.children.length;
            childIndex = childIndex + 1
        ) {
            const childNode = currentNode.children[childIndex];
            const childValue = minimaxRecursive(childNode);

            if (currentNode.type === 'MAX' && childValue > bestValue) {
                bestValue = childValue;
                currentNode.value = bestValue;

                recordStep(
                    workingTree,
                    currentNode.id,
                    steps,
                    'Updated value at node ' +
                        currentNode.label +
                        ' to ' +
                        bestValue,
                    'At a MAX node, we keep the largest child value because MAX wants the best possible score.'
                );
            } else if (currentNode.type === 'MIN' && childValue < bestValue) {
                bestValue = childValue;
                currentNode.value = bestValue;

                recordStep(
                    workingTree,
                    currentNode.id,
                    steps,
                    'Updated value at node ' +
                        currentNode.label +
                        ' to ' +
                        bestValue,
                    'At a MIN node, we keep the smallest child value because MIN tries to reduce MAX score.'
                );
            } else {
                recordStep(
                    workingTree,
                    currentNode.id,
                    steps,
                    'Node ' +
                        currentNode.label +
                        ' keeps value ' +
                        currentNode.value,
                    'The new child value does not improve this node choice, so the old value remains correct.'
                );
            }
        }

        recordStep(
            workingTree,
            currentNode.id,
            steps,
            'Finished node ' +
                currentNode.label +
                ' with minimax value ' +
                currentNode.value,
            'After all children are checked, this value is passed upward to the parent node.'
        );

        return currentNode.value;
    }

    minimaxRecursive(workingTree);
    clearCurrentFlags(workingTree);
    markBestPathFromNode(workingTree);

    recordStep(
        workingTree,
        workingTree.id,
        steps,
        'Final answer at root node ' +
            workingTree.label +
            ' is ' +
            workingTree.value,
        'The highlighted path shows the choices that produce the final minimax answer.'
    );

    return steps;
}

export function createAlphaBetaSteps(sourceTree, rootNodeType) {
    const typedTree = assignTreeTypes(sourceTree, 0, rootNodeType);
    const workingTree = clearSimulationFromTree(typedTree);
    const steps = [];

    function alphaBetaRecursive(currentNode, alphaValue, betaValue) {
        currentNode.visited = true;
        currentNode.alpha = alphaValue;
        currentNode.beta = betaValue;

        recordStep(
            workingTree,
            currentNode.id,
            steps,
            'Visiting node ' + currentNode.label + ' as ' + currentNode.type,
            getAlphaBetaVisitExplanation(currentNode, alphaValue, betaValue)
        );

        if (currentNode.type === 'LEAF') {
            recordStep(
                workingTree,
                currentNode.id,
                steps,
                'Leaf node ' +
                    currentNode.label +
                    ' returns utility ' +
                    currentNode.value,
                'A leaf value is known directly, so alpha-beta sends it back without expanding more nodes.'
            );

            return currentNode.value;
        }

        if (currentNode.type === 'MAX') {
            return solveMaxNode(currentNode, alphaValue, betaValue);
        }

        return solveMinNode(currentNode, alphaValue, betaValue);
    }

    function solveMaxNode(currentNode, alphaValue, betaValue) {
        let bestValue = -Infinity;

        for (
            let childIndex = 0;
            childIndex < currentNode.children.length;
            childIndex = childIndex + 1
        ) {
            const childNode = currentNode.children[childIndex];
            const childValue = alphaBetaRecursive(
                childNode,
                alphaValue,
                betaValue
            );

            if (childValue > bestValue) {
                bestValue = childValue;
                currentNode.value = bestValue;

                recordStep(
                    workingTree,
                    currentNode.id,
                    steps,
                    'Updated value at node ' +
                        currentNode.label +
                        ' to ' +
                        bestValue,
                    'MAX chooses the largest value seen so far, so this child becomes the current best choice.'
                );
            }

            if (bestValue > alphaValue) {
                alphaValue = bestValue;
                currentNode.alpha = alphaValue;

                recordStep(
                    workingTree,
                    currentNode.id,
                    steps,
                    'Updated alpha at node ' +
                        currentNode.label +
                        ' to ' +
                        formatValue(alphaValue),
                    'Alpha is the best score MAX can guarantee on this path. Since MAX found a better score, alpha increases.'
                );
            }

            if (alphaValue >= betaValue) {
                pruneRemainingChildren(currentNode, childIndex);

                if (childIndex < currentNode.children.length - 1) {
                    recordStep(
                        workingTree,
                        currentNode.id,
                        steps,
                        'Pruning remaining children of node ' +
                            currentNode.label +
                            ' because alpha >= beta',
                        'When alpha is greater than or equal to beta, the MIN side already has a better option elsewhere. The skipped children cannot change the final answer.'
                    );
                }

                break;
            }
        }

        currentNode.alpha = alphaValue;
        currentNode.beta = betaValue;

        recordStep(
            workingTree,
            currentNode.id,
            steps,
            'Finished node ' +
                currentNode.label +
                ' with value ' +
                currentNode.value,
            'This MAX node now returns its best available value to its parent.'
        );

        return currentNode.value;
    }

    function solveMinNode(currentNode, alphaValue, betaValue) {
        let bestValue = Infinity;

        for (
            let childIndex = 0;
            childIndex < currentNode.children.length;
            childIndex = childIndex + 1
        ) {
            const childNode = currentNode.children[childIndex];
            const childValue = alphaBetaRecursive(
                childNode,
                alphaValue,
                betaValue
            );

            if (childValue < bestValue) {
                bestValue = childValue;
                currentNode.value = bestValue;

                recordStep(
                    workingTree,
                    currentNode.id,
                    steps,
                    'Updated value at node ' +
                        currentNode.label +
                        ' to ' +
                        bestValue,
                    'MIN chooses the smallest value seen so far, so this child becomes the current best choice.'
                );
            }

            if (bestValue < betaValue) {
                betaValue = bestValue;
                currentNode.beta = betaValue;

                recordStep(
                    workingTree,
                    currentNode.id,
                    steps,
                    'Updated beta at node ' +
                        currentNode.label +
                        ' to ' +
                        formatValue(betaValue),
                    'Beta is the best score MIN can force on this path. Since MIN found a smaller score, beta decreases.'
                );
            }

            if (alphaValue >= betaValue) {
                pruneRemainingChildren(currentNode, childIndex);

                if (childIndex < currentNode.children.length - 1) {
                    recordStep(
                        workingTree,
                        currentNode.id,
                        steps,
                        'Pruning remaining children of node ' +
                            currentNode.label +
                            ' because alpha >= beta',
                        'When alpha is greater than or equal to beta, MAX already has a choice at least this good. The remaining children under this MIN node are not needed.'
                    );
                }

                break;
            }
        }

        currentNode.alpha = alphaValue;
        currentNode.beta = betaValue;

        recordStep(
            workingTree,
            currentNode.id,
            steps,
            'Finished node ' +
                currentNode.label +
                ' with value ' +
                currentNode.value,
            'This MIN node now returns its best available value to its parent.'
        );

        return currentNode.value;
    }

    alphaBetaRecursive(workingTree, -Infinity, Infinity);
    clearCurrentFlags(workingTree);
    markBestPathFromNode(workingTree);

    recordStep(
        workingTree,
        workingTree.id,
        steps,
        'Final answer at root node ' +
            workingTree.label +
            ' is ' +
            workingTree.value,
        'The highlighted path is the final optimal play. Grey nodes were safely pruned by alpha-beta.'
    );

    return steps;
}

export function createAStarSteps(sourceTree) {
    const workingTree = normalizeAStarTree(sourceTree);
    const steps = [];
    const openList = [];
    const closedIds = [];

    workingTree.pathCost = 0;
    workingTree.totalCost = workingTree.heuristic;
    workingTree.value = workingTree.totalCost;
    openList.push(workingTree);

    recordStep(
        workingTree,
        workingTree.id,
        steps,
        'Starting A* from node ' + workingTree.label,
        'A* uses f(n) = g(n) + h(n). The start node has g = 0, so f is equal to its heuristic.'
    );

    while (openList.length > 0) {
        openList.sort(function sortByTotalCost(firstNode, secondNode) {
            if (firstNode.totalCost === secondNode.totalCost) {
                return firstNode.label.localeCompare(secondNode.label);
            }

            return firstNode.totalCost - secondNode.totalCost;
        });

        const currentNode = openList.shift();
        currentNode.visited = true;
        currentNode.expanded = true;

        recordStep(
            workingTree,
            currentNode.id,
            steps,
            'Choosing node ' +
                currentNode.label +
                ' because it has the lowest f = ' +
                currentNode.totalCost,
            'A* always expands the open node with the smallest f value, where f = path cost so far plus heuristic.'
        );

        if (currentNode.type === 'GOAL' || currentNode.children.length === 0) {
            currentNode.solved = true;
            workingTree.value = currentNode.pathCost;
            markParentPath(workingTree, currentNode);

            recordStep(
                workingTree,
                currentNode.id,
                steps,
                'Goal reached at node ' +
                    currentNode.label +
                    ' with path cost ' +
                    currentNode.pathCost,
                'When A* removes a goal from the open list, the path to that goal is the best path found.'
            );

            return steps;
        }

        closedIds.push(currentNode.id);

        for (
            let childIndex = 0;
            childIndex < currentNode.children.length;
            childIndex = childIndex + 1
        ) {
            const childNode = currentNode.children[childIndex];
            const newPathCost =
                currentNode.pathCost + getNumberOrDefault(childNode.edgeCost, 1);

            if (closedIds.indexOf(childNode.id) !== -1) {
                continue;
            }

            if (
                childNode.pathCost === null ||
                childNode.pathCost === undefined ||
                newPathCost < childNode.pathCost
            ) {
                childNode.pathCost = newPathCost;
                childNode.totalCost = newPathCost + childNode.heuristic;
                childNode.value = childNode.totalCost;
                childNode.parentId = currentNode.id;
                childNode.visited = true;

                if (openList.indexOf(childNode) === -1) {
                    openList.push(childNode);
                }

                recordStep(
                    workingTree,
                    childNode.id,
                    steps,
                    'Updated node ' +
                        childNode.label +
                        ': g = ' +
                        childNode.pathCost +
                        ', h = ' +
                        childNode.heuristic +
                        ', f = ' +
                        childNode.totalCost,
                    'For each child, A* adds the edge cost to g and then adds the heuristic h to get f.'
                );
            }
        }
    }

    recordStep(
        workingTree,
        workingTree.id,
        steps,
        'A* finished without finding a goal node',
        'No goal was available in the reachable graph, so no final path can be selected.'
    );

    return steps;
}

export function createAOStarSteps(sourceTree) {
    const workingTree = normalizeAOStarTree(sourceTree);
    const steps = [];

    recordStep(
        workingTree,
        workingTree.id,
        steps,
        'Starting AO* from node ' + workingTree.label,
        'AO* works on AND-OR graphs. OR nodes choose the cheapest child, while AND nodes must include all children.'
    );

    function solveNode(currentNode) {
        currentNode.visited = true;

        recordStep(
            workingTree,
            currentNode.id,
            steps,
            'Visiting node ' + currentNode.label + ' as ' + currentNode.type,
            'AO* first expands the selected node and then backs up the new cost to its parent.'
        );

        if (currentNode.children.length === 0 || currentNode.type === 'LEAF') {
            currentNode.value = currentNode.heuristic;
            currentNode.solved = true;

            recordStep(
                workingTree,
                currentNode.id,
                steps,
                'Leaf node ' +
                    currentNode.label +
                    ' has heuristic value ' +
                    currentNode.heuristic,
                'A terminal node has no children, so its value is simply its heuristic value.'
            );

            return currentNode.value;
        }

        const childValues = [];

        for (
            let childIndex = 0;
            childIndex < currentNode.children.length;
            childIndex = childIndex + 1
        ) {
            const childNode = currentNode.children[childIndex];
            const solvedChildValue = solveNode(childNode);
            const totalChildValue =
                getNumberOrDefault(childNode.edgeCost, 1) + solvedChildValue;

            childValues.push({
                childNode: childNode,
                totalChildValue: totalChildValue,
            });

            recordStep(
                workingTree,
                currentNode.id,
                steps,
                'Cost through ' +
                    childNode.label +
                    ' from ' +
                    currentNode.label +
                    ' is ' +
                    totalChildValue,
                'AO* adds the edge cost to the backed-up child value.'
            );
        }

        if (currentNode.type === 'AND') {
            let totalValue = 0;
            const selectedChildIds = [];

            for (
                let childIndex = 0;
                childIndex < childValues.length;
                childIndex = childIndex + 1
            ) {
                totalValue = totalValue + childValues[childIndex].totalChildValue;
                selectedChildIds.push(childValues[childIndex].childNode.id);
            }

            currentNode.value = totalValue;
            currentNode.solved = true;
            currentNode.selectedChildIds = selectedChildIds;

            recordStep(
                workingTree,
                currentNode.id,
                steps,
                'AND node ' +
                    currentNode.label +
                    ' value becomes ' +
                    totalValue,
                'At an AND node, all child branches are required, so their costs are added.'
            );

            return currentNode.value;
        }

        const optionValues = [];
        const andGroupChildren = [];

        for (
            let childIndex = 0;
            childIndex < childValues.length;
            childIndex = childIndex + 1
        ) {
            if (childValues[childIndex].childNode.edgeRelation === 'AND') {
                andGroupChildren.push(childValues[childIndex]);
            } else {
                optionValues.push({
                    optionName: childValues[childIndex].childNode.label,
                    optionValue: childValues[childIndex].totalChildValue,
                    optionChildIds: [childValues[childIndex].childNode.id],
                });
            }
        }

        if (andGroupChildren.length > 0) {
            let andGroupValue = 0;
            const andGroupNames = [];
            const andGroupChildIds = [];

            for (
                let childIndex = 0;
                childIndex < andGroupChildren.length;
                childIndex = childIndex + 1
            ) {
                andGroupValue =
                    andGroupValue + andGroupChildren[childIndex].totalChildValue;
                andGroupNames.push(andGroupChildren[childIndex].childNode.label);
                andGroupChildIds.push(andGroupChildren[childIndex].childNode.id);
            }

            optionValues.push({
                optionName: andGroupNames.join(' + '),
                optionValue: andGroupValue,
                optionChildIds: andGroupChildIds,
            });
        }

        let bestOptionValue = Infinity;
        let bestOptionName = '';
        let bestOptionChildIds = [];

        for (
            let optionIndex = 0;
            optionIndex < optionValues.length;
            optionIndex = optionIndex + 1
        ) {
            if (optionValues[optionIndex].optionValue < bestOptionValue) {
                bestOptionValue = optionValues[optionIndex].optionValue;
                bestOptionName = optionValues[optionIndex].optionName;
                bestOptionChildIds = optionValues[optionIndex].optionChildIds;
            }
        }

        currentNode.value = bestOptionValue;
        currentNode.solved = true;
        currentNode.selectedChildIds = bestOptionChildIds;

        recordStep(
            workingTree,
            currentNode.id,
            steps,
            'OR node ' +
                currentNode.label +
                ' chooses option ' +
                bestOptionName +
                ' with value ' +
                bestOptionValue,
            'At an OR node, AO* chooses the lowest-cost option. An option can be one OR child or a grouped AND set of children.'
        );

        return currentNode.value;
    }

    solveNode(workingTree);
    clearCurrentFlags(workingTree);
    markAOStarBestPath(workingTree);

    recordStep(
        workingTree,
        workingTree.id,
        steps,
        'Final AO* value of node ' +
            workingTree.label +
            ' is ' +
            workingTree.value,
        'The highlighted solution graph shows the selected OR branches and all required AND branches.'
    );

    return steps;
}

function getInternalNodeType(currentDepth, rootNodeType) {
    if (currentDepth % 2 === 0) {
        return rootNodeType;
    }

    if (rootNodeType === 'MAX') {
        return 'MIN';
    }

    return 'MAX';
}

function getNumberOrDefault(numberValue, defaultValue) {
    if (typeof numberValue === 'number' && !Number.isNaN(numberValue)) {
        return numberValue;
    }

    return defaultValue;
}

function markParentPath(rootNode, goalNode) {
    let currentNode = goalNode;

    while (currentNode !== null) {
        currentNode.inBestPath = true;

        if (currentNode.parentId === null) {
            break;
        }

        currentNode = findNodeById(rootNode, currentNode.parentId);
    }
}

function markAOStarBestPath(node) {
    node.inBestPath = true;

    if (node.children.length === 0 || node.type === 'LEAF') {
        return;
    }

    if (node.type === 'AND') {
        for (
            let childIndex = 0;
            childIndex < node.children.length;
            childIndex = childIndex + 1
        ) {
            markAOStarBestPath(node.children[childIndex]);
        }

        return;
    }

    const selectedChildIds = node.selectedChildIds || [];

    if (selectedChildIds.length > 0) {
        for (
            let childIndex = 0;
            childIndex < node.children.length;
            childIndex = childIndex + 1
        ) {
            if (selectedChildIds.indexOf(node.children[childIndex].id) !== -1) {
                markAOStarBestPath(node.children[childIndex]);
            }
        }

        return;
    }

    let bestChild = null;
    let bestChildValue = Infinity;

    for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex = childIndex + 1
    ) {
        const childNode = node.children[childIndex];
        const totalChildValue =
            getNumberOrDefault(childNode.edgeCost, 1) +
            getNumberOrDefault(childNode.value, childNode.heuristic);

        if (totalChildValue < bestChildValue) {
            bestChildValue = totalChildValue;
            bestChild = childNode;
        }
    }

    if (bestChild !== null) {
        markAOStarBestPath(bestChild);
    }
}

function collectNodeIds(node, nodeIds) {
    nodeIds.push(node.id);

    for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex = childIndex + 1
    ) {
        collectNodeIds(node.children[childIndex], nodeIds);
    }
}

function clearCurrentFlags(node) {
    node.current = false;

    for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex = childIndex + 1
    ) {
        clearCurrentFlags(node.children[childIndex]);
    }
}

function recordStep(workingTree, currentNodeId, steps, message, explanation) {
    clearCurrentFlags(workingTree);

    if (currentNodeId !== null) {
        const currentNode = findNodeById(workingTree, currentNodeId);

        if (currentNode !== null) {
            currentNode.current = true;
        }
    }

    steps.push({
        tree: cloneTree(workingTree),
        message: message,
        explanation: explanation,
    });
}

function pruneRemainingChildren(currentNode, lastVisitedChildIndex) {
    for (
        let childIndex = lastVisitedChildIndex + 1;
        childIndex < currentNode.children.length;
        childIndex = childIndex + 1
    ) {
        markPrunedSubtree(currentNode.children[childIndex]);
    }
}

function markPrunedSubtree(node) {
    node.pruned = true;
    node.visited = false;
    node.current = false;
    node.inBestPath = false;
    node.alpha = null;
    node.beta = null;

    if (node.type !== 'LEAF') {
        node.value = null;
    }

    for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex = childIndex + 1
    ) {
        markPrunedSubtree(node.children[childIndex]);
    }
}

function markBestPathFromNode(node) {
    node.inBestPath = true;

    if (node.type === 'LEAF') {
        return;
    }

    let selectedChild = null;

    for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex = childIndex + 1
    ) {
        const childNode = node.children[childIndex];

        if (!childNode.pruned && childNode.value === node.value) {
            selectedChild = childNode;
            break;
        }
    }

    if (selectedChild !== null) {
        markBestPathFromNode(selectedChild);
    }
}

function getVisitExplanation(currentNode) {
    if (currentNode.type === 'LEAF') {
        return 'A leaf node has no children, so its utility value is returned directly.';
    }

    if (currentNode.type === 'MAX') {
        return 'A MAX node represents the player who wants the highest possible score.';
    }

    return 'A MIN node represents the opponent who wants the lowest possible score for MAX.';
}

function getAlphaBetaVisitExplanation(currentNode, alphaValue, betaValue) {
    const alphaText = formatValue(alphaValue);
    const betaText = formatValue(betaValue);

    if (currentNode.type === 'LEAF') {
        return (
            'This leaf is reached with alpha = ' +
            alphaText +
            ' and beta = ' +
            betaText +
            '. Its utility will be returned to the parent.'
        );
    }

    if (currentNode.type === 'MAX') {
        return (
            'At this MAX node, alpha starts as ' +
            alphaText +
            ' and beta is ' +
            betaText +
            '. MAX will try to increase alpha.'
        );
    }

    return (
        'At this MIN node, alpha is ' +
        alphaText +
        ' and beta starts as ' +
        betaText +
        '. MIN will try to decrease beta.'
    );
}
