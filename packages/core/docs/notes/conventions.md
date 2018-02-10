# Conventions
 
## register

We `register` something when we want elements to pick up that thing in a given scenario.

E.g.

    UI.register(['app'], App); // register a UI class for the element of type App
   
    read.register(path, readFn); // register a read function for the given path in the tree
    

Key important facts about registrations:
 * registrations are only in effect when you import a module.
 * registrations affect a some global "namespace" in a some particular way
 * when a registration is made on 
 
 
 