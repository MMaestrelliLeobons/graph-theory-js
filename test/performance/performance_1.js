var
    util = require('util'),
    graphtheoryjs = require('../../index'),
    Benchmark = graphtheoryjs.Util.Benchmark,
    Memory = graphtheoryjs.Util.Memory,
    Timer = graphtheoryjs.Util.Timer,
    chalk = require('chalk'),
    BFS = graphtheoryjs.Algorithms.BFS,
    DFS = graphtheoryjs.Algorithms.DFS,
    findClusters = graphtheoryjs.Algorithms.FindClusters,
    findDiameter = graphtheoryjs.Algorithms.FindDiameter,
    fs = require('fs'),
    ProgressBar = require('progress'),
    argv = require('yargs').usage('Usage: $0 <command> [options]')
        .example('$0 -f foo.txt --vector --list', 'Load the foo.txt graph file using adjacency vector and list data structures and perform the tests')
        .example('$0 -f foo.txt -vl', 'Load the foo.txt graph file using adjacency vector and list data structures and perform the tests')
        .example('$0 -f foo.txt -m -v', 'Load the foo.txt graph file using matrix and vector data structures and perform the tests')
        .example('$0 -f foo.txt --clusters', 'Find the clusters of the foo graph')
        .example('$0 -f foo.txt -ps', 'Run the performance and specific tests on the foo graph')
        .option('f', {
            alias: 'file',
            nargs: 1,
            type: 'string',
            describe: 'Load a file',
            requiresArgs: true,
            demand: true
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
        .option('p', {
            alias: 'performance',
            describe: 'Run the performance test (10 BFS, 10 DFS)'
        })
        .option('s', {
            alias: 'specific',
            describe: 'Run specific tests'
        })
        .option('c', {
            alias: 'clusters',
            describe: 'Find clusters'
        })
        .option('d', {
            alias: 'diameter',
            describe: 'Find diameter of the graph'
        })
        .help('h')
        .alias('h', 'help')
        .epilog('copyright 2015')
        .argv;

var
    benchmark = new Benchmark(),
    memory = new Memory(),
    timer = new Timer(),
    list_graph = graphtheoryjs.Graph.Graph(graphtheoryjs.Graph.DataStructure.ADJACENCY_LIST),
    vector_graph = graphtheoryjs.Graph.Graph(graphtheoryjs.Graph.DataStructure.ADJACENCY_VECTOR),
    matrix_graph = graphtheoryjs.Graph.Graph(graphtheoryjs.Graph.DataStructure.ADJACENCY_MATRIX),
    graph_list = [],
    graph_file = argv.file;

function printSeparator(color) {
    if (!color) color = 'yellow';
    console.log(chalk[color]("==============================\n"));
}

function saveJSON(graph_obj, data, suffix, use_graph_name_as_prefix) {

    if (use_graph_name_as_prefix === undefined) use_graph_name_as_prefix = true;
	
    //Save the data on the file
    graph_obj.graph.createOutputFolder();

    var name = '';

    if (use_graph_name_as_prefix) {
        name = graph_obj.name;
    }

    fs.writeFileSync(
        graph_obj.graph.output.folder + '/' + name + suffix + '.json',
        JSON.stringify(data, null, 4)
        );
}

function createProgressBar(options) {
    if (!options.clear) options.clear = true;
    return new ProgressBar('running [:bar] :percent :elapsed s', options);
}

function init() {
	
    //If the options are all empty, run all of them
    if (!argv.p && !argv.s && !argv.c && !argv.d) {
        argv.p = argv.s = argv.c = argv.d = true;
    }
    //If the data structure was not specified, use the vector
    if (!argv.vector && !argv.list && !argv.matrix) {
        argv.vector = true;
    }

    console.log(chalk.yellow("\n==== CURRENT MEMORY USAGE ===="));
    graphtheoryjs.Util.Util.printMemory();
    printSeparator();

    if (argv.vector) {
        graph_list.push(
            {
                graph: vector_graph,
                name: 'vector'
            });
    }

    if (argv.matrix) {
        graph_list.push(
            {
                graph: matrix_graph,
                name: 'matrix'
            });
    }

    if (argv.list) {
        graph_list.push(
            {
                graph: list_graph,
                name: 'list'
            });
    }
}

function runMemoryTest() {
    console.log(chalk.yellow("======== MEMORY  TEST ========\n"));
    var
        time_to_load = 0,
        current_graph,
        memory_diff,
        memoryTestFunction = function () {
            current_graph.graph.loadFromFile(graph_file);
        };

    for (var i = 0, graph_list_length = graph_list.length; i < graph_list_length; i += 1) {
        current_graph = graph_list[i];
		
        //Load the graphs and measure time and memory
        
        timer.start();
        memory_diff = memory.run(memoryTestFunction);
        time_to_load = timer.getElapsedTime();

        console.log(chalk.yellow("LOADED GRAPH USING " + current_graph.name.toUpperCase()));
        graphtheoryjs.Util.Util.printMemory(memory_diff);
        console.log(chalk.yellow("LOAD TIME : ") + time_to_load + " s\n");

        saveJSON(current_graph, memory_diff, '_memory_test');

    }
    printSeparator();
}

function runPerformanceTest() {
    //Run the performance test
    var
        current_graph,
        number_of_cyles = 10,
        bar = createProgressBar({
            total: number_of_cyles,
        }),
        bfs = function () {
            BFS(current_graph.graph, current_graph.graph.getRandomVertex());
        },
        dfs = function () {
            DFS(current_graph.graph, current_graph.graph.getRandomVertex());
        },

        benchmark_options = {
            cycles: number_of_cyles,
            onFinishedFunctionTest: function (fn_item) {
                bar.terminate();
                console.log(chalk.yellow("FINISHED " + fn_item.name + "\n"));
                console.log(chalk.yellow(' Cycles : ') + benchmark_options.cycles);
                console.log(chalk.yellow(' Average time : ') + fn_item.time + ' ms\n');

                saveJSON(current_graph, {
                    algorithm: fn_item.name,
                    cycles: benchmark_options.cycles,
                    'average time': fn_item.time,
                    'time unity': 'ms'
                }, '_' + fn_item.name + '_performance_test');
                bar = createProgressBar({ total: number_of_cyles });
            },
            onFinishedCycle: function (current_cycle, cycle_time) {
                bar.tick();
            }
        };
    console.log(chalk.yellow("====== PERFORMANCE TEST ======\n"));

    for (var i = 0, graph_list_length = graph_list.length; i < graph_list_length; i += 1) {
        current_graph = graph_list[i];
        benchmark.clear();

        console.log(chalk.yellow("==== ADJACENCY " + current_graph.name.toUpperCase() + " GRAPH ====\n"));
		
        //Performs DFS test and BFS tests
        benchmark.add("BFS", bfs);

        benchmark.add("DFS", dfs);
		
        //Start the progress bar
        bar.tick(0);

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
        },
        bar = createProgressBar({
            total: 10//Run 5 times for the BFS and 5 for the DFS (vertices 1, 2, 3, 4, 5)
        });

    console.log(chalk.yellow('SPECIFIC TESTS USING ' + current_graph.name.toUpperCase()) + '\n');
    printSeparator();

    bar.tick(0);

    timer.start();

    for (var i = 1; i < 6; i += 1) {
        parents.BFS[i] = {};
        parents.DFS[i] = {};

        var bfs_spanning_tree = BFS(current_graph.graph, i);
        bar.tick();

        var dfs_spanning_tree = DFS(current_graph.graph, i);
        bar.tick();

        for (var j = 10; j < 51; j += 10) {
            parents.BFS[i][j] = bfs_spanning_tree.tree[j];//Get the parent of the vertex j
            parents.DFS[i][j] = dfs_spanning_tree.tree[j];//Get the parent of the vertex j
        }
    }

    var time_to_complete = timer.getElapsedTime();
    
    bar.terminate();

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
    console.log(chalk.yellow('\nTIME : ') + time_to_complete + ' s');
    console.log('');
    parents.time_to_complete = time_to_complete;
    parents['time unity'] = 's';
    saveJSON(current_graph, parents, 'specific_parent_test', false);

    printSeparator();
}

function runFindClusters() {

    var current_graph = graph_list[0];
    console.log(chalk.yellow('FINDING CLUSTERS USING ' + current_graph.name.toUpperCase()) + '\n');

    var bar = createProgressBar({
        total: current_graph.graph.number_of_vertices,
        width: 20
    });
	
    //Start the progress
    bar.tick(0);

    function updateProgressBar(cluster_size, cluster_statistics) {
        bar.tick(cluster_size);
    }

    timer.start();

    var cluster_statistics = findClusters(current_graph.graph, {
        onClusterFound: updateProgressBar
    });

    cluster_statistics.time_to_complete = timer.getElapsedTime();
    cluster_statistics['time unity'] = 's';
    
    bar.terminate();

    console.log(chalk.yellow(' Total : ') + cluster_statistics.total);
    console.log(chalk.yellow(' Biggest : ') + cluster_statistics.biggest);
    console.log(chalk.yellow(' Smallest : ') + cluster_statistics.smallest);
    console.log(chalk.yellow('\nTIME : ') + cluster_statistics.time_to_complete + ' s');
    console.log('');

    saveJSON(current_graph, cluster_statistics, 'clusters_test', false);
    printSeparator();
}

function runFindDiameter() {
    var current_graph = graph_list[0];
    console.log(chalk.yellow('FINDING DIAMETER USING ' + current_graph.name.toUpperCase()) + '\n');

    var bar = createProgressBar({
        total: current_graph.graph.number_of_vertices,
        width: 20
    });
	
    //Start the progress
    bar.tick(0);

    function updateProgressBar(diameter) {
        var progress = -bar.curr + Number.parseInt(diameter.initial_vertex);

        if (!Number.isNaN(progress)) {
            bar.tick(progress);
        }
    }

    timer.start();

    var diameter = findDiameter(current_graph.graph, {
        onDiameterUpdated: updateProgressBar
    });

    diameter.time_to_complete = timer.getElapsedTime();
    diameter['time unity'] = 's';

    bar.terminate();

    console.log(chalk.yellow(' Size : ') + diameter.size);
    console.log(chalk.yellow(' Initial Vertex : ') + diameter.initial_vertex);
    console.log(chalk.yellow(' Last Vertex : ') + diameter.last_vertex);
    console.log(chalk.yellow('\nTIME : ') + diameter.time_to_complete + ' s');
    console.log('');

    saveJSON(current_graph, diameter, 'diameter', false);
    printSeparator();
}

function saveGraphStatistics() {
    //Save the graph statistics
	
    var current_graph = graph_list[0];

    console.log(chalk.yellow('====== GRAPH STATISTICS ======\n'));
    current_graph.graph.saveGraphStatisticsToFile();

    console.log(chalk.yellow(' Number of Vertices : ') + current_graph.graph.number_of_vertices);
    console.log(chalk.yellow(' Number of Edges : ') + current_graph.graph.number_of_edges);
    console.log(chalk.yellow(' Medium Degree : ') + current_graph.graph.medium_degree);
    console.log('');
    printSeparator();
}

//Init and run
init();
runMemoryTest();
saveGraphStatistics();
if (argv.p) runPerformanceTest();
if (argv.s) runSpecificTests();
if (argv.c) runFindClusters();
if (argv.d) runFindDiameter();
