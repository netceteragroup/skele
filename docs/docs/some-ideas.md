## Patterns

Note: This idea came about in an attempt to generalize the way various aspects of elements are registered about:
To simplify the implementation on top of redux-elm, we opted for a simpler pattern format.

---
 
Each time an action is fired, it fired by an element that is associated with a given node in the element tree. Thus,
the full identifier of the fired action is represented as a tuple:

    [path, actionId] 
  
The path is simply a "path" from the root of the state (one that you would use in `list.getIn()`: 

To register an update for a specific action, one most pattern-match this "fully qualified" action. 

To do so, a pattern matching facility is introduced to express "glob" like patterns, similar to ones used in shells:

- `**/*.js` -- matches any path (within a dir hierarchy) that endsw with js
- `**/test/**/*.spec` -- you get the picture

In the Element's case, we introduce the following mini DSL for pattern matching:

    Pattern ::= [Expr]
    Expr ::= string | beginning() | seq() | end() | any() | ofKind() 
    
    
- `beginning()` matches the begining of the path (similar to ^ in reg-expresions)
- `end()` matches the end of the path ($ in regex)
- `seq(expr())` matches a sequence (zero or more) of path elements that match the expression (* operator in regex)
- `any()`  matches any path element (? in regex)
- `ofKind()` matches a path element under which amn element of a speicfic kind resides

E.g.

    [beginning(), seq(any()), ofKind('teaser'] -- matches an element within the hierarchy of the kind 'teaser'
    [(seq(