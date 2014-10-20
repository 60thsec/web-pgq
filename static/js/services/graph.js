/* global angular: true */

angular.module('webPGQ.services')
    .service('graph', ['dagreD3', function(dagreD3)
    {
        var maxTotalCost, lastNodeDefID = 0;

        var nodeTypeIcons = [
            'Aggregate',
            'Append',
            'Function Scan',
            'Hash Anti Join',
            'Hash Join',
            'Hash Setop Except',
            'Hash Setop Intersect',
            'Hash Setop Unknown',
            'Hash',
            'Index Scan',
            'Index Only Scan',
            'Limit',
            'Materialize',
            'Nested Loop',
            'Result',
            'Seq Scan',
            'Sort',
            'Window Agg'
        ];

        var nodeRefRE = /\$\d+\b/g;

        var nodeIDsByRef = {};

        var graphService = {
            nodesFromPlan: function(graph, plan)
            {
                maxTotalCost = Math.max(maxTotalCost, plan['Total Cost']);

                var metadata = {};
                var thisNodeRef;
                var references = [];
                for(var key in plan)
                {
                    if(key != 'Plans')
                    {
                        var val = plan[key];
                        metadata[key] = val;

                        var match;
                        if(key == 'Subplan Name')
                        {
                            if((match = nodeRefRE.exec(val)) !== null)
                            {
                                thisNodeRef = match[0];
                            }
                            else if(val.slice(0, 4) == 'CTE ')
                            {
                                thisNodeRef = val.slice(4);
                            } // end if
                        }
                        else if(key == 'CTE Name')
                        {
                            references.push({name: val, field: key});
                        }
                        else
                        {
                            while((match = nodeRefRE.exec(val)) !== null)
                            {
                                references.push({name: match[0], field: key});
                            } // end while
                        } // end if
                    } // end if
                } // end for

                if(references.length > 0)
                {
                    // Defer calculating `References` until later, after we've fully populated nodeIDsByRef.
                    var fullRefs;
                    Object.defineProperty(metadata, 'References', {
                        enumerable: true,
                        get: function()
                        {
                            if(!fullRefs)
                            {
                                fullRefs = references.map(function(ref)
                                {
                                    ref.id = nodeIDsByRef[ref.name];
                                    return ref;
                                });
                            } // end if
                            return fullRefs;
                        }
                    });
                } // end if

                var useDef;
                if(nodeTypeIcons.indexOf(plan['Node Type']) != -1)
                {
                    useDef = 'node-def-' + (++lastNodeDefID);
                } // end if

                var thisNodeID = graph.addNode(null, {
                    label: plan['Node Type'] + (plan.Strategy ? ' ' + plan.Strategy : ''),
                    metadata: metadata,
                    style: 'fill: #bbb',
                    useDef: useDef,
                    iconURL: 'icons/' + plan['Node Type'] + '.svg'
                });

                if(thisNodeRef)
                {
                    nodeIDsByRef[thisNodeRef] = thisNodeID;
                } // end if

                (plan.Plans || [])
                    .forEach(function(childPlan)
                    {
                        var childInfo = graphService.nodesFromPlan(graph, childPlan);

                        // Calculate an edge size between 1 and 40 pixels, based on percentage of the max total cost.
                        var edgeSize = (childInfo['Total Cost'] / maxTotalCost * 39) + 1;

                        graph.addEdge(null, childInfo.id, thisNodeID, {
                            label: childInfo['Startup Cost'] + '..' + childInfo['Total Cost'],
                            style: 'stroke-width: ' + edgeSize + 'px',
                        });
                    });

                return {
                    id: thisNodeID,
                    'Plan Rows': plan['Plan Rows'],
                    'Plan Width': plan['Plan Width'],
                    'Startup Cost': plan['Startup Cost'],
                    'Total Cost': plan['Total Cost'],
                };
            }, // end nodesFromPlan

            fromPlan: function(plan)
            {
                // Create a new directed graph
                var graph = new dagreD3.Digraph();

                maxTotalCost = 0;

                graphService.nodesFromPlan(graph, plan);

                return graph;
            } // end graphFromPlan
        }; // end graphService

        return graphService;
    }]);
