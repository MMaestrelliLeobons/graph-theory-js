'use strict';

var BFS = require('../../../index').Algorithms.BFS;
var Graph = require('../../../index').Graph.AdjacencyVectorGraph;
var assert = require('assert');
var appRoot = require('app-root-path');

function applyBFS(graph_file, initial_vertex, callbacks) {
    var g = new Graph();

    g.loadFromFile(appRoot + '/test/assets/graph_files/' + graph_file);

    return BFS(g, initial_vertex, callbacks);
}

describe('BFS', function () {

    describe('Spanning Tree', function () {

        it('should attribute the root to the first vertex', function () {
            var g = new Graph();

            g.addEdge(1, 2);

            assert.equal(BFS(g, 1).root, 1);
        });

        it('should create the correct tree', function () {
            var root = 1;
            var spanning_tree = applyBFS('small_graph.txt', root);

            assert.equal(spanning_tree.root, root);
            assert.equal(spanning_tree.tree[0], undefined);
            assert.equal(spanning_tree.tree[1], null);
            assert.equal(spanning_tree.tree[2], 1);
            assert.equal(spanning_tree.tree[3], 5);
            assert.equal(spanning_tree.tree[4], 5);
            assert.equal(spanning_tree.tree[5], 1);
        });

        it('should create the correct depths', function () {
            var root = 1;
            var spanning_tree = applyBFS('small_graph.txt', root);

            assert.equal(spanning_tree.depths[0], undefined);
            assert.equal(spanning_tree.depths[1], 0);
            assert.equal(spanning_tree.depths[2], 1);
            assert.equal(spanning_tree.depths[3], 2);
            assert.equal(spanning_tree.depths[4], 2);
            assert.equal(spanning_tree.depths[5], 1);
        });
    });

    describe('Callbacks', function () {

        it('should not find a visited vertex', function () {
            var root = 1;
            var visited_vertices = [];
            var called_the_callback = false;

            var onVertexFound = function (vertex, vertex_depth) {
                assert.equal(visited_vertices[vertex], undefined);
                called_the_callback = true;
            };

            var onVertexVisited = function (vertex, vertex_depth) {
                visited_vertices[vertex] = true;
            };

            var spanning_tree = applyBFS('small_graph.txt', root, {
                onVertexFound: onVertexFound,
                onVertexVisited: onVertexVisited
            });

            assert.equal(called_the_callback, true);
        });

        describe('onVertexVisited', function () {
            it('should pass the correct depths', function () {
                var root = 1;
                var expected_depths = [undefined, 0, 1, 2, 2, 1];
                var called_the_callback = false;

                var onVertexVisited = function (vertex, vertex_depth) {
                    assert.equal(vertex_depth, expected_depths[vertex]);
                    called_the_callback = true;
                };

                var spanning_tree = applyBFS('small_graph.txt', root, { onVertexVisited: onVertexVisited });

                assert.equal(called_the_callback, true);
            });

            it('should pass all the vertices', function () {
                var root = 1;
                var expected_vertices = [false, true, true, true, true, true];
                var called_the_callback = false;

                var onVertexFound = function (vertex, vertex_depth) {
                    assert.equal(expected_vertices[vertex], true);
                    called_the_callback = true;
                };

                var spanning_tree = applyBFS('small_graph.txt', root, { onVertexFound: onVertexFound });

                assert.equal(called_the_callback, true);
            });
        });

        describe('onVertexFound', function () {
            it('should pass the correct depths', function () {
                var root = 1;
                var expected_depths = [undefined, 0, 1, 2, 2, 1];
                var called_the_callback = false;

                var onVertexFound = function (vertex, vertex_depth) {
                    assert.equal(vertex_depth, expected_depths[vertex]);
                    called_the_callback = true;
                };

                var spanning_tree = applyBFS('small_graph.txt', root, { onVertexFound: onVertexFound });

                assert.equal(called_the_callback, true);
            });

            it('should pass all the vertices, but the initial vertex', function () {
                var root = 1;
                var expected_vertices = [false, false, true, true, true, true];
                var called_the_callback = false;

                var onVertexFound = function (vertex, vertex_depth) {
                    assert.equal(expected_vertices[vertex], true);
                    called_the_callback = true;
                };

                var spanning_tree = applyBFS('small_graph.txt', root, { onVertexFound: onVertexFound });

                assert.equal(called_the_callback, true);
            });
        });
    });
});