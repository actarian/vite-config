function e(n,t,a){const o=Math.floor(performance.now()/100)/10;console.log("LazyModuleComponent.onInit",o),n.querySelector(".section__time").innerHTML=`LazyModuleComponent.onInit at ${o}s`}e.meta={selector:"[data-lazy-module-component]"};const l={factories:[e]};export{l as LazyModule};