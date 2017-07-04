/* eslint-env browser */
'use strict'

let	d3 = require('d3'),
	tntTree = require('tnt.tree'),
	parser = require('tnt.newick')
let tree = tntTree()


exports.updateVertical = function() {
	tree.layout(tree.layout.vertical().width(window.innerWidth * 0.58)
		.scale(false))
	tree.update()
}

exports.updateRadial = function() {
	tree.layout(tree.layout.radial().width(Math.min(window.innerWidth * 0.58, window.innerHeight * 0.58))
		.scale(false))
	tree.update()
}
