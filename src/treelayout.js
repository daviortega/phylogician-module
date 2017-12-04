/* eslint-env browser */
'use strict'

let	d3 = require('d3'),
	tntTree = require('tnt.tree'),
	parser = require('tnt.newick'),
	currentState = 'vertical',
	scaled = true // Default: Scaling is on.

/**
 * Updates the back-end layout property of the tree to vertical display.
 *
 * @param {any} tree The tree to be modified.
 */
function updateVertical(tree) {
	tree.layout(tntTree.layout.vertical().width(window.innerWidth * 0.85))
	currentState = 'vertical'
}

/**
 * Updates the back-end layout property of the tree to radial display.
 *
 * @param {any} tree The tree to be modified.
 */
function updateRadial(tree) {
	tree.layout(tntTree.layout.radial().width(Math.min(window.innerWidth * 0.85, window.innerHeight * 0.85)))
	currentState = 'radial'
}

/**
 * Toggles on/off the scaling of the tree and changes the text in the controlBar to
 * correspond with this change. Also updates all related local variables.
 *
 * @param {any} tree The tree to be modified.
 */
function updateScale(tree) {
	let textUpdate = d3.select('.scalingOption')
	if (currentState === 'vertical' && scaled === false) {
		tree.layout(tntTree.layout.vertical().width(window.innerWidth * 0.85)
			.scale(true))
		tree.update()
		scaled = true
		textUpdate.text('Turn Off Scaling')
	}
	else if (currentState === 'radial' && scaled === false) {
		tree.layout(tntTree.layout.radial().width(Math.min(window.innerWidth * 0.85, window.innerHeight * 0.85))
			.scale(true))
		tree.update()
		scaled = true
		textUpdate.text('Turn Off Scaling')
	}
	else if (currentState === 'vertical' && scaled === true) {
		tree.layout(tntTree.layout.vertical().width(window.innerWidth * 0.85)
			.scale(false))
		tree.update()
		scaled = false
		textUpdate.text('Turn On Scaling')
	}
	else {
		tree.layout(tntTree.layout.radial().width(Math.min(window.innerWidth * 0.85, window.innerHeight * 0.85))
			.scale(false))
		tree.update()
		scaled = false
		textUpdate.text('Turn On Scaling')
	}
}

// Exporting the following functions for use in phylogician.js:
exports.updateVertical = updateVertical
exports.updateRadial = updateRadial
exports.updateScale = updateScale
