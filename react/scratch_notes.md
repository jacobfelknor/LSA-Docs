# Scratch React Notes

## useEffect

The `useEffect()` function can be used to perform some action upon the modification of some dependency. For example, make a POST request to a server saving information written to a javascript variable as a result of some user action. In this case, the javascript var is the dependency.

It can also be used to take action on some async process completing. For example, store a mapped version of query results in a ref for use by other functions. More specifically, perform some action on a subset of query results when a button is pressed, but that data is not known before so cannot be written directly into the `onClick` handler, it must be stored in a `useRef` which is updated by the `useEffect` whose dependency is the variable where the query results are written.

## useState vs useRef

Use `useState` when the changes to a variable require the components who use them to re-render. In fact, the updated values of the variable in state will not be available until a re-render occurs.

If you don't need a component to re-render as a result of updating the variable, and especially when you need to reference the updated values other places BEFORE or WITHOUT re-rendering, use `useRef`.
