/* eslint-env browser */
'use strict'

require('bootstrap-colorpicker')

let d3 = require('d3'),
	$ = require('jquery'),
	phylogician = require('./phylogician.js')

exports.popFormBranchWidth = function(nodeID, numChildren, selectedNode) {
	let childrenArray = selectedNode.get_all_nodes()
	if (document.getElementById('fileFormLabel'))
		document.getElementById('fileFormLabel').style.display = 'none'
	if (document.getElementById('stringInput'))
		document.getElementById('stringInput').style.display = 'none'
	if (document.getElementById('colorPicker'))
		document.getElementById('colorPicker').style.display = 'none'
	if (document.getElementById('branchWidthInput'))
		$('#branchWidthInput').remove()
	let branchWidthForm = document.createElement('input')
	branchWidthForm.classList.add('form-control')
	branchWidthForm.id = 'branchWidthInput'
	branchWidthForm.style.display = 'block'
	branchWidthForm.addEventListener('keydown', function(e) {
		let enterKeyCode = 13
		if (e.keyCode === enterKeyCode) {
			let branchWidth = document.getElementById('branchWidthInput').value
			branchWidthForm.style.display = 'none'
			if (branchWidth !== '')
				phylogician.changeBranchWidth(branchWidth, nodeID, numChildren)
			for (let x = 1; x < childrenArray.length; x++) {
				childrenArray[x].property('branchWidth', branchWidth)
				console.log(childrenArray[x].property('branchWidth'))
			}
		}
	})
	document.body.appendChild(branchWidthForm)

}

exports.popColorPicker = function(nodeID, numChildren, selectedNode) {
	let childrenArray = selectedNode.get_all_nodes()
	if (document.getElementById('fileFormLabel'))
		document.getElementById('fileFormLabel').style.display = 'none'
	if (document.getElementById('stringInput'))
		document.getElementById('stringInput').style.display = 'none'
	if (document.getElementById('branchWidthInput'))
		document.getElementById('branchWidthInput').style.display = 'none'
	if (document.getElementById('colorPicker'))
		$('#colorPicker').remove()
	let colorPicker = document.createElement('input')
	colorPicker.classList.add('form-control')
	colorPicker.id = 'colorPicker'
	colorPicker.style.display = 'block'
	$(function() {
		$('#colorPicker').colorpicker()
			.on('changeColor', function(newColor) {
				phylogician.changeBranchColor(newColor, nodeID, numChildren)
				for (let x = 1; x < childrenArray.length; x++) {
					if (newColor.value !== 'undefined')
						childrenArray[x].property('branchColor', newColor.value)
					console.log(newColor.value)
				}
			})
			.on('hidePicker', function() {
				document.getElementById('colorPicker').style.display = 'none'
			})
	})
	document.body.appendChild(colorPicker)
}
