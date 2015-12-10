var
	util = require('util'),
	graphtheoryjs = require('../../index'),
	Benchmark = graphtheoryjs.benchmark.Benchmark,
	Memory = graphtheoryjs.memory.Memory,
	Timer = graphtheoryjs.timer.Timer,
	chalk = require('chalk'),
	BFS = graphtheoryjs.algorithms.BFS,
	DFS = graphtheoryjs.algorithms.DFS,
	argv = require('yargs').usage('Usage: $0 <command> [options]')
		.example('$0 -f foo.txt --vector --list', 'Load the foo.txt graph file using adjacency vector and list data structures and perform the tests')
		.example('$0 -f foo.txt -vl', 'Load the foo.txt graph file using adjacency vector and list data structures and perform the tests')
		.example('$0 -f foo.txt -m -v', 'Load the foo.txt graph file using matrix and vector data structures and perform the tests')
		.option('f', {
			alias: 'file',
			nargs: 1,
			type: 'string',
			describe: 'Load a file'
		})
		.option('v', {
			alias: 'vector',
			describe: 'Use adjacency vector data structure'
		})
		.option('l', {
			alias: 'list',
			describe: 'Use adjacency list data structure'
		})
		.option('m', {
			alias: 'matrix',
			describe: 'Use adjacency matrix data structure'
		})
		.help('h')
		.alias('h', 'help')
		.epilog('copyright 2015')
		.argv;

var
	benchmark = new Benchmark(),
	memory = new Memory(),
	timer = new Timer(),
	list_graph = new graphtheoryjs.graph.Graph(graphtheoryjs.graph.DataStructure.ADJACENCY_LIST),
	vector_graph = new graphtheoryjs.graph.Graph(graphtheoryjs.graph.DataStructure.ADJACENCY_VECTOR),
	matrix_graph = new graphtheoryjs.graph.Graph(graphtheoryjs.graph.DataStructure.ADJACENCY_MATRIX),
	graph_list = [],
	graph_file = argv.file || '../graph_files/as_graph.txt';

function printSeparator(color) {
	if (!color) color = 'yellow';
	console.log(chalk[color]("==============================\n"));
}

function init() {
	//If the data structure was not specified, use the vector
	if (!argv.vector && !argv.list && !argv.matrix) {
		argv.vector = true;
	}

	console.log(chalk.yellow("\n==== CURRENT MEMORY USAGE ===="));
	graphtheoryjs.util.printMemory();
	printSeparator();

	if (argv.vector) {
		graph_list.push(
			{
				graph: vector_graph,
				name: 'vector'
			});
	}

	if (argv.list) {
		graph_list.push(
			{
				graph: list_graph,
				name: 'list'
			});
	}

	if (argv.matrix) {
		graph_list.push(
			{
				graph: matrix_graph,
				name: 'matrix'
			});
	}
}

function runMemoryTest() {
	console.log(chalk.yellow("======== MEMORY  TEST ========\n"));
	var
		time_to_load = 0,
		current_graph,
		memory_diff;

	for (var i = 0, graph_list_length = graph_list.length; i < graph_list_length; i += 1) {
		current_graph = graph_list[i];
		
		//Load the graphs and measure time and memory
		timer.start();
		memory_diff = memory.run(function () {
			current_graph.graph.loadFromFile(graph_file);
		});
		time_to_load = timer.getElapsedTime();

		console.log(chalk.yellow("LOADED GRAPH USING " + current_graph.name.toUpperCase()));
		graphtheoryjs.util.printMemory(memory_diff);
		console.log(chalk.yellow("LOAD TIME : ") + time_to_load + " s\n");
	}
	printSeparator();
}

function runPerformanceTest() {
	//Run the performance test
	var
		current_graph,
		benchmark_options = {
			cycles: 10,
			onFinishedFunctionTest: function (fn_item) {
				console.log(chalk.yellow("FINISHED " + fn_item.name + "\n"));
				console.log(chalk.yellow(' Cycles : ') + benchmark_options.cycles);
				console.log(chalk.yellow(' Time : ') + fn_item.time + ' ms\n');
			}
		};
	console.log(chalk.yellow("====== PERFORMANCE TEST ======\n"));

	for (var i = 0, graph_list_length = graph_list.length; i < graph_list_length; i += 1) {
		current_graph = graph_list[i];
		benchmark.clear();
		
		console.log(chalk.yellow("==== ADJACENCY " + current_graph.name.toUpperCase() + " GRAPH ====\n"));
		
		//Performs DFS test and BFS tests
		benchmark.add("BFS", function () {
			BFS(current_graph.graph, current_graph.graph.getRandomVertex());
		});

		benchmark.add("DFS", function () {
			DFS(current_graph.graph, current_graph.graph.getRandomVertex());
		});

		benchmark.run(benchmark_options);

		printSeparator();
	}
}

function runSpecificTests() {
	//Run other tests
	
	//Determine the parent of the vertices 10, 20, 30, 40 and 50 when applying the BFS and DFS
	//starting with the vertices 1, 2, 3, 4 and 5
	
	//Get the first graph used
	var
		current_graph = graph_list[0],
		parents = {
			'DFS': {},
			'BFS': {}
		};

	console.log(chalk.yellow('SPECIFIC TESTS USING ' + current_graph.name.toUpperCase()) + '\n');
	printSeparator();

	for (var i = 1; i < 6; i += 1) {
		parents.BFS[i] = {};
		parents.DFS[i] = {};
		for (var j = 10; j < 51; j += 10) {
			var spanning_tree = BFS(current_graph.graph, i);
			parents.BFS[i][j] = spanning_tree.tree[j];//Get the parent of the vertex j
				
			spanning_tree = DFS(current_graph.graph, i);
			parents.DFS[i][j] = spanning_tree.tree[j];//Get the parent of the vertex j
		}
	}

	for (var algorithm in parents) {
		console.log(chalk.yellow(algorithm));
		for (var initial_vertex in parents[algorithm]) {
			console.log(chalk.yellow('\n Initial Vertex : ') + initial_vertex + '\n');

			for (var child_vertex in parents[algorithm][initial_vertex]) {
				// console.log("child vertex = " + child_vertex);
				console.log('   ' + child_vertex +
					chalk.yellow(' is child of ') + parents[algorithm][initial_vertex][child_vertex]);

			}
		}
		console.log('');
	}
}

//Init and run
init();
runMemoryTest();
runPerformanceTest();
runSpecificTests();