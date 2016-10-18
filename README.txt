////////////////////
/// About        ///===================================================================---___
/// Topo         ///----------------------------------------------------------------------------
////////////////////

Topo is a language cenetered around the construction of topological graphs.

The interpreter is written in Javascript, and easily interfaced with through a simlple HTML file ( topo.html )

Topo accepts a number of commands to create and modify *Vertices* and *Edges*

The general Syntax to instantiate a new object is
new [type] [identifier]: [value]

You may declare multiple vertices at a time with the syntax
new Vertex a,b,c: [value]

Edges may only be declared one at a time, and require two previously declared vertices to be passed to them
new Edge ab: a,b

Each Edge performs a function, known as an Operation, on its two vertices. Operations can be declared as follows:
new Operation take:
	return ( v1 + 1 ) , ( v2 - 1 );
	
v1 and v2 refer to the Edge's vertices. Return takes two values, which correspond to its vertices v1 and v2.
Operations must end with a semicolon.

Which vertex is considered v1 and which vertex is considered v2 is based on the Edge's Ordering.
The Ordering of an Edge can be changed with the set command:
set Ordering [edgeName]: seq

The ordering properties are seq (v1 is the first vertex that was passed in), revseq (v1 is the second vertex that was passed in), big (v1 is the vertex that holds the larger value), small(v1 is the vertex that holds the smaller value), rand (random, 50/50 chance)

You may also set the Operation of an Edge in the form
set Operation [edgeName]: [previouslyDeclaredOperation]

And its priority (the order in which edges are executed)
set Priority [edgeName]: n

All properties that me be set may also be "defaulted", so that any objects instantiated afterwords will contain that value
default [property]: [value]
(a vertex may be declared with default values with the syntax
new Vertex a: ;)

After declaring all vertices, operators, and edges, you may use the step command to execute each Edge's Operator on its vertices values
step n will run each edge's operator in ascending priority order n times, then print out the current values of each vertex
(to print out initial values, try step 0)

Math can be done as well. Operators will resolve in sequential order unless parentheses are included.

Common syntax errors will trigger alerts, although the interpretor will not currently catch /all/ syntax errors.

////////////////////
/// Keyword      ///===================================================================---___
/// Cheatsheet   ///----------------------------------------------------------------------------
////////////////////

new Vertex a,b: 0
	Edge ab: a,b
	Operator swap: return v2,v1;

set value a: 10
	operator ab: swap
	ordering ab: seq
	priority ab: 12

default value: 12
		operator: swap
		ordering: revseq
		priority: 3

step n