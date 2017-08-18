/* eslint-env browser */
'use strict'

let d3 = require('d3')
let $ = require('jquery')
let phylogician = require('./phylogician.js')
let tntTree = require('tnt.tree')
let controlBar = require('./controlBar.js')

let tree = tntTree()
let tooltip = d3.select('body').append('div')
	.attr('id', 'tooltip1')
	.attr('class', 'tooltippy')
	.style('display', 'block')

let tooltipDiv = document.getElementById('tooltip1')

let changeBranchColor = document.createElement('button')
changeBranchColor.setAttribute('type', 'button')
changeBranchColor.classList.add('btn')
changeBranchColor.innerHTML = 'Change Branch Color'
changeBranchColor.addEventListener('click', controlBar.popColorPicker)
tooltipDiv.appendChild(changeBranchColor)


exports.mouseovernodes = function() {
	d3.select('.nodes')
		.selectAll('g')
		.select('circle')
		.on('mouseover', function() {
			document.getElementById('tooltip1').style.left = (d3.event.pageX + 30) + 'px'
			document.getElementById('tooltip1').style.top = (d3.event.pageY + 30) + 'px'	
			console.log('Tooltip display is now set as "block"')
		})
}


/* nodes.on('mouseover', function() {
	if (document.getElementById('tooltip1').style.display === 'none') {
		document.getElementById('tooltip1').style.display = 'block'
		document.getElementById('tooltip1').style.left = (d3.event.pageX + 30) + 'px'
		document.getElementById('tooltip1').style.top = (d3.event.pageY + 30) + 'px'	
		console.log('Tooltip display is now set as "block"')
	}
	else {
		document.getElementById('tooltip1').style.display = 'none'
	}
	// can add html here or append
}) */
