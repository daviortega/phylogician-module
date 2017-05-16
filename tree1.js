// newick tree
// console.log(JSON.stringify(tnt.tree.parse_newick(newick)))
var newick = "";
var tree = tnt.tree();
var treeCreated = false;
var numOpenPar = 0;
var numClosedPar = 0;

tree.on("click", function (node)
{
  var root = tree.root();
  //node.sort(function (node, node.parent()) {return 1});
  var tempTree = root.subtree(node.get_all_leaves());
  var nodeParent = node.parent();
  tree.data(tempTree.data());  
  //tree.node_display(tree.node_display()
        //.size(10)
        //.fill("cyan"));
    tree.update();
});

function makeTree(newick) {
    document.getElementById("treemaker").innerHTML=""
    tree
        .data(tnt.tree.parse_newick(newick))
        .node_display(tree.node_display()
            .size(10)
            .fill("gray")
            )
        .label (tnt.tree.label.text()
        .fontsize(12)
        .height(50)
            )
        .layout(tnt.tree.layout.vertical()
        .width(numOpenPar*300)
        .scale(false)
            );
    tree(document.getElementById("treemaker"));
}

function submitNewick ()
{
  document.getElementById("errorspot").innerHTML = "";
  var newick=document.getElementById("userInput").value;
  for (var x=0; x<newick.length; x++)
    {
      if (newick.charAt(x)==='(')
        {
        numOpenPar++;
        }
      if (newick.charAt(x)===')')
        {
        numClosedPar++;
        }
    }
  if (numOpenPar!==numClosedPar || newick.charAt(0)!=='(' || newick.charAt(newick.length-1)!==')')
    {  document.getElementById("errorspot").style.color="Red"
      document.getElementById("errorspot").innerHTML = "ERROR: INVALID INPUT";
      resetPar();
  }
  else
    {
      makeTree(newick);
      resetPar();
    }
}

function resetPar() {
  numOpenPar=0;
  numClosedPar=0;
}

function submitFile() {
    document.getElementById("errorspot").innerHTML = "";
    var fileInput = document.getElementById("fileInput")
    console.log(fileInput.files[0])
    var newick = ''

    var file = fileInput.files[0]
    var reader = new FileReader()

    reader.onload = function(e) {
        newick = reader.result
        makeTree(newick);
    }       
    reader.readAsText(file);
}

function updateVertical()
{
            tree.layout(tnt.tree.layout.vertical().width(numOpenPar*300).scale(false));
            tree.update();
}

function updateRadial()
{
  {
            tree.layout(tnt.tree.layout.radial().width(numOpenPar*300).scale(false));
            tree.update();
        }
}