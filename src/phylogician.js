/* eslint-env browser */
'use strict'

const d3 = require('d3')
const tntTree = require('tnt.tree')
const parser = require('tnt.newick')
const treeLayout = require('./treeLayout.js')
const utils = require('./utils.js')
const treeOperations = require('./treeOperations.js')
const tntTooltip = require('./tnt_tooltip.js')
const frontEndOperations = require('./frontEndOperations.js')


module.export = (config) {
	const tree = tntTree()

	function creatTree(newickString) {	
		let backDrop = d3.select('#backDrop')
		backDrop.remove()
		let startTitle = d3.select('#startTitle')
		startTitle.attr('display', 'none') // Necessary so that the backdrop + startTitle div is gone once tree is created.
	
		let treeBox = document.getElementById('treeBox')
	
		let treeObj = parser.parse_newick(newickString),
			numOfLeaves = utils.countLeaves(treeObj)
	
		tree
			.data(treeObj)
			.node_display(nodeDisplay)
			.label(tntTree.label
				.text()
				.fontsize(fontSizeOfTreeLeafs)
				.height(window.innerHeight / (numOfLeaves + intToImproveScaling))
			)
			.layout(tntTree.layout.vertical()
				.width(window.innerWidth)
				.scale(true)
			)
		tree(treeBox)
	
		// Need to initialize the branchWidth, branchColor, and certaintyOnOff properties of
		// every node in the tree.
		treeOperations.changeBranchWidthProperty(defaultBranchWidth, tree.root())
		let childrenArray = tree.root().get_all_nodes()
		for (let i = 0; i < childrenArray.length; i++) {
			if (!(childrenArray[i].property('branchColor')))
				childrenArray[i].property('branchColor', 'black')
			if (!(childrenArray[i].property('certaintyOnOff')))
				childrenArray[i].property('certaintyOnOff', 'off')
		}
	
		let svgTree = d3.select('#treeBox').select('svg'),
			g = svgTree.select('g')
	
		svgTree.call(d3.zoom()
			.on('zoom', () => {
				g.attr('transform', d3.event.transform)
			})
		)
		treeOperations.updateUserChanges(tree)
	}



	return tree
}


let tree = tntTree(),
	expandedNode = tntTree.node_display.circle(),
	collapsedNode = tntTree.node_display.triangle(),
	fontSizeOfTreeLeafs = 12,
	nodeSize = 3,
	defaultBranchWidth = 3,
	diameterToRadiusFactor = 2,
	tooltipWidth = 120,
	intToImproveScaling = 4

let nodeDisplay = tree.node_display()
	.size(nodeSize)
	.fill('black')
	.display(function(node) {
		if (node.is_collapsed())
			collapsedNode.display().call(this, node)
		else
			expandedNode.display().call(this, node)
	})

/**
 * Initializes the tree visualization and renders it to the div 'treeBox'.
 *
 * @param {any} newickString The desired tree in Newick format.
 */


/**
 * Resets the zoom and transform properties of the 'treeBox' div to the original (identity) state.
 *
 */
function fitScreen() {
	let svgTree = d3.select('#treeBox').select('svg'),
		g = svgTree.select('g')

	svgTree.call(d3.zoom().transform, d3.zoomIdentity)
	g.attr('transform', {k: 1, x: 0, y: 0})
}

/**
 * Calls the function in treeLayout.js that updates the layout of the tree to vertical view.
 *
 */
function updateVertical() {
	treeLayout.updateVertical(tree)
	treeOperations.updateUserChanges(tree)
	frontEndOperations.makeDivFullScreen('.tnt_groupDiv')
	// Need some call to set transform to identity
}

/**
 * Calls the function in treeLayout.js that updates the layout of the tree to radial view.
 *
 */
function updateRadial() {
	treeLayout.updateRadial(tree)
	treeOperations.updateUserChanges(tree)
	frontEndOperations.makeDivFullScreen('.tnt_groupDiv')
	// Need some call to set transform to identity
}

/**
 * Toggles on/off the support values in the tree visualization.
 *
 */
function toggleSupport() {
	let text = d3.select('.nodes')
		.selectAll('.inner')
		.select('text')
	if (text.attr('display') === 'none')
		text.attr('display', 'block')
	else
		text.attr('display', 'none')
}

/**
 * Calls the function in treeLayout.js that toggles on/off the scaling of the SVG tree.
 *
 */
function scaleTree() {
	treeLayout.updateScale(tree)
}

/**
 * Changes the node size of the tree to the desired size using D3 and HTML IDs.
 *
 * @param {any} size The desired node size.
 */
function changeNodeSize(size) {
	let nodes = d3.selectAll('.tnt_tree_node')
		.select('.tnt_node_display_elem')

	nodes.attr('r', size)
	nodes.attr('width', size)
	nodes.attr('height', size)
	nodes.attr('x', -1 * size / diameterToRadiusFactor)
	nodes.attr('y', -1 * size / diameterToRadiusFactor)
	nodes.attr('points', '-' + size + ',0 ' + size + ',-' + size + ' ' + size + ',' + size)
}

/**
 * Overrides the current tree data with the desired tree data, then visualizes these changes.
 *
 * @param {any} data
 */
function restoreState(data) {
	tree.data(JSON.parse(data))
	treeOperations.updateUserChanges(tree)
}

/**
 * Returns the current state of the tree.
 *
 * @returns The current, simpleStringified state of the tree.
 */
function getCurrentState() {
	let currentState = tree.root().data()
	currentState = utils.simpleStringify(currentState)
	return currentState
}

/**
 * Creates a file with the given filename and desired text, and exports it locally.
 * Source: https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
 *
 * @param {any} filename The desired filename of the export.
 * @param {any} text The desired contents of the file (in our case, a stringified JSON).
 */
function exportFile(filename, text) {
	let element = document.createElement('a')
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
	element.setAttribute('download', filename)
	element.style.display = 'none'
	document.body.appendChild(element)
	element.click()
	document.body.removeChild(element)
}

/**
 * Changes the expanded node shape of the tree (circle, triangle, or square).
 *
 * @param {any} shape Should be 'circle', 'triangle', or 'square', as desired.
 */
function changeExpandedNodeShape(shape) {
	if (shape === 'none') {
		expandedNode = tntTree.node_display.circle()
		tree.update()
		let allNodes = d3.selectAll('.tnt_tree_node')
			.select('.tnt_node_display_elem')

		allNodes.attr('r', '0')
	}
	else if (shape === 'circle') {
		expandedNode = tntTree.node_display.circle()
		tree.node_display(nodeDisplay)
		tree.update_nodes()
	}
	else if (shape === 'triangle') {
		expandedNode = tntTree.node_display.triangle()
		tree.node_display(nodeDisplay)
		tree.update_nodes()
	}
	else if (shape === 'square') {
		expandedNode = tntTree.node_display.square()
		tree.node_display(nodeDisplay)
		tree.update_nodes()
	}
}

/**
 * Changes the collapsed node shape of the tree (circle, triangle, or square).
 *
 * @param {any} shape Should be 'circle', 'triangle', or 'square', as desired.
 */
function changeCollapsedNodeShape(shape) {
	if (shape === 'circle')
		collapsedNode = tntTree.node_display.circle()
	else if (shape === 'triangle')
		collapsedNode = tntTree.node_display.triangle()
	else if (shape === 'square')
		collapsedNode = tntTree.node_display.square()
	tree.node_display(nodeDisplay)
	tree.update_nodes()
}

// Installs a listener at each node that displays a tooltip upon click.
tree.on('click', function(node) {
	// Resets color of all nodes to black.
	d3.selectAll('.tnt_tree_node')
		.selectAll('.tnt_node_display_elem')
		.attr('fill', 'black')

	// Generates a tooltip for selected node.
	tntTooltip.table(tree, node)
		.width(tooltipWidth)
		.call(this, {
			// header: 'Node #' + node.id() + ' :: ' + node.property('name')
			header: 'Node: ' + node.property('_id')
		})
})

// Exporting the following functions for use in the specified files:

// Functions that deal with tree creation and layout:
exports.makeTree = makeTree
exports.updateRadial = updateRadial
exports.updateVertical = updateVertical

// Functions that deals with visualization (will be accessed by controlBar.js):
exports.toggleSupport = toggleSupport
exports.scaleTree = scaleTree
exports.changeExpandedNodeShape = changeExpandedNodeShape
exports.changeCollapsedNodeShape = changeCollapsedNodeShape
exports.changeNodeSize = changeNodeSize
exports.fitScreen = fitScreen

// Functions that deals with importing/exporting states (will be accessed by controlBar.js):
exports.restoreState = restoreState
exports.getCurrentState = getCurrentState
exports.exportFile = exportFile
