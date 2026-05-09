import React, { useEffect, useState } from 'react';
import './App.css';
import {
    assignTreeTypes,
    calculateTreeLayout,
    clearSimulationFromTree,
    clearSearchSimulationFromTree,
    createAOStarExampleTree,
    createAOStarSteps,
    createAStarExampleTree,
    createAStarSteps,
    cloneTree,
    createAlphaBetaSteps,
    createExampleTree,
    createMinimaxSteps,
    createSearchNode,
    createSingleRootTree,
    createSingleSearchRootTree,
    createTreeNode,
    findNodeById,
    findParentNodeById,
    formatValue,
    getNextNodeId,
    nodeCardHeight,
    nodeCardWidth,
    normalizeAOStarTree,
    normalizeAStarTree,
    removeNodeById,
} from './treeTools';

const storageKey = 'minimaxAlphaBetaSimulatorState';
const positiveInfinityText = '__POSITIVE_INFINITY__';
const negativeInfinityText = '__NEGATIVE_INFINITY__';

function saveValueReplacer(key, value) {
    if (value === Infinity) {
        return positiveInfinityText;
    }

    if (value === -Infinity) {
        return negativeInfinityText;
    }

    return value;
}

function loadValueReviver(key, value) {
    if (value === positiveInfinityText) {
        return Infinity;
    }

    if (value === negativeInfinityText) {
        return -Infinity;
    }

    return value;
}

function loadApplicationState() {
    try {
        const savedText = window.localStorage.getItem(storageKey);

        if (savedText === null) {
            return {};
        }

        const savedState = JSON.parse(savedText, loadValueReviver);

        if (savedState === null || savedState.tree === undefined) {
            return {};
        }

        return savedState;
    } catch (error) {
        return {};
    }
}

function isSearchAlgorithm(algorithmName) {
    return algorithmName === 'A_STAR' || algorithmName === 'AO_STAR';
}

function getAlgorithmLabel(algorithmName) {
    if (algorithmName === 'MINIMAX') {
        return 'Minimax';
    }

    if (algorithmName === 'ALPHA_BETA') {
        return 'Alpha-Beta';
    }

    if (algorithmName === 'A_STAR') {
        return 'A*';
    }

    return 'AO*';
}

function prepareTreeForStepAlgorithm(sourceTree, algorithmName, rootNodeType) {
    if (algorithmName === 'AO_STAR') {
        return normalizeAOStarTree(sourceTree);
    }

    if (algorithmName === 'A_STAR') {
        return normalizeAStarTree(sourceTree);
    }

    const typedTree = assignTreeTypes(cloneTree(sourceTree), 0, rootNodeType);

    return clearSimulationFromTree(typedTree);
}

function App() {
    const [savedApplicationState] = useState(loadApplicationState);
    const initialStepAlgorithm =
        savedApplicationState.stepAlgorithm || 'ALPHA_BETA';
    const initialRootNodeType = savedApplicationState.rootNodeType || 'MAX';
    const [tree, setTree] = useState(function setInitialTree() {
        const savedTree = savedApplicationState.tree || createExampleTree();

        return prepareTreeForStepAlgorithm(
            savedTree,
            initialStepAlgorithm,
            initialRootNodeType
        );
    });
    const [rootNodeType, setRootNodeType] = useState(initialRootNodeType);
    const [selectedNodeId, setSelectedNodeId] = useState(
        savedApplicationState.selectedNodeId || 'A'
    );
    const [stepAlgorithm, setStepAlgorithm] = useState(initialStepAlgorithm);
    const [steps, setSteps] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [darkMode, setDarkMode] = useState(
        savedApplicationState.darkMode === true
    );
    const [safetyMode, setSafetyMode] = useState(
        savedApplicationState.safetyMode !== false
    );
    const [focusMode, setFocusMode] = useState(false);
    const [examPanelOpen, setExamPanelOpen] = useState(
        savedApplicationState.examPanelOpen === true
    );

    let selectedNode = findNodeById(tree, selectedNodeId);

    if (selectedNode === null) {
        selectedNode = tree;
    }

    const visibleSteps =
        currentStepIndex >= 0 ? steps.slice(0, currentStepIndex + 1) : [];
    const currentStep =
        currentStepIndex >= 0 ? steps[currentStepIndex] : null;
    const finalAnswer =
        tree.value === null || tree.value === undefined
            ? 'Not calculated'
            : formatValue(tree.value);
    const stepButtonDisabled =
        steps.length > 0 && currentStepIndex >= steps.length - 1;
    const stepBackButtonDisabled =
        steps.length === 0 || currentStepIndex <= 0;
    const appClassName =
        'app-shell' +
        (darkMode ? ' dark-mode' : '') +
        (focusMode ? ' focus-mode' : '');

    useEffect(
        function saveApplicationState() {
            const savedState = {
                tree: tree,
                rootNodeType: rootNodeType,
                selectedNodeId: selectedNode.id,
                stepAlgorithm: stepAlgorithm,
                steps: steps,
                currentStepIndex: currentStepIndex,
                darkMode: darkMode,
                safetyMode: safetyMode,
                focusMode: focusMode,
                examPanelOpen: examPanelOpen,
            };

            try {
                window.localStorage.setItem(
                    storageKey,
                    JSON.stringify(savedState, saveValueReplacer)
                );
            } catch (error) {
                return;
            }
        },
        [
            tree,
            rootNodeType,
            selectedNode.id,
            stepAlgorithm,
            steps,
            currentStepIndex,
            darkMode,
            safetyMode,
            focusMode,
            examPanelOpen,
        ]
    );

    useEffect(
        function protectPageExit() {
            if (!safetyMode) {
                return undefined;
            }

            function handleBeforeUnload(event) {
                event.preventDefault();
                event.returnValue = '';
            }

            window.addEventListener('beforeunload', handleBeforeUnload);

            return function removeBeforeUnloadProtection() {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
        },
        [safetyMode]
    );

    useEffect(
        function protectBackSwipe() {
            if (!safetyMode) {
                return undefined;
            }

            const safeHistoryState = { minimaxSafePage: true };
            window.history.pushState(safeHistoryState, '', window.location.href);

            function handleBackNavigation() {
                const shouldLeave = window.confirm(
                    'Leave simulator? Your tree is autosaved, but this will exit the page.'
                );

                if (shouldLeave) {
                    window.removeEventListener('popstate', handleBackNavigation);
                    window.history.back();
                } else {
                    window.history.pushState(
                        safeHistoryState,
                        '',
                        window.location.href
                    );
                }
            }

            window.addEventListener('popstate', handleBackNavigation);

            return function removeBackProtection() {
                window.removeEventListener('popstate', handleBackNavigation);
            };
        },
        [safetyMode]
    );

    useEffect(function handleKeyboardShortcuts() {
        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setFocusMode(false);
                setExamPanelOpen(false);
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return function removeKeyboardShortcuts() {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    function clearPlayback() {
        setSteps([]);
        setCurrentStepIndex(-1);
    }

    function applyEditedTree(editedTree, nextSelectedNodeId, nextRootNodeType) {
        const cleanTree = prepareTreeForStepAlgorithm(
            editedTree,
            stepAlgorithm,
            nextRootNodeType
        );

        setTree(cleanTree);
        setSelectedNodeId(nextSelectedNodeId);
        clearPlayback();
    }

    function handleGenerateExampleTree() {
        setStepAlgorithm('ALPHA_BETA');
        setRootNodeType('MAX');
        setTree(createExampleTree());
        setSelectedNodeId('A');
        setFocusMode(false);
        clearPlayback();
    }

    function handleGenerateAStarTree() {
        setStepAlgorithm('A_STAR');
        setTree(createAStarExampleTree());
        setSelectedNodeId('A');
        setFocusMode(false);
        clearPlayback();
    }

    function handleGenerateAOStarTree() {
        setStepAlgorithm('AO_STAR');
        setTree(createAOStarExampleTree());
        setSelectedNodeId('A');
        setFocusMode(false);
        clearPlayback();
    }

    function handleClearTree() {
        if (isSearchAlgorithm(stepAlgorithm)) {
            const cleanTree = prepareTreeForStepAlgorithm(
                createSingleSearchRootTree(),
                stepAlgorithm,
                rootNodeType
            );

            setTree(cleanTree);
        } else {
            setRootNodeType('MAX');
            setTree(createSingleRootTree());
        }

        setSelectedNodeId('A');
        setFocusMode(false);
        clearPlayback();
    }

    function handleResetSimulation() {
        const cleanTree = prepareTreeForStepAlgorithm(
            tree,
            stepAlgorithm,
            rootNodeType
        );

        setTree(cleanTree);
        setFocusMode(false);
        clearPlayback();
    }

    function handleRootTypeChange(event) {
        const nextRootNodeType = event.target.value;
        const typedTree = assignTreeTypes(tree, 0, nextRootNodeType);
        const cleanTree = clearSimulationFromTree(typedTree);

        setRootNodeType(nextRootNodeType);
        setTree(cleanTree);
        clearPlayback();
    }

    function handleStepAlgorithmChange(event) {
        const nextStepAlgorithm = event.target.value;
        const cleanTree = prepareTreeForStepAlgorithm(
            tree,
            nextStepAlgorithm,
            rootNodeType
        );

        setStepAlgorithm(nextStepAlgorithm);
        setTree(cleanTree);
        setSelectedNodeId(cleanTree.id);
        setFocusMode(false);
        clearPlayback();
    }

    function createStepsForCurrentAlgorithm() {
        if (stepAlgorithm === 'MINIMAX') {
            return createMinimaxSteps(tree, rootNodeType);
        }

        if (stepAlgorithm === 'ALPHA_BETA') {
            return createAlphaBetaSteps(tree, rootNodeType);
        }

        if (stepAlgorithm === 'A_STAR') {
            return createAStarSteps(tree);
        }

        return createAOStarSteps(tree);
    }

    function handleRunMinimax() {
        const newSteps = createMinimaxSteps(tree, rootNodeType);
        const lastStepIndex = newSteps.length - 1;

        setStepAlgorithm('MINIMAX');
        setSteps(newSteps);
        setCurrentStepIndex(lastStepIndex);
        setTree(newSteps[lastStepIndex].tree);
        setFocusMode(false);
        setExamPanelOpen(true);
    }

    function handleRunAlphaBeta() {
        const newSteps = createAlphaBetaSteps(tree, rootNodeType);
        const lastStepIndex = newSteps.length - 1;

        setStepAlgorithm('ALPHA_BETA');
        setSteps(newSteps);
        setCurrentStepIndex(lastStepIndex);
        setTree(newSteps[lastStepIndex].tree);
        setFocusMode(false);
        setExamPanelOpen(true);
    }

    function handleRunAStar() {
        const cleanTree = normalizeAStarTree(tree);
        const newSteps = createAStarSteps(cleanTree);
        const lastStepIndex = newSteps.length - 1;

        setStepAlgorithm('A_STAR');
        setSteps(newSteps);
        setCurrentStepIndex(lastStepIndex);
        setTree(newSteps[lastStepIndex].tree);
        setFocusMode(false);
        setExamPanelOpen(true);
    }

    function handleRunAOStar() {
        const cleanTree = normalizeAOStarTree(tree);
        const newSteps = createAOStarSteps(cleanTree);
        const lastStepIndex = newSteps.length - 1;

        setStepAlgorithm('AO_STAR');
        setSteps(newSteps);
        setCurrentStepIndex(lastStepIndex);
        setTree(newSteps[lastStepIndex].tree);
        setFocusMode(false);
        setExamPanelOpen(true);
    }

    function handleStepForward() {
        let nextSteps = steps;
        let nextStepIndex = currentStepIndex + 1;

        if (steps.length === 0) {
            nextSteps = createStepsForCurrentAlgorithm();

            nextStepIndex = 0;
            setSteps(nextSteps);
        }

        if (nextStepIndex >= nextSteps.length) {
            return;
        }

        setCurrentStepIndex(nextStepIndex);
        setTree(nextSteps[nextStepIndex].tree);
        setFocusMode(true);
        setExamPanelOpen(false);
    }

    function handleStepBack() {
        if (steps.length === 0 || currentStepIndex <= 0) {
            return;
        }

        const previousStepIndex = currentStepIndex - 1;

        setCurrentStepIndex(previousStepIndex);
        setTree(steps[previousStepIndex].tree);
        setFocusMode(true);
        setExamPanelOpen(false);
    }

    function handleLabelChange(event) {
        let editedTree = clearSearchSimulationFromTree(cloneTree(tree));

        if (!isSearchAlgorithm(stepAlgorithm)) {
            editedTree = clearSimulationFromTree(
                assignTreeTypes(cloneTree(tree), 0, rootNodeType)
            );
        }

        const editedNode = findNodeById(editedTree, selectedNode.id);
        const nextLabel = event.target.value.trim();

        if (editedNode !== null) {
            editedNode.label = nextLabel === '' ? editedNode.id : nextLabel;
        }

        applyEditedTree(editedTree, selectedNode.id, rootNodeType);
    }

    function handleUtilityChange(numberValue) {
        const editedTree = clearSimulationFromTree(
            assignTreeTypes(cloneTree(tree), 0, rootNodeType)
        );
        const editedNode = findNodeById(editedTree, selectedNode.id);

        if (editedNode !== null && editedNode.type === 'LEAF') {
            editedNode.value = numberValue;
        }

        applyEditedTree(editedTree, selectedNode.id, rootNodeType);
    }

    function handleHeuristicChange(numberValue) {
        const editedTree = clearSearchSimulationFromTree(cloneTree(tree));
        const editedNode = findNodeById(editedTree, selectedNode.id);

        if (editedNode !== null) {
            editedNode.heuristic = numberValue;
        }

        applyEditedTree(editedTree, selectedNode.id, rootNodeType);
    }

    function handleEdgeCostChange(numberValue) {
        const editedTree = clearSearchSimulationFromTree(cloneTree(tree));
        const editedNode = findNodeById(editedTree, selectedNode.id);

        if (editedNode !== null) {
            editedNode.edgeCost = numberValue;
        }

        applyEditedTree(editedTree, selectedNode.id, rootNodeType);
    }

    function handleSearchNodeTypeChange(event) {
        const editedTree = clearSearchSimulationFromTree(cloneTree(tree));
        const editedNode = findNodeById(editedTree, selectedNode.id);

        if (editedNode !== null) {
            editedNode.type = event.target.value;
        }

        applyEditedTree(editedTree, selectedNode.id, rootNodeType);
    }

    function handleAOEdgeRelationChange(event) {
        const editedTree = clearSearchSimulationFromTree(cloneTree(tree));
        const editedNode = findNodeById(editedTree, selectedNode.id);

        if (editedNode !== null) {
            editedNode.edgeRelation = event.target.value;
        }

        applyEditedTree(editedTree, selectedNode.id, rootNodeType);
    }

    function handleAddChild() {
        let editedTree = clearSearchSimulationFromTree(cloneTree(tree));

        if (!isSearchAlgorithm(stepAlgorithm)) {
            editedTree = clearSimulationFromTree(
                assignTreeTypes(cloneTree(tree), 0, rootNodeType)
            );
        }

        const parentNode = findNodeById(editedTree, selectedNode.id);

        if (parentNode === null) {
            return;
        }

        const newNodeId = getNextNodeId(editedTree);
        let newChild = createTreeNode(newNodeId, newNodeId, 'LEAF', 0, []);

        if (isSearchAlgorithm(stepAlgorithm)) {
            if (parentNode.type === 'LEAF' || parentNode.type === 'GOAL') {
                parentNode.type = stepAlgorithm === 'AO_STAR' ? 'OR' : 'NODE';
            }

            newChild = createSearchNode(
                newNodeId,
                newNodeId,
                stepAlgorithm === 'AO_STAR' ? 'LEAF' : 'NODE',
                0,
                1,
                []
            );
        }

        parentNode.children.push(newChild);
        applyEditedTree(editedTree, newNodeId, rootNodeType);
    }

    function handleRemoveSelectedNode() {
        if (selectedNode.id === tree.id) {
            return;
        }

        const parentNode = findParentNodeById(tree, selectedNode.id);
        const parentNodeId = parentNode === null ? tree.id : parentNode.id;
        let editedTree = clearSearchSimulationFromTree(cloneTree(tree));

        if (!isSearchAlgorithm(stepAlgorithm)) {
            editedTree = clearSimulationFromTree(
                assignTreeTypes(cloneTree(tree), 0, rootNodeType)
            );
        }

        removeNodeById(editedTree, selectedNode.id);
        applyEditedTree(editedTree, parentNodeId, rootNodeType);
    }

    function handleToggleDarkMode() {
        setDarkMode(!darkMode);
    }

    function handleToggleSafetyMode() {
        setSafetyMode(!safetyMode);
    }

    function handleToggleFocusMode() {
        setFocusMode(!focusMode);
        setExamPanelOpen(false);
    }

    function handleToggleExamPanel() {
        setExamPanelOpen(!examPanelOpen);
    }

    function handleClearSavedState() {
        window.localStorage.removeItem(storageKey);
        handleGenerateExampleTree();
    }

    return (
        <main className={appClassName}>
            {!focusMode ? (
                <ControlPanel
                    rootNodeType={rootNodeType}
                    stepAlgorithm={stepAlgorithm}
                    selectedNode={selectedNode}
                    selectedIsRoot={selectedNode.id === tree.id}
                    darkMode={darkMode}
                    safetyMode={safetyMode}
                    onGenerateExampleTree={handleGenerateExampleTree}
                    onGenerateAStarTree={handleGenerateAStarTree}
                    onGenerateAOStarTree={handleGenerateAOStarTree}
                    onClearTree={handleClearTree}
                    onRunMinimax={handleRunMinimax}
                    onRunAlphaBeta={handleRunAlphaBeta}
                    onRunAStar={handleRunAStar}
                    onRunAOStar={handleRunAOStar}
                    onResetSimulation={handleResetSimulation}
                    onRootTypeChange={handleRootTypeChange}
                    onStepAlgorithmChange={handleStepAlgorithmChange}
                    onLabelChange={handleLabelChange}
                    onUtilityChange={handleUtilityChange}
                    onHeuristicChange={handleHeuristicChange}
                    onEdgeCostChange={handleEdgeCostChange}
                    onSearchNodeTypeChange={handleSearchNodeTypeChange}
                    onAOEdgeRelationChange={handleAOEdgeRelationChange}
                    onAddChild={handleAddChild}
                    onRemoveSelectedNode={handleRemoveSelectedNode}
                    onToggleDarkMode={handleToggleDarkMode}
                    onToggleSafetyMode={handleToggleSafetyMode}
                    onToggleFocusMode={handleToggleFocusMode}
                    onClearSavedState={handleClearSavedState}
                />
            ) : null}

            <section className="simulator-area">
                {!focusMode ? (
                    <header className="simulator-header">
                        <div>
                            <p className="eyebrow">AI Search Simulator</p>
                            <h1>{getAlgorithmLabel(stepAlgorithm)} Graph</h1>
                        </div>
                        <div className="header-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={handleToggleFocusMode}
                                title="Show only graph while stepping"
                            >
                                <span className="button-icon">□</span>
                                Focus Graph
                            </button>
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={handleToggleExamPanel}
                                title="Open Exam Mode"
                            >
                                <span className="button-icon">?</span>
                                Exam Mode
                            </button>
                            <div className="answer-box">
                                <span>Root Answer</span>
                                <strong>{finalAnswer}</strong>
                            </div>
                        </div>
                    </header>
                ) : null}

                <TreeCanvas
                    tree={tree}
                    selectedNodeId={selectedNode.id}
                    currentStepIndex={currentStepIndex}
                    stepsLength={steps.length}
                    stepAlgorithm={stepAlgorithm}
                    stepButtonDisabled={stepButtonDisabled}
                    stepBackButtonDisabled={stepBackButtonDisabled}
                    focusMode={focusMode}
                    finalAnswer={finalAnswer}
                    safetyMode={safetyMode}
                    rootLabel={tree.label}
                    onSelectNode={setSelectedNodeId}
                    onStepForward={handleStepForward}
                    onStepBack={handleStepBack}
                    onToggleExamPanel={handleToggleExamPanel}
                    onExitFocusMode={handleToggleFocusMode}
                />
            </section>

            <ExecutionPanel
                currentStep={currentStep}
                visibleSteps={visibleSteps}
                examPanelOpen={examPanelOpen}
                onToggleExamPanel={handleToggleExamPanel}
            />
        </main>
    );
}

function ControlPanel(props) {
    const selectedNode = props.selectedNode;
    const searchMode = isSearchAlgorithm(props.stepAlgorithm);
    const leafInputDisabled = selectedNode.type !== 'LEAF';
    const [utilityInputText, setUtilityInputText] = useState('');
    const [heuristicInputText, setHeuristicInputText] = useState('');
    const [edgeCostInputText, setEdgeCostInputText] = useState('');

    useEffect(
        function syncUtilityInputText() {
            if (leafInputDisabled || searchMode) {
                setUtilityInputText('');
            } else {
                setUtilityInputText(String(selectedNode.value));
            }
        },
        [selectedNode.id, selectedNode.value, leafInputDisabled, searchMode]
    );

    useEffect(
        function syncSearchInputText() {
            setHeuristicInputText(String(selectedNode.heuristic || 0));
            setEdgeCostInputText(String(selectedNode.edgeCost || 0));
        },
        [selectedNode.id, selectedNode.heuristic, selectedNode.edgeCost]
    );

    function handleUtilityInputChange(event) {
        const nextUtilityInputText = event.target.value;

        if (!/^-?\d*$/.test(nextUtilityInputText)) {
            return;
        }

        setUtilityInputText(nextUtilityInputText);

        if (
            nextUtilityInputText !== '' &&
            nextUtilityInputText !== '-'
        ) {
            props.onUtilityChange(Number(nextUtilityInputText));
        }
    }

    function handleHeuristicInputChange(event) {
        const nextHeuristicInputText = event.target.value;

        if (!/^-?\d*$/.test(nextHeuristicInputText)) {
            return;
        }

        setHeuristicInputText(nextHeuristicInputText);

        if (
            nextHeuristicInputText !== '' &&
            nextHeuristicInputText !== '-'
        ) {
            props.onHeuristicChange(Number(nextHeuristicInputText));
        }
    }

    function handleEdgeCostInputChange(event) {
        const nextEdgeCostInputText = event.target.value;

        if (!/^\d*$/.test(nextEdgeCostInputText)) {
            return;
        }

        setEdgeCostInputText(nextEdgeCostInputText);

        if (nextEdgeCostInputText !== '') {
            props.onEdgeCostChange(Number(nextEdgeCostInputText));
        }
    }

    return (
        <aside className="control-panel">
            <div className="panel-title">
                <p className="eyebrow">Controls</p>
                <h2>Simulation</h2>
            </div>

            <div className="quick-options">
                <button
                    type="button"
                    className="toggle-button"
                    onClick={props.onToggleDarkMode}
                    title="Toggle dark mode"
                >
                    <span>{props.darkMode ? '☾' : '☀'}</span>
                    {props.darkMode ? 'Dark Mode On' : 'Light Mode'}
                </button>
                <button
                    type="button"
                    className="toggle-button"
                    onClick={props.onToggleSafetyMode}
                    title="Toggle safe leave protection"
                >
                    <span>{props.safetyMode ? '✓' : '!'}</span>
                    {props.safetyMode ? 'Safe Leave On' : 'Safe Leave Off'}
                </button>
            </div>

            <div className="control-group">
                <button
                    type="button"
                    className="primary-button"
                    onClick={props.onGenerateExampleTree}
                    title="Generate Example Tree"
                >
                    <span className="button-icon">★</span>
                    Generate Example Tree
                </button>
                <button
                    type="button"
                    className="secondary-button"
                    onClick={props.onGenerateAOStarTree}
                    title="Generate AO* Exam Graph"
                >
                    <span className="button-icon">AO</span>
                    AO* Exam Graph
                </button>
                <button
                    type="button"
                    className="secondary-button"
                    onClick={props.onGenerateAStarTree}
                    title="Generate A* Example Graph"
                >
                    <span className="button-icon">A*</span>
                    A* Example Graph
                </button>
                <button
                    type="button"
                    className="secondary-button"
                    onClick={props.onClearTree}
                    title="Start Manual Tree"
                >
                    <span className="button-icon">□</span>
                    Start Manual Tree
                </button>
            </div>

            {!searchMode ? (
                <div className="control-group">
                <label htmlFor="root-node-type">Root Type</label>
                <select
                    id="root-node-type"
                    value={props.rootNodeType}
                    onChange={props.onRootTypeChange}
                >
                    <option value="MAX">MAX</option>
                    <option value="MIN">MIN</option>
                </select>
            </div>
            ) : null}

            <div className="control-group">
                <button
                    type="button"
                    className="primary-button"
                    onClick={props.onRunMinimax}
                    title="Run Minimax"
                >
                    <span className="button-icon">▶</span>
                    Run Minimax
                </button>
                <button
                    type="button"
                    className="primary-button alpha-button"
                    onClick={props.onRunAlphaBeta}
                    title="Run Alpha-Beta"
                >
                    <span className="button-icon">αβ</span>
                    Run Alpha-Beta
                </button>
                <button
                    type="button"
                    className="primary-button search-button"
                    onClick={props.onRunAStar}
                    title="Run A*"
                >
                    <span className="button-icon">A*</span>
                    Run A*
                </button>
                <button
                    type="button"
                    className="primary-button search-button"
                    onClick={props.onRunAOStar}
                    title="Run AO*"
                >
                    <span className="button-icon">AO</span>
                    Run AO*
                </button>
            </div>

            <div className="control-group">
                <label htmlFor="step-algorithm">Step Algorithm</label>
                <select
                    id="step-algorithm"
                    value={props.stepAlgorithm}
                    onChange={props.onStepAlgorithmChange}
                >
                    <option value="ALPHA_BETA">Alpha-Beta</option>
                    <option value="MINIMAX">Minimax</option>
                    <option value="A_STAR">A*</option>
                    <option value="AO_STAR">AO*</option>
                </select>
                <button
                    type="button"
                    className="secondary-button"
                    onClick={props.onToggleFocusMode}
                    title="Enter graph focus mode"
                >
                    <span className="button-icon">⛶</span>
                    Focus Graph
                </button>
                <button
                    type="button"
                    className="secondary-button"
                    onClick={props.onResetSimulation}
                    title="Reset Simulation"
                >
                    <span className="button-icon">↻</span>
                    Reset
                </button>
            </div>

            <div className="panel-title editor-title">
                <p className="eyebrow">Manual Tree</p>
                <h2>Selected Node</h2>
            </div>

            <div className="selected-node-summary">
                <strong>Node {selectedNode.label}</strong>
                <span>ID: {selectedNode.id}</span>
                <span>Type: {selectedNode.type}</span>
                {searchMode ? (
                    <>
                        <span>h(n): {selectedNode.heuristic}</span>
                        <span>Edge cost: {selectedNode.edgeCost}</span>
                        {!props.selectedIsRoot && props.stepAlgorithm === 'AO_STAR' ? (
                            <span>
                                From parent: {selectedNode.edgeRelation || 'OR'}
                            </span>
                        ) : null}
                    </>
                ) : null}
            </div>

            <div className="control-group">
                <label htmlFor="node-label">Node Label</label>
                <input
                    id="node-label"
                    type="text"
                    value={selectedNode.label}
                    onChange={props.onLabelChange}
                />
            </div>

            {searchMode ? (
                <div className="control-group">
                    <label htmlFor="search-node-type">Search Node Type</label>
                    <select
                        id="search-node-type"
                        value={selectedNode.type}
                        onChange={props.onSearchNodeTypeChange}
                    >
                        {props.stepAlgorithm === 'AO_STAR' ? (
                            <>
                                <option value="OR">OR</option>
                                <option value="AND">AND</option>
                                <option value="LEAF">LEAF</option>
                            </>
                        ) : (
                            <>
                                <option value="NODE">NODE</option>
                                <option value="GOAL">GOAL</option>
                            </>
                        )}
                    </select>
                </div>
            ) : null}

            {searchMode &&
            props.stepAlgorithm === 'AO_STAR' &&
            !props.selectedIsRoot ? (
                <div className="control-group">
                    <label htmlFor="ao-edge-relation">Connection From Parent</label>
                    <select
                        id="ao-edge-relation"
                        value={selectedNode.edgeRelation || 'OR'}
                        onChange={props.onAOEdgeRelationChange}
                    >
                        <option value="OR">OR option</option>
                        <option value="AND">AND group</option>
                    </select>
                </div>
            ) : null}

            {searchMode ? (
                <div className="control-group">
                    <label htmlFor="node-heuristic">Heuristic h(n)</label>
                    <input
                        id="node-heuristic"
                        type="text"
                        inputMode="numeric"
                        value={heuristicInputText}
                        onChange={handleHeuristicInputChange}
                        placeholder="Example: 5"
                    />
                </div>
            ) : null}

            {searchMode ? (
                <div className="control-group">
                    <label htmlFor="edge-cost">Edge Cost From Parent</label>
                    <input
                        id="edge-cost"
                        type="text"
                        inputMode="numeric"
                        value={edgeCostInputText}
                        onChange={handleEdgeCostInputChange}
                        disabled={props.selectedIsRoot}
                        placeholder="Example: 1"
                    />
                </div>
            ) : null}

            {!searchMode ? (
                <div className="control-group">
                <label htmlFor="leaf-utility">Leaf Utility</label>
                <input
                    id="leaf-utility"
                    type="text"
                    inputMode="numeric"
                    value={utilityInputText}
                    onChange={handleUtilityInputChange}
                    disabled={leafInputDisabled}
                    placeholder="Example: -5"
                />
            </div>
            ) : null}

            <div className="control-group">
                <button
                    type="button"
                    className="secondary-button"
                    onClick={props.onAddChild}
                    title="Add Child"
                >
                    <span className="button-icon">+</span>
                    Add Child
                </button>
                <button
                    type="button"
                    className="danger-button"
                    onClick={props.onRemoveSelectedNode}
                    disabled={props.selectedIsRoot}
                    title="Remove Selected Node"
                >
                    <span className="button-icon">×</span>
                    Remove Node
                </button>
                <button
                    type="button"
                    className="danger-button soft-danger"
                    onClick={props.onClearSavedState}
                    title="Clear autosaved data"
                >
                    <span className="button-icon">⌫</span>
                    Clear Saved Work
                </button>
            </div>
        </aside>
    );
}

function TreeCanvas(props) {
    const layout = calculateTreeLayout(props.tree);
    const edgeElements = [];
    const nodeElements = [];
    const searchMode = isSearchAlgorithm(props.stepAlgorithm);
    const progressText =
        props.stepsLength === 0
            ? 'Ready'
            : 'Step ' + (props.currentStepIndex + 1) + ' / ' + props.stepsLength;

    collectEdgeElements(props.tree, layout, edgeElements, searchMode, props.stepAlgorithm);
    collectNodeElements(
        props.tree,
        props.tree.id,
        props.selectedNodeId,
        props.onSelectNode,
        layout,
        nodeElements,
        searchMode
    );

    return (
        <div className="tree-canvas">
            {!props.focusMode ? (
                <div className="graph-status-bar">
                    <span>{props.safetyMode ? 'Autosave active' : 'Autosave only'}</span>
                    <span>{getAlgorithmLabel(props.stepAlgorithm)}</span>
                    <span>{progressText}</span>
                </div>
            ) : null}

            {props.focusMode ? (
                <button
                    type="button"
                    className="focus-exit-button"
                    onClick={props.onExitFocusMode}
                    title="Exit focus mode"
                >
                    Controls
                </button>
            ) : null}

            <svg
                key={props.currentStepIndex}
                className="tree-svg"
                width={layout.width}
                height={layout.height}
                viewBox={'0 0 ' + layout.width + ' ' + layout.height}
                role="img"
                aria-label="Minimax game tree"
            >
                <g>{edgeElements}</g>
                <g>{nodeElements}</g>
            </svg>

            <div className="floating-step-panel">
                <div className="floating-step-info">
                    <strong>{progressText}</strong>
                    <span>Root: {props.finalAnswer}</span>
                </div>
                <div className="floating-step-actions">
                    <button
                        type="button"
                        className="floating-step-button back-step-button"
                        onClick={props.onStepBack}
                        disabled={props.stepBackButtonDisabled}
                        title="Step Back"
                    >
                        <span className="step-icon back-icon">←</span>
                        <span className="step-copy">
                            <strong>Step Back</strong>
                            <small>Previous step</small>
                        </span>
                    </button>
                    <button
                        type="button"
                        className="floating-step-button"
                        onClick={props.onStepForward}
                        disabled={props.stepButtonDisabled}
                        title="Step Forward"
                    >
                        <span className="step-copy">
                            <strong>Step Forward</strong>
                            <small>Next step</small>
                        </span>
                        <span className="step-icon forward-icon">→</span>
                    </button>
                </div>
            </div>

            <button
                type="button"
                className="exam-drawer-tab"
                onClick={props.onToggleExamPanel}
                title="Open Exam Mode"
            >
                Exam Mode
            </button>
        </div>
    );
}

function collectEdgeElements(node, layout, edgeElements, searchMode, stepAlgorithm) {
    const parentPosition = layout.positions[node.id];
    const parentCenter = searchMode
        ? getSearchNodeCenter(parentPosition)
        : {
              xCoordinate: parentPosition.xCoordinate,
              yCoordinate: parentPosition.yCoordinate + nodeCardHeight,
          };

    for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex = childIndex + 1
    ) {
        const childNode = node.children[childIndex];
        const childPosition = layout.positions[childNode.id];
        const childCenter = searchMode
            ? getSearchNodeCenter(childPosition)
            : {
                  xCoordinate: childPosition.xCoordinate,
                  yCoordinate: childPosition.yCoordinate,
              };
        let edgeClassName = 'tree-edge';

        if (childNode.pruned) {
            edgeClassName = edgeClassName + ' pruned-edge';
        }

        if (node.inBestPath && childNode.inBestPath) {
            edgeClassName = edgeClassName + ' best-edge';
        }

        edgeElements.push(
            <line
                key={node.id + '-' + childNode.id}
                className={edgeClassName}
                x1={parentCenter.xCoordinate}
                y1={parentCenter.yCoordinate}
                x2={childCenter.xCoordinate}
                y2={childCenter.yCoordinate}
            />
        );

        if (searchMode) {
            const costX = parentCenter.xCoordinate * 0.55 + childCenter.xCoordinate * 0.45;
            const costY = parentCenter.yCoordinate * 0.55 + childCenter.yCoordinate * 0.45;

            edgeElements.push(
                <text
                    key={node.id + '-' + childNode.id + '-cost'}
                    className="edge-cost-label"
                    x={costX}
                    y={costY - 8}
                >
                    {childNode.edgeCost}
                </text>
            );
        }

        collectEdgeElements(childNode, layout, edgeElements, searchMode, stepAlgorithm);
    }

    if (searchMode && stepAlgorithm === 'AO_STAR') {
        const andChildren = [];

        for (
            let childIndex = 0;
            childIndex < node.children.length;
            childIndex = childIndex + 1
        ) {
            const childNode = node.children[childIndex];

            if (node.type === 'AND' || childNode.edgeRelation === 'AND') {
                andChildren.push(childNode);
            }
        }

        if (andChildren.length > 1) {
            const andChildIds = [];

            for (
                let childIndex = 0;
                childIndex < andChildren.length;
                childIndex = childIndex + 1
            ) {
                andChildIds.push(andChildren[childIndex].id);
            }

            const markerPoints = getAndMarkerPoints(parentCenter, andChildren, layout);
            const arcKey = node.id + '-and-arc-' + andChildIds.join('-');

            edgeElements.push(
                <path
                    key={arcKey}
                    className="and-arc"
                    d={
                        'M ' +
                        markerPoints.startPoint.xCoordinate +
                        ' ' +
                        markerPoints.startPoint.yCoordinate +
                        ' Q ' +
                        markerPoints.controlPoint.xCoordinate +
                        ' ' +
                        markerPoints.controlPoint.yCoordinate +
                        ' ' +
                        markerPoints.endPoint.xCoordinate +
                        ' ' +
                        markerPoints.endPoint.yCoordinate
                    }
                />
            );

            edgeElements.push(
                <text
                    key={arcKey + '-label'}
                    className="and-arc-label"
                    x={markerPoints.controlPoint.xCoordinate}
                    y={markerPoints.controlPoint.yCoordinate + 7}
                >
                    AND
                </text>
            );
        }
    }
}

function getAndMarkerPoints(parentCenter, andChildren, layout) {
    let xDirectionTotal = 0;
    let yDirectionTotal = 0;

    for (
        let childIndex = 0;
        childIndex < andChildren.length;
        childIndex = childIndex + 1
    ) {
        const childCenter = getSearchNodeCenter(
            layout.positions[andChildren[childIndex].id]
        );
        const xDistance = childCenter.xCoordinate - parentCenter.xCoordinate;
        const yDistance = childCenter.yCoordinate - parentCenter.yCoordinate;
        const edgeLength = Math.sqrt(
            xDistance * xDistance + yDistance * yDistance
        );

        if (edgeLength > 0) {
            xDirectionTotal = xDirectionTotal + xDistance / edgeLength;
            yDirectionTotal = yDirectionTotal + yDistance / edgeLength;
        }
    }

    let directionLength = Math.sqrt(
        xDirectionTotal * xDirectionTotal +
            yDirectionTotal * yDirectionTotal
    );
    let xDirection = 0;
    let yDirection = 1;

    if (directionLength > 0) {
        xDirection = xDirectionTotal / directionLength;
        yDirection = yDirectionTotal / directionLength;
    }

    const xPerpendicular = -yDirection;
    const yPerpendicular = xDirection;
    const markerDistance = 76;
    const markerDepth = 23;
    const markerHalfWidth = Math.min(46, 24 + andChildren.length * 5);
    const markerCenter = {
        xCoordinate: parentCenter.xCoordinate + xDirection * markerDistance,
        yCoordinate: parentCenter.yCoordinate + yDirection * markerDistance,
    };

    return {
        startPoint: {
            xCoordinate: markerCenter.xCoordinate - xPerpendicular * markerHalfWidth,
            yCoordinate: markerCenter.yCoordinate - yPerpendicular * markerHalfWidth,
        },
        controlPoint: {
            xCoordinate: markerCenter.xCoordinate + xDirection * markerDepth,
            yCoordinate: markerCenter.yCoordinate + yDirection * markerDepth,
        },
        endPoint: {
            xCoordinate: markerCenter.xCoordinate + xPerpendicular * markerHalfWidth,
            yCoordinate: markerCenter.yCoordinate + yPerpendicular * markerHalfWidth,
        },
    };
}

function collectNodeElements(
    node,
    rootNodeId,
    selectedNodeId,
    onSelectNode,
    layout,
    nodeElements,
    searchMode
) {
    const nodePosition = layout.positions[node.id];
    const nodeLeft = nodePosition.xCoordinate - nodeCardWidth / 2;
    const nodeTop = nodePosition.yCoordinate;
    const nodeClassName = getNodeClassName(node, rootNodeId, selectedNodeId);
    const statusText = getNodeStatusText(node);
    const scoreLabel = node.type === 'LEAF' ? 'Utility' : 'Value';

    if (searchMode) {
        const center = getSearchNodeCenter(nodePosition);
        const searchNodeClassName = getSearchNodeClassName(
            node,
            rootNodeId,
            selectedNodeId
        );

        nodeElements.push(
            <g
                key={node.id}
                className={searchNodeClassName}
                onClick={() => onSelectNode(node.id)}
            >
                <circle
                    cx={center.xCoordinate}
                    cy={center.yCoordinate}
                    r="29"
                />
                <text
                    className="search-node-label"
                    x={center.xCoordinate}
                    y={center.yCoordinate + 5}
                >
                    {node.label}
                </text>
                <text
                    className="search-node-heuristic"
                    x={center.xCoordinate}
                    y={center.yCoordinate + 52}
                >
                    {node.value !== null
                        ? 'v=' + formatValue(node.value)
                        : 'h=' + formatValue(node.heuristic)}
                </text>
                {node.pathCost !== null || node.totalCost !== null ? (
                    <text
                        className="search-node-cost"
                        x={center.xCoordinate}
                        y={center.yCoordinate + 70}
                    >
                        {'g=' +
                            formatValue(node.pathCost) +
                            ' f=' +
                            formatValue(node.totalCost)}
                    </text>
                ) : null}
                <text
                    className="search-node-type"
                    x={center.xCoordinate}
                    y={center.yCoordinate - 39}
                >
                    {node.type}
                </text>
            </g>
        );
    } else {
        nodeElements.push(
            <foreignObject
                key={node.id}
                x={nodeLeft}
                y={nodeTop}
                width={nodeCardWidth}
                height={nodeCardHeight}
            >
                <div xmlns="http://www.w3.org/1999/xhtml" className="node-shell">
                    <button
                        type="button"
                        className={nodeClassName}
                        onClick={() => onSelectNode(node.id)}
                    >
                        <span className="node-heading">
                            <span className="node-title">Node {node.label}</span>
                            <span className={'type-chip ' + node.type.toLowerCase()}>
                                {node.type}
                            </span>
                        </span>
                        <span className="node-id">ID: {node.id}</span>
                        <span className="node-row">
                            <span>{scoreLabel}</span>
                            <strong>{formatValue(node.value)}</strong>
                        </span>
                        <span className="node-row">
                            <span>α</span>
                            <strong>{formatValue(node.alpha)}</strong>
                        </span>
                        <span className="node-row">
                            <span>β</span>
                            <strong>{formatValue(node.beta)}</strong>
                        </span>
                        <span className="node-status">{statusText}</span>
                        {node.id === rootNodeId && node.value !== null ? (
                            <span className="root-badge">
                                Answer {formatValue(node.value)}
                            </span>
                        ) : null}
                    </button>
                </div>
            </foreignObject>
        );
    }

    for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex = childIndex + 1
    ) {
        collectNodeElements(
            node.children[childIndex],
            rootNodeId,
            selectedNodeId,
            onSelectNode,
            layout,
            nodeElements,
            searchMode
        );
    }
}

function getSearchNodeCenter(nodePosition) {
    return {
        xCoordinate: nodePosition.xCoordinate,
        yCoordinate: nodePosition.yCoordinate + 48,
    };
}

function getNodeClassName(node, rootNodeId, selectedNodeId) {
    let className = 'node-card';

    if (node.id === rootNodeId) {
        className = className + ' root-node';
    }

    if (node.visited) {
        className = className + ' visited-node';
    }

    if (node.pruned) {
        className = className + ' pruned-node';
    }

    if (node.current) {
        className = className + ' current-node';
    }

    if (node.inBestPath) {
        className = className + ' best-node';
    }

    if (node.id === selectedNodeId) {
        className = className + ' selected-node';
    }

    return className;
}

function getSearchNodeClassName(node, rootNodeId, selectedNodeId) {
    let className = 'search-node';

    if (node.id === rootNodeId) {
        className = className + ' root-search-node';
    }

    if (node.visited) {
        className = className + ' visited-search-node';
    }

    if (node.expanded) {
        className = className + ' expanded-search-node';
    }

    if (node.current) {
        className = className + ' current-search-node';
    }

    if (node.inBestPath) {
        className = className + ' best-search-node';
    }

    if (node.solved) {
        className = className + ' solved-search-node';
    }

    if (node.id === selectedNodeId) {
        className = className + ' selected-search-node';
    }

    return className;
}

function getNodeStatusText(node) {
    if (node.pruned) {
        return 'Pruned';
    }

    if (node.current) {
        return 'Current';
    }

    if (node.visited) {
        return 'Visited';
    }

    return 'Not visited';
}

function ExecutionPanel(props) {
    const currentStep = props.currentStep;
    const visibleSteps = props.visibleSteps;
    const panelClassName = props.examPanelOpen
        ? 'execution-panel open-exam-panel'
        : 'execution-panel';

    return (
        <aside className={panelClassName}>
            <div className="drawer-header">
                <div className="panel-title">
                    <p className="eyebrow">Exam Mode</p>
                    <h2>Why This Step Happens</h2>
                </div>
                <button
                    type="button"
                    className="drawer-close-button"
                    onClick={props.onToggleExamPanel}
                    title="Close Exam Mode"
                >
                    ×
                </button>
            </div>

            <div className="exam-box">
                {currentStep === null ? (
                    <p>
                        Press Step Forward to see the reason for each value,
                        alpha, beta, and pruning update.
                    </p>
                ) : (
                    <>
                        <strong>{currentStep.message}</strong>
                        <p>{currentStep.explanation}</p>
                    </>
                )}
            </div>

            <div className="panel-title log-title">
                <p className="eyebrow">Execution Log</p>
                <h2>Steps</h2>
            </div>

            <div className="log-list">
                {visibleSteps.length === 0 ? (
                    <p className="empty-log">No steps yet.</p>
                ) : (
                    visibleSteps.map(function renderLogEntry(step, stepIndex) {
                        const isLatestStep =
                            stepIndex === visibleSteps.length - 1;
                        const className = isLatestStep
                            ? 'log-entry active-log-entry'
                            : 'log-entry';

                        return (
                            <div className={className} key={stepIndex}>
                                <span>{stepIndex + 1}</span>
                                <p>{step.message}</p>
                            </div>
                        );
                    })
                )}
            </div>
        </aside>
    );
}

export default App;
