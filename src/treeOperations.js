/* eslint-env browser */
'use strict'

let	d3 = require('d3'),
	tntTree = require('tnt.tree'),
	parser = require('tnt.newick')

exports.toggleSupport = function() {
	let text = d3.select('.nodes')
		.selectAll('.inner')
		.select('text')
	if (text.attr('display') === 'none')
		text.attr('display', 'block')
	else
		text.attr('display', 'none')
}

// changes each individual branch color by id starting from the node in question and taking into account numChildren
exports.changeBranchColor = function(newColor, selectedNode) {
	let childrenArray = selectedNode.get_all_nodes()
	for (let x = 1; x < childrenArray.length; x++) {
		childrenArray[x].property('branchColor', newColor.color)
		let id = '#tnt_tree_link_treeBox_' + childrenArray[x].id()
		let branch = d3.select(id)
		branch.attr('style', 'stroke: ' + newColor.color)
	}
}

// changes each individual branch color in the given subtree by accessing the node property "branchColor"
function changeBranchColor(tree) {
	let childrenArray = tree.root().get_all_nodes()
	for (let x = 1; x < childrenArray.length; x++) {
		let id = '#tnt_tree_link_treeBox_' + childrenArray[x].id()
		let branch = d3.select(id)
		branch.attr('style', 'stroke: ' + childrenArray[x].property('branchColor'))
	}
}

// changes each individual branch width by id starting from the node in question and taking into account length of subtree
exports.changeBranchWidth = function(width, selectedNode) {
	let childrenArray = selectedNode.get_all_nodes()
	for (let x = 1; x < childrenArray.length; x++) {
		childrenArray[x].property('branchWidth', width)
		let id = '#tnt_tree_link_treeBox_' + childrenArray[x].id()
		let branch = d3.select(id)
		branch.attr('stroke-width', width)
	}
}

// changes each individual branch width in the given subtree by accessing the node property "branchWidth"
function changeBranchWidth(tree) {
	let childrenArray = tree.root().get_all_nodes()
	for (let x = 1; x < childrenArray.length; x++) {
		let id = '#tnt_tree_link_treeBox_' + childrenArray[x].id()
		let branch = d3.select(id)
		branch.attr('stroke-width', childrenArray[x].property('branchWidth'))
	}
}

// changes each individual branch opacity based on transparency support value by id starting from the node in question and taking into account numChildren
let toggledCertainty = 'false'
exports.toggleCertainty = function(selectedNode) {
	let childrenArray = selectedNode.get_all_nodes()
	if (toggledCertainty !== 'true') {
		for (let x = 1; x < childrenArray.length; x++) {
			let branchID = '#tnt_tree_link_treeBox_' + childrenArray[x].id()
			let nodeID = '#tnt_tree_node_treeBox_' + childrenArray[x].id()
			let certainty = d3.select(nodeID)
				.select('text')
				.html()
			let opacity = certainty / 100 // converts certainty into decimal since opacity must be from 0 to 1
			let branch = d3.select(branchID)
			branch.attr('opacity', opacity)
		}
		toggledCertainty = 'true'
	}
	else if (toggledCertainty === 'true') {
		for (let x = 1; x < childrenArray.length; x++) {
			let branchID = '#tnt_tree_link_treeBox_' + childrenArray[x].id()
			let branch = d3.select(branchID)
			branch.attr('opacity', 1)
		}
		toggledCertainty = 'false'
	}
}

exports.toggleNode = function(tree, node) {
	node.toggle()
	updateUserChanges(tree)
}

// ladderizes a subtree
let ladderized = 'false'
exports.ladderizeSubtree = function(tree, node) {
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
	tree.update()
}

// custom update function that uses the TNT update then also updates the branch color and width based on node properties
function updateUserChanges(tree) {
	tree.update()
	changeBranchColor(tree)
	changeBranchWidth(tree)
}

function getTheOtherBranches(tree, node) {
	let nodeParent = node.parent()
	let newTree = tntTree()
	let otherBranches = ''
	console.log(node.data())
	if (nodeParent) {
		console.log('non-root')
		newTree.data(nodeParent.data())
		let childrenOfNodeParent = nodeParent.children()
		childrenOfNodeParent.forEach(function(child) {
			if (child.data() !== node.data())
				otherBranches = child.subtree(child.get_all_leaves())
		})
		let subtree1 = getTheOtherBranches(tree, nodeParent)
		console.log("This subtree of node: " + nodeParent.data()._id)
		console.log(subtree1)
		if (subtree1 !== false) {
			newTree.root().property('children', [subtree1.data(), otherBranches.data()])
		}
		else {
			newTree = tntTree()
			newTree.data(otherBranches.data())
		}
	}
	else {
		console.log('root')
		newTree = false
	}
	return newTree
}

exports.reroot = function(tree, node) {
	let newTree = tntTree().data(parser.parse_newick('(phylogician)'))

	let subTree1 = node.subtree(node.get_all_leaves())
	let subTree2 = getTheOtherBranches(tree, node)

	//newTree.data(node.data())
	console.log('Final subtree')
	console.log(subTree1.data())
	console.log(subTree2.data())
	newTree.root().property('children', [subTree1.data(), subTree2.data()])
	console.log(newTree.data())
	tree.data(newTree.data())
	tree.update()
}
