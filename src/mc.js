export function mc_run(func, years, percentiles){
    const stat = 1000;

    // preallocate array (years+1)*stat
    let res = new Array(years+1);
    for(let i=0; i<=years; ++i)
        res[i] = new Array(stat).fill(0);

    // run
    for(let r=0; r<stat; ++r){
        window.init_cache();
        for(let y=0; y<=years; ++y){
            res[y][r] = func(y);
        } // for y
    } // for run

    // sort
    for(let y=0; y<=years; ++y){
        res[y].sort((a,b) => a-b);
    } // y

    // compute stats
    let results = [];
    for(let i in percentiles){
        results.push([]);
        let ratio = percentiles[i];
        let n = ratio * stat;
        if(n >= stat)
            n = stat;
        console.log(years);
        for(let y=0; y<=years; ++y){
            results[i].push(res[y][n]);
        }
    } // i

    return results;
}
