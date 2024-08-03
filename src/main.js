function n(mu = 0, sigma = 1){
  let u1, u2;
  do {
    u1 = Math.random();
    u2 = Math.random();
  } while (u1 <= Number.EPSILON);

  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * sigma + mu;
}

let vars = {};
let cache = {}

function init_cache(){
    for(let f in vars){
        cache[f] = {}
    }
}

vars["addition"]=`
    if(y==0)
        return 500;
    if(y<20)
        return addition(y-1)*1.01;
    return 0;
`;

vars["rate"]=`
    return 0.07;
`;

vars["rate_sigma"]=`
    return 0.07;
`;

vars["pension"]=`
    if(y<20)
        return 0;
    if(y==20)
        return 2000;
    return pension(y-1)*1.01;
`;

vars["capital"] = `

    if(y==0)
        return addition(0);
    let res = capital(y-1)*(1+n(rate(), rate_sigma()))+addition(y);
    if(y>=20)
        res -= pension(y);

    return res;
`;

for(let f in vars){
    console.log("parsing " + f);

    let code = f+"_orig = function(y){" + vars[f] + "};";
    eval(code);
    global[f] = function(y){
        if(y in cache[f])
            return cache[f][y];
        let res = global[f+"_orig"](y);
        cache[f][y] = res;
        return res;
    }
}

init_cache();

for(let y=0; y<50; ++y){
    console.log(y, capital(y));
    // capital.next();
}
