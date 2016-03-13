# ptrn
Pattern matching in javascript

```javascript
const P = require('ptrn');
```

```javascript
P.P('param') // bind value to parameter "param" which will be passed as argument to handler
P.HT('h', 't') // bind array head and tail to parameters "h" and "t"
               // which will be passed as arguments to handler
P._ // wildcard for matching any value
```

### list sum:
```javascript
const sum = P(
  [[],                       () => 0],
  [P.HT(P.P('h'), P.P('t')), ({ h, t }) => h + sum(t)]
);

sum([1, 2, 3, 4]); // 10
```

### fib:
```javascript
const fib = P(
  [0,        () => 0],
  [1,        () => 1],
  [P.P('n'), ({ n }) => fib(n - 1) + fib(n - 2)]
);

fib(10); // 55
```

### tree sum:
```javascript
const sum = P(
  [{ left: P.P('l'), right: P.P('r') }, ({ l, r }) => sum(l) + sum(r)],
  [P.P('n'),                            ({ n }) => n]
);

const tree = {
  left: {
    left: 10,
    right: {
      left: 20,
      right: 30
    }
  },
  right: 40
}

sum(tree); // 100
```
