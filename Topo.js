/*
Topo v0.1
Written by: Freya & Sean
Date: Nov 14, 2015
Written as a project for COSC 3336 (Programming Languages), Topo.js is an interpreter for the programming language (in progress) Topo,
designed to work with the html page packaged with this file.
*/

////////////////////
/// Main         ///=============================================================================---___
/// Method       ///--------------------------------------------------------------------------------------
////////////////////


function runCode() {
	var code = document.getElementById("code").value;
	var terp = new TopoLang()
	document.getElementById("console").innerHTML = "";
	terp.addWords(Keywords);
	terp.addWords(Mathwords);
	terp.run(code);
}

function clearConsole() {
	document.getElementById("console").innerHTML = "";
}

////////////////////
/// Main         ///=============================================================================---___
/// Interpreter  ///--------------------------------------------------------------------------------------
////////////////////

function TopoLexer(code) {
	var tokenList = code.replace(/([,;:\+\*\/-])/g, " $1 ");
	tokenList = tokenList.replace(/\(/g, " ( ");
	tokenList = tokenList.replace(/\)/g, " ) ");
	tokenList = tokenList.split(/\s+/);
	var tokenIndex = 0;
	this.getNext = function () {
		if (tokenIndex >= tokenList.length) return null;
		return tokenList[tokenIndex++];
	}
}

function TopoLang() {
	this.dictionary = {};
	this.edgeDict = {};
	this.vertDict = {};
	this.numStack = [];
	this.opStack = [];
	this.t = 0;
	
	this.addWords = function(new_dict) {
		for (var word in new_dict)
			this.dictionary[word.toUpperCase()] = new_dict[word];
	};
	
	this.run = function(code) {
		this.lexer = new TopoLexer(code);
		var token;
		var num_val;
		
		while (token = this.lexer.getNext()) {
		//document.getElementById("console").innerHTML += token;
			token = token.toUpperCase();
			num_val = parseFloat(token);
			
			if (this.dictionary[token]) {
				this.dictionary[token](this);
			} else if (!isNaN(num_val)) {
				this.numStack.push(num_val);
			} else {
				alert("Syntax Error: Unrecognized Token: " + token);
			}
		}
		//this.debugPrint()
	}; //End of DictLang.run
	
	this.debugPrint = function() {
		/*document.getElementById("console").innerHTML += "<br> --- <br> -Dictionary- <br>"
		for (var i in this.dictionary) {
			var val = this.dictionary[i];
			var message = i + ": " + val + "<br>";
			document.getElementById("console").innerHTML += message;
		};*/
		document.getElementById("console").innerHTML += "<br>--- <br> -vertDict- <br>"
		for (var i in this.vertDict) {
			var val = this.vertDict[i].val;
			var message = i + ": " + val + "<br>";
			document.getElementById("console").innerHTML += message;
		};
		document.getElementById("console").innerHTML += "<br> --- <br> -edgeDict- <br>"
		for (var i in this.edgeDict) {
			var vertices = this.edgeDict[i].v1 + ", " + this.edgeDict[i].v2;
			var ordering = this.edgeDict[i].ordering;
			var priority = this.edgeDict[i].priority;
			var operator = this.edgeDict[i].operator;
			var message = i + ": (" + vertices + "), ord: " + ordering + ", op: " + operator + ", prio: " + priority + "<br>";
			document.getElementById("console").innerHTML += message;
		};
		document.getElementById("console").innerHTML += "<br> --- <br> -numStack- <br>"
		for (var i in this.numStack) {
			var message = "val " + i + ": " + this.numStack[i] + "<br>";
			document.getElementById("console").innerHTML +=  message;
		};
	}
	this.defineVert = function (key, val) {
		this.vertDict[key] = val;
	};
	this.defineEdge = function (key, val) {
		this.edgeDict[key] = val;
	};
	this.define = function (key, val) {
		this.dictionary[key] = val;
	};
}

////////////////////
/// Object       ///=============================================================================---___
/// Definitions  ///--------------------------------------------------------------------------------------
////////////////////

var defaults = {
	val: null,
	priority: 0,
	operator: "null",
	ordering: "seq",
};

function Vertex(name, value) {
	this.name = name;
	this.val = value;
}

function Edge(id, v1, v2) {
	this.name = id;
	this.v1 = v1;
	this.v2 = v2;
	this.priority = defaults.priority; //Determines the order in which edges are run
	this.operator = defaults.operator; //Defines what an edge *does* with the values in its two vertices
	this.ordering = defaults.ordering; //Determines the ordering of the parameters passed to an edge's operator
	//rand, big, small, seq, revseq, abc, zyx
	this.getOrder = function(num,terp) {
		var v1;
		var v2;
		if (this.ordering == "rand") {
			if (Math.random() > .5) {
				v1 = this.v1;
				v2 = this.v2;
			} else {
				v2 = this.v1;
				v1 = this.v2;
			}
		} else if (this.ordering == "big") {
			if (terp.vertDict[this.v1].val > terp.vertDict[this.v2].val) {
				v1 = this.v1;
				v2 = this.v2;
			} else {
				v2 = this.v1;
				v1 = this.v2;
			}
		} else if (this.ordering == "small") {
			if (terp.vertDict[this.v1].val < terp.vertDict[this.v2].val) {
				v1 = this.v1;
				v2 = this.v2;
			} else {
				v2 = this.v1;
				v1 = this.v2;
			}
		} else if (this.ordering == "seq") {
			v1 = this.v1;
			v2 = this.v2;
		} else if (this.ordering == "revseq") {
			v2 = this.v1;
			v1 = this.v2;
		} /*else if (this.ordering == "abc") {
		} else if (this.ordering == "zyx") {
		}*/
		else
			alert("Edge " + this.name + " ordering set to innapropriate value: " + this.ordering);
		if (num == 1) return v1;
		if (num == 2) return v2;
	};
}

////////////////////
/// Keyword      ///=============================================================================---___
/// Section      ///--------------------------------------------------------------------------------------
////////////////////
var Keywords = {
	//Checks the next token and creates a "thing" of that type
	"NEW":function(terp){
		var type = terp.lexer.getNext().toUpperCase();
		//Creates any amount of , seperated vertices and places a value in all of them
		//EX: new Vertex a,b,c,d: 10
		if (type == "VERTEX") {
			var vertList = [];
			var id;
			while ((id = terp.lexer.getNext()) && terp.lexer.getNext() == ",") {
				vertList.push(new Vertex(id));
			};
			vertList.push(new Vertex(id));
			var nextToken = terp.lexer.getNext();
			var val;
			if (!isNaN(parseFloat(nextToken)))
				val = nextToken;
			else if (nextToken == ";")
				val = defaults.val;
			else {
				terp.dictionary[nextToken](terp);
				val = terp.numStack.pop();
			}
			for (var i in vertList) {
				vertList[i].val = val;
				terp.defineVert(vertList[i].name, vertList[i]);
			};
		}
		//Creates an single edge with the vertices given
		//EX: new Edge ab: a,b
		else if (type == "EDGE") {
			var id = terp.lexer.getNext();
			terp.lexer.getNext(); //Get rid of :
			var v1 = terp.lexer.getNext();
			terp.lexer.getNext(); //Get rid of ,
			var v2 = terp.lexer.getNext();
			if (terp.vertDict.hasOwnProperty(v1) && terp.vertDict.hasOwnProperty(v2)) {
				terp.defineEdge(id, new Edge(id, v1, v2))
			} else
				alert("Missing a vertex for edge: " + id);
		}
		//Defines a new operator aka function
		else if (type == "OPERATOR") {
			var id = terp.lexer.getNext();
			terp.lexer.getNext() //Get rid of :
			var code = "";
			var token;
			while ((token = terp.lexer.getNext()) && token != ";")
				code += token + " ";
			var operator = function(v1,v2) {
				var miniTerp = new TopoLang()
				miniTerp.define("V1",function(terpPrime){terpPrime.numStack.push(terp.vertDict[v1].val)});
				miniTerp.define("V2",function(terpPrime){terpPrime.numStack.push(terp.vertDict[v2].val)});
				miniTerp.addWords(Keywords);
				miniTerp.addWords(Mathwords);
				miniTerp.run(code);
				terp.vertDict[v1].val = miniTerp.dictionary["V1"];
				terp.vertDict[v2].val = miniTerp.dictionary["V2"];
			};
			terp.define(id, operator);
		} else {
			alert("Syntax Error: Expected instantiable TYPE, found " + type);
		}
	},
	"DEFAULT":function(terp){
		var type = terp.lexer.getNext().toUpperCase()
		terp.lexer.getNext(); //kill :
		var param = terp.lexer.getNext();
		if (type == "VALUE") {
			if (terp.dictionary[param])
				terp.dictionary[param](terp);
			else
				terp.numStack.push(param)
			defaults.val = terp.numStack.pop();
		} else if (type == "OPERATOR") {
			defaults.operator = param;
		} else if (type == "ORDERING") {
			defaults.ordering = param;
		} else if (type == "PRIORITY") {
			if (terp.dictionary[param])
				terp.dictionary[param](terp);
			else
				terp.numStack.push(param)
			defaults.priority = terp.numStack.pop();
		} else 
			alert("Syntax Error: Expected settable TYPE, found " + type);
	},
	"SET":function(terp){
		var type = terp.lexer.getNext().toUpperCase();
		var id = terp.lexer.getNext();
		terp.lexer.getNext();
		var param = terp.lexer.getNext();
		
		if (type == "VALUE") {
			if (terp.dictionary[param])
				terp.dictionary[param](terp);
			else
				terp.numStack.push(param);
			terp.vertDict[id].val = terp.numStack.pop();
		} else if (type == "OPERATOR") {
			terp.edgeDict[id].operator = param;
		} else if (type == "ORDERING") {
			terp.edgeDict[id].ordering = param;
		} else if (type == "PRIORITY") {
			if (terp.dictionary[param])
				terp.dictionary[param](terp);
			else 
				terp.numStack.push(param);
			terp.edgeDict[id].priority = terp.numStack.pop();
		} else
			alert("Syntax Error: Expected settable TYPE, found " + type);
	},
	"RETURN":function(terp){
		var v1 = terp.lexer.getNext();
		if (terp.dictionary[v1]) {
			terp.dictionary[v1](terp);
		} else {
			terp.numStack.push(v1);
		}
		v1 = terp.numStack.pop();
		terp.lexer.getNext();
		var v2 = terp.lexer.getNext();
		if (terp.dictionary[v2])
			terp.dictionary[v2](terp);
		else
			terp.numStack.push(v2);
		v2 = terp.numStack.pop();
		terp.dictionary["V1"] = v1;
		terp.dictionary["V2"] = v2;
	},
	"STEP":function(terp){
		var edgeList = [];
		for (var edge in terp.edgeDict) {
			edgeList.push(terp.edgeDict[edge]);
		}
		edgeList.sort(function(a,b){a.priority - b.priority});
		var n = parseFloat(terp.lexer.getNext());
		terp.t += n;
		for (var i = 0; i < n; i++)
			for (var edgeIndex = 0; edgeIndex < edgeList.length; edgeIndex++) {
				var v1 = edgeList[edgeIndex].getOrder(1,terp);
				var v2 = edgeList[edgeIndex].getOrder(2,terp);
				terp.dictionary[edgeList[edgeIndex].operator](v1,v2);
			}
		document.getElementById("console").innerHTML += "<br> At t = " + terp.t + "<br>";
		for (var vert in terp.vertDict)
			document.getElementById("console").innerHTML += terp.vertDict[vert].name + ": " + terp.vertDict[vert].val + "<br>";
	}
};

////////////////////
/// Math         ///=============================================================================---___
/// Section      ///--------------------------------------------------------------------------------------
////////////////////

var Mathwords = {
	"(": function(terp) {
		var token;
		// while there's still data being read
		while ((token = terp.lexer.getNext()) && token != ")") {
			token = token.toUpperCase();
			var num_val = parseFloat(token).toString();
			// if the token is in the dictionary then call it
			if (terp.dictionary[token])
				terp.dictionary[token](terp);
			// if the token is a number then push it on the stack
			else if (!isNaN(num_val))
				terp.numStack.push(num_val);
			else
				alert("Syntax Error: Unrecognized Token: " + token);
		}
	},
	"+": function(terp) {
		var token;
		// Check for previous token on stack
		if (terp.numStack.length > 0) {
			token = terp.lexer.getNext().toUpperCase()
			var num_val = parseFloat(token).toString();
			// throw error if token is in the dictionary
			// exception for (
			if(terp.dictionary[token] && token != "(") {
				alert("Syntax Error: Unexpected token. Received an operator when a number was expected");
			}
			// call ( function if the token is a (
			// and preserves operator in opStack
			else if (token == "(") {
				terp.opStack.push("+");
				terp.dictionary[token](terp);
				
				var num2 = terp.numStack.pop();
				var num1 = terp.numStack.pop();
				var op = terp.opStack.pop();
				var result = eval(num1 + op + num2);
				
				terp.numStack.push(result);
			}
			// if next token is a number then
			// perform operation and return value
			else if (!isNaN(num_val)) {
				terp.numStack.push(num_val);
				terp.opStack.push("+");
				var num2 = terp.numStack.pop();
				var num1 = terp.numStack.pop();
				var op = terp.opStack.pop();
				var result = eval(num1 + op + num2);
				
				terp.numStack.push(result);
			}
		}
		else
			alert("Could not perform \"+\" operation. Not enough items on stack.");
	},
	"-": function(terp) {
		var token = terp.lexer.getNext().toUpperCase();
		var num_val = parseFloat(token).toString();
		
		if(terp.dictionary[token] && token != "(")
			alert("Syntax Error: Unexpected token. Received an operator when a number was expected");
		// call ( function if the token is a (
		// and preserves operator in opStack
		if (token == "(") {
			terp.opStack.push("-");
			terp.dictionary[token](terp);
				
			var num2 = terp.numStack.pop();
			var num1 = terp.numStack.pop();
				
			var result = eval(num1 + (0 - num2));
			
			terp.numStack.push(result);		
		}
		// if there's nothing on numStack && nothing on opStack -> Ex: s1[] s2[]
		if (terp.numStack.length + terp.opStack.length == 0)
			terp.numStack.push("-" + token);
		// if numStack.length > opStack.length -> Ex: s1[1, 2] s2[/], s1[1] s2[]
		else if (terp.numStack.length > terp.opStack.length) {
			// if token == "-"
			if (token == "-") {
				// push "-" to opStack
				terp.opStack.push("-");
				// call -
				terp.dictionary[token](terp);
				// perform operation n1 + (0 - n2)
				var num2 = terp.numStack.pop();
				var num1 = terp.numStack.pop();
				
				var result = eval(num1 + (0 - num2));
				
				terp.numStack.push(result);
			}
			// if token is a number
			if (!isNaN(num_val)) {
				terp.numStack.push(token);
				var num2 = terp.numStack.pop();
				var num1 = terp.numStack.pop();
				
				// perform operation n1 - n2
				var result = eval(num1 - num2);
				
				terp.numStack.push(result);
			}
		}
		// if numStack.length == opStack.length -> Ex: s1[1] s2[-]
		else if (terp.numStack.length == terp.opStack.length) {
			// if previous operator is - && token is a number
			if (terp.opStack[terp.opStack.length - 1] == "-" && !isNaN(num_val)) {
				// push a negative number onto stack
				terp.numStack.push("-" + token);
				// remove - from stack; no longer necessary
				terp.opStack.pop();
			}
			// (if previous op is - && next token isn't a number) OR (if previous op isn't -)
			if ((terp.opStack[terp.opStack.length - 1] == "-" && isNaN(num_val)) || (terp.opStack[terp.opStack.length - 1] != "-"))
				alert("Syntax Error: Unexpected token. Received an operator when a number was expected");
		}
		// if there's nothing on numStack && opStack isn't empty -> Ex: s1[] s2[*]
		else if (terp.numStack.isEmpty() && !terp.opStack.isEmpty())
			alert("Syntax Error: Unexpected token. Received an operator when a number was expected");	
	},
	"*": function(terp) {
		var token;
		// Check for previous token on stack
		if (terp.numStack.length > 0) {
			token = terp.lexer.getNext().toUpperCase()
			var num_val = parseFloat(token).toString();
			// throw error if token is in the dictionary
			// exception for (
			if(terp.dictionary[token] && token != "(")
				alert("Syntax Error: Unexpected token. Received an operator when a number was expected");
			// call ( function if the token is a (
			// and preserves operator in opStack
			else if (token == "(") {
				terp.opStack.push("*");
				terp.dictionary[token](terp);
				
				var num2 = terp.numStack.pop();
				var num1 = terp.numStack.pop();
				var op = terp.opStack.pop();
				var result = eval(num1 + op + num2);
				
				terp.numStack.push(result);
			}
			// if next token is a number then
			// perform operation and return value
			else if (!isNaN(num_val)) {
				terp.numStack.push(num_val);
				terp.opStack.push("*");
				
				var num2 = terp.numStack.pop();
				var num1 = terp.numStack.pop();
				var op = terp.opStack.pop();
				var result = eval(num1 + op + num2);
				
				terp.numStack.push(result);
			}
		}
		else
			alert("Could not perform \"*\" operation. Not enough items on stack.");
	},
	"/": function(terp) {
		var token;
		// Check for previous token on stack
		if (terp.numStack.length > 0) {
			token = terp.lexer.getNext().toUpperCase()
			var num_val = parseFloat(token).toString();
			// throw error if token is in the dictionary
			// exception for (
			if(terp.dictionary[token] && token != "(")
				alert("Syntax Error: Unexpected token. Received an operator when a number was expected");
			// call ( function if the token is a (
			// and preserves operator in opStack
			else if (token == "(") {
				terp.opStack.push("/");
				terp.dictionary[token](terp);
				
				var num2 = terp.numStack.pop();
				var num1 = terp.numStack.pop();
				var op = terp.opStack.pop();
				var result = eval(num1 + op + num2);
				
				terp.numStack.push(result);
			}
			// if next token is a number then
			// perform operation and return value
			else if (!isNaN(num_val)) {
				terp.numStack.push(num_val);
				terp.opStack.push("/");
				
				var num2 = terp.numStack.pop();
				var num1 = terp.numStack.pop();
				var op = terp.opStack.pop();
				var result = eval(num1 + op + num2);
				
				terp.numStack.push(result);
			}
		}
		else
			alert("Could not perform \"/\" operation. Not enough items on stack.");
	}
};

////////////////////
/// Logic        ///=============================================================================---___
/// Section      ///--------------------------------------------------------------------------------------
////////////////////

var Logicwords =
{
	"==": function (terp) {},
	">": function (terp) {},
	">=": function (terp) {},
	"<": function (terp) {},
	"<=": function (terp) {},
	"!": function (terp) {},
	"!=": function (terp) {},
	"||": function (terp) {},
	"&&": function (terp) {}
};