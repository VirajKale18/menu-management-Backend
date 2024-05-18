const express = require('express');

const os = require("os");

const cluster = require("cluster");

//get the total no. of cpu Cores
const cpuNums = os.cpus().length;
//the below code helps Our Backend in MultiCore Utilzation, Performance Improvement and Fault Tolerance
if(cluster.isPrimary) {
    for(let i=0;i<cpuNums-1; i++) {
        cluster.fork(); //make copy of full project and run it in different core's
    }
    
    cluster.on('exit', () => {
        cluster.fork();
    });  //fault taulrent in case of any cluster fails it force to recreate at place of that particular cluster
}
else {
    const app = require('./app');
}