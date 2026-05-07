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
        children: nodeChildren || [],
        visited: false,
        pruned: false,
        current: false,
        inBestPath: false,
    };
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
        children: cleanChildren,
        visited: false,
        pruned: false,
        current: false,
        inBestPath: false,
    };
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

function getInternalNodeType(currentDepth, rootNodeType) {
    if (currentDepth % 2 === 0) {
        return rootNodeType;
    }

    if (rootNodeType === 'MAX') {
        return 'MIN';
    }

    return 'MAX';
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
