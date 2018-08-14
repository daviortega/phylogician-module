/* eslint-env browser */
'use strict'

let	d3 = require('d3'),
	tntTree = require('tnt.tree'),
	reroot = require('./reroot.js'),
	frontEndOperations = require('./frontEndOperations.js'),
	phylogician = require('./phylogician.js')

let oneHundred = 100,
	timeoutVar1 = 2000,
	tree = tntTree()

/**
 * Modifies the 'branchColor' property of all branches in the subtree of a given node to a given color.
 *
 * @param {any} newColor - Desired color of the subtree's branches.
 * @param {any} selectedNode - The root node of the subtree.
 */
function changeBranchColorProperty(newColor, selectedNode) {
	let childrenArray = selectedNode.get_all_nodes()
	for (let x = 1; x < childrenArray.length; x++)
		childrenArray[x].property('branchColor', String(newColor.color))
}

/**
 * Modifies the 'branchWidth' property of all nodes in the subtree of a given node to a given width.
 *
 * @param {any} width - Desired branch width of subtree.
 * @param {any} selectedNode - The root node of the subtree.
 */
function changeBranchWidthProperty(width, selectedNode) {
	let childrenArray = selectedNode.get_all_nodes()
	for (let x = 1; x < childrenArray.length; x++)
		childrenArray[x].property('branchWidth', Math.abs(width))
}

let toggledCertainty = 'false'
/**
 * Modifies the 'certaintyOnOff' property of all nodes in a subtree as follows:
 *    - Calculates the opacity based on support values and sets that as the property if toggling on.
 *    - Sets '1' as the property if toggling off.
 *
 * @param {any} selectedNode
 */
function changeCertaintyProperty(selectedNode) {
	let childrenArray = selectedNode.get_all_nodes()
	if (toggledCertainty !== 'true') {
		for (let x = 1; x < childrenArray.length; x++) {
			let nodeID = '#tnt_tree_node_treeBox_' + childrenArray[x].id()
			let certainty = d3.select(nodeID)
				.select('text')
				.html()
			let opacity = certainty / oneHundred // converts certainty into decimal since opacity must be from 0 to 1
			childrenArray[x].property('certaintyOnOff', opacity)
		}
		toggledCertainty = 'true'
	}
	else if (toggledCertainty === 'true') {
		for (let x = 1; x < childrenArray.length; x++)
			childrenArray[x].property('certaintyOnOff', 1)
		toggledCertainty = 'false'
	}
}

/**
 * Toggles the collapsing/uncollapsing of a given node in the treeObj.
 *
 * @param {any} node - The node to be collapsed/uncollapsed.
 */
function toggleNodeProperty(node) {
	node.toggle()
}


let ladderized = 'false'
/**
 * Ladderizes a specified subtree. If already ladderized, then reverses the direction of ladderization.
 *
 * @param {any} node - The root node of the subtree.
 */
function ladderizeSubtree(node) {
	console.log(phylogician.getCurrentState())
	console.log(node.get_all_leaves())
	if (ladderized !== 'true') {
		node.sort(function(node1, node2) {
			return node1.get_all_leaves().length - node2.get_all_leaves().length
		})
		ladderized = 'true'
	}
	else if (ladderized === 'true') {
		node.sort(function(node1, node2) {
			return node2.get_all_leaves().length - node1.get_all_leaves().length
		})
		ladderized = 'false'
	}
	console.log(node.get_all_leaves())
	console.log(phylogician.getCurrentState())
	/* // Testing zone for gene clusters to follow corresponding nodes upon ladderizing
	let passedComma = false
	for (let i = 0; i < node.get_all_leaves().length; i++) {
		let geneCluster = d3.select('#GN' + i)
		let geneClusterTransform = geneCluster.attr('transform')
		let corrNodeTransform = d3.select('#' + geneCluster.attr('correspondingNodeID')).attr('transform')
		console.log(corrNodeTransform)
		let corrNodeY = ''
		let geneClusterY = ''
		for (let j = 0; j < corrNodeTransform.length; j++) {
			if (passedComma) {
				if (corrNodeTransform[j] === ')')
					break
				corrNodeY += corrNodeTransform[j]
			}
			console.log(corrNodeY)
			if (corrNodeTransform[j] === ',')
				passedComma = true
		}
		let commaIndex = 0
		for (let j = 0; j < geneClusterTransform.length; j++) {
			if (geneClusterTransform[j] === ',') {
				commaIndex = j
				console.log(commaIndex)
				break
			}
		}
		geneClusterTransform = geneClusterTransform.substr(0, commaIndex + 1) + (parseFloat(corrNodeY) - 22.5) + ')'
	} */
}

/**
 * Re-roots the tree by setting the passed node as the new root.
 *
 * @param {any} tree - Tree that will be re-rooted
 * @param {any} node - Node that will be the new root.
 */
function rerootTree(tree, node) {
	let newRoot = reroot.newRoot(tree, node)
	tree.data(newRoot.data())
}

// Custom update function and necessary helper functions are below:

/**
 * Custom update function that first uses TNT's update, then also updates the SVG based on the following properties:
	'branchColor,' 'branchWidth,' and 'certaintyOnOff.'
 *
 * @param {any} tree - A TNT treeObj
 */
function updateUserChanges(tree) {
	tree.update()
	updateBranchColor(tree)
	updateBranchWidth(tree)
	updateCertainty(tree)
	/* setTimeout(() => {
		frontEndOperations.makeDivFullScreen('.tnt_groupDiv')
	}, timeoutVar1) */
}

/**
 * Updates the branch color of every branch in a given tree based on its 'branchColor' property.
 *
 * @param {any} tree - A TNT treeObj
 */
function updateBranchColor(tree) {
	let childrenArray = tree.root().get_all_nodes()
	for (let x = 1; x < childrenArray.length; x++) {
		let id = '#tnt_tree_link_treeBox_' + childrenArray[x].id()
		let branch = d3.select(id)
		branch.attr('style', 'stroke: ' + childrenArray[x].property('branchColor'))
	}
}

/**
 * Updates the branch width of every branch in a given tree based on its 'branchWidth' property.
 *
 * @param {any} tree - A TNT treeObj
 */
function updateBranchWidth(tree) {
	let childrenArray = tree.root().get_all_nodes()
	for (let x = 1; x < childrenArray.length; x++) {
		let id = '#tnt_tree_link_treeBox_' + childrenArray[x].id()
		let branch = d3.select(id)
		branch.attr('stroke-width', childrenArray[x].property('branchWidth'))
	}
}

/**
 * Updates the branch opacity of every branch in a given tree based on its 'certaintyOnOff' property.
 *
 * @param {any} tree - A TNT treeObj
 */
function updateCertainty(tree) {
	let childrenArray = tree.root().get_all_nodes()
	for (let x = 1; x < childrenArray.length; x++) {
		let id = '#tnt_tree_link_treeBox_' + childrenArray[x].id()
		let branch = d3.select(id)
		branch.attr('opacity', childrenArray[x].property('certaintyOnOff'))
	}
}

// Exporting the following functions to be accessible globally:
exports.changeBranchColorProperty = changeBranchColorProperty
exports.changeBranchWidthProperty = changeBranchWidthProperty
exports.changeCertaintyProperty = changeCertaintyProperty
exports.toggleNodeProperty = toggleNodeProperty
exports.ladderizeSubtree = ladderizeSubtree
exports.rerootTree = rerootTree
exports.updateUserChanges = updateUserChanges


