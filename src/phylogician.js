/* eslint-env browser */
'use strict'

let	d3 = require('d3'),
	tnt = require('tnt.utils'),
	tntTree = require('tnt.tree'),
	parser = require('tnt.newick'),
	treeLayout = require('./treelayout.js'),
	utils = require('./utils.js'),
	treeOperations = require('./treeOperations.js'),
	tntTooltip = require('./tnt_tooltip.js')

let tree = tntTree()
let expandedNode = tntTree.node_display.circle()
let collapsedNode = tntTree.node_display.triangle()
let fontSizeOfTreeLeafs = 12
let nodeSize = 3
let nodeDisplay = tree.node_display()
	.size(nodeSize)
	.fill('black')
	.display(function(node) {
		if (node.is_collapsed())
			collapsedNode.display().call(this, node)
		else
			expandedNode.display().call(this, node)
	})

// creates the tree and renders it to the div 'treeBox'
exports.makeTree = function(newickString) {
	if (document.getElementsByClassName('tnt_groupDiv').length !== 0) {
		let existingTree = document.getElementsByClassName('tnt_groupDiv')[0]
		document.getElementById('treeBox').removeChild(existingTree)
	}

	let treeBox = document.getElementById('treeBox')

	let treeObj = parser.parse_newick(newickString),
		numOfLeaves = utils.countLeaves(treeObj)

	tree
		.data(treeObj)
		.node_display(nodeDisplay)
		.label(tntTree.label
			.text()
			.fontsize(fontSizeOfTreeLeafs)
			.height(window.innerHeight / (numOfLeaves + 4))
		)
		.layout(tntTree.layout.vertical()
			.width(window.innerWidth)
			.scale(false)
		)
	tree(treeBox)

	let svgTree = d3.select('#treeBox').select('svg'),
		g = svgTree.select('g')

	svgTree.call(d3.zoom()
		.on('zoom', () => {
			g.attr('transform', d3.event.transform)
		})
	)
}

// resets the zoom and transform of tree to original
exports.fitScreen = function() {
	let svgTree = d3.select('#treeBox').select('svg'),
		g = svgTree.select('g')

	svgTree.call(d3.zoom().transform, d3.zoomIdentity)
	g.attr('transform', {k: 1, x: 0, y: 0})
}

// calls the function to update the layout of the tree to vertical view
exports.updateVertical = function() {
	treeLayout.updateVertical(tree)
}

// calls the function to update the layout of the tree to radial view
exports.updateRadial = function() {
	treeLayout.updateRadial(tree)
}

// calls the function to toggle support values displayed at individual nodes
exports.toggleSupport = function() {
	treeOperations.toggleSupport()
}

// calls the function to change the branch color of the subtree of the node #[nodeID]
exports.changeBranchColor = function(e, nodeID, numOfChildren) {
	treeOperations.changeBranchColor(e, nodeID, numOfChildren)
}

// calls the function to change the branch width of the subtree of the node #[nodeID]
exports.changeBranchWidth = function(e, nodeID, numOfChildren) {
	treeOperations.changeBranchWidth(e, nodeID, numOfChildren)
}

// exports a PNG image of the SVG display
exports.exportPNG = function(e) {
	let pngExporter = tnt.png()
		.filename('treeSample.png')
	pngExporter(d3.select('#treeBox')
		.select('svg'))
}

let min = 1000

// helper function for sorting
function getShortestPathToLeaf(node) {
	if (node.is_leaf()) {
		return 1
	}
	let x = node.children()
	for (let i = 0; i < x.length; i++) {
		temp = 1 + getShortestPathToLeaf(x[i])
		if (temp < min) {
			min = temp
			temp = 0
		}
	}
}

// sorts the tree ?? (need better description)
exports.ladderizeTree = function() {
	tree.root().sort(function(node1, node2) {
		let highest1 = getShortestPathToLeaf(node1)
		let highest2 = getShortestPathToLeaf(node2)
		return getShortestPathToLeaf(node1) - getShortestPathToLeaf(node2)
	})
	tree.update()
}

// changes the expanded node shape of the tree
exports.changeExpandedNodeShape = function(shape) {
	if (shape === 'circle') {
		expandedNode = tntTree.node_display.circle()
	}
	else if (shape === 'triangle') {
		expandedNode = tntTree.node_display.triangle()
	}
	else if (shape === 'rectangle') {
		expandedNode = tntTree.node_display.rectangle()
	}
	tree.node_display(nodeDisplay)
	tree.update_nodes()
}

// changes the collapsed node shape of the tree -- TO BE COMPLETED
exports.changeCollapsedNodeShape = function(shape) {
	tree.update_nodes()
}


// installs a listener at each node that displays a tooltip upon click
tree.on('click', function(node) {
	// resets color of all nodes to black
	d3.selectAll('.tnt_tree_node')
		.selectAll('.tnt_node_display_elem')
		.attr('fill', 'black')

	// generates tooltip for selected node
	tntTooltip.table(tree, node)
		.width(120)
		.call(this, {
			'header' : 'Node #' + node.id(),
			/* "rows" : [
				{"label": "ID", "value": node.id()}
			] */
		})
})

// module.exports = 'phylogician'
