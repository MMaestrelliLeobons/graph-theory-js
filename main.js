var graph = require('./src/graph/graph');

//Temporary debug tests

// var my_graph = new graph.Graph(graph.DataStructure.ADJACENCY_VECTOR);
var my_graph = new graph.Graph(graph.DataStructure.ADJACENCY_LIST);
// my_graph.loadFromFile('./src/test/graph_files/as_graph.txt');
my_graph.loadFromFile('./test/graph_files/small_graph.txt');
my_graph.saveGraphStatisticsToFile();
my_graph.print();
console.log("Neighbors of vertex 1 = ");
console.log(my_graph.neighbors(1));
console.log("Iterate over all the vertices");
my_graph.forEach(function (vertex, neighbors) {
	console.log(vertex, neighbors);
});
console.log("Iterate over all the neighbors of vertex 5");
my_graph.forEachNeighbor(5, function (neighbor) {
	console.log(neighbor);
});