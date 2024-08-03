import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LogarithmicScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

import { mc_run } from './mc';

import './App.css';

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, PointElement, LineElement, Title, Tooltip, Legend);

function n(mu = 0, sigma = 1){
  let u1, u2;
  do {
    u1 = Math.random();
    u2 = Math.random();
  } while (u1 <= Number.EPSILON);

  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * sigma + mu;
}

window.vars = [];
window.cache = {}

window.init_cache = function(){
    for(let i in window.vars){
        let f = window.vars[i];
        window.cache[f] = {};
    }
}

function compile(f, src){
    let code = "window."+f+"_orig = function(y){" + src + "};";
    eval(code);
    window[f] = function(y){
        if(y in window.cache[f])
            return window.cache[f][y];
        let res = window[f+"_orig"](y);
        window.cache[f][y] = res;
        return res;
    }
    window.vars.push(f);
}

const ChartComponent = ({ onDelete }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [sampleLines, setSampleLines] = useState([[]]);
  const [percentLines, setPercentLines] = useState([[]]);

  const handleApply = () => {
    window.cache[name] = {};
    compile(name, code);
    const range = Array.from({ length: 31 }, (_, i) => i);
    let res = [];
    for(let i=0; i<20; ++i){
        window.cache[name] = {};
        const numbers = range.map(y => window[name](y));
        res.push(numbers);
    }
    setSampleLines(res);

    let stats = mc_run(window[name], 30, [0.1, 0.5, 0.9]);
    setPercentLines(stats);
    console.log(stats);
  };

  const lables = ["10%", "50%", "90%"];

  const data = {
    labels: sampleLines[0].map((_, index) => index),
/*
    datasets: sampleLines.map((data, index) => ({
      label: `Line ${index + 1}`,
      data: sampleLines[index],
      borderColor: 'rgb(75, 192, 192)',
      //borderColor: `hsl(${index * 137.5 % 360}, 70%, 50%)`,
      tension: 0.1,
    }))
*/
    datasets: percentLines.map((data, index) => ({
      label: `${lables[index]}`,
      data: percentLines[index],
      borderColor: `hsl(${index * 137.5 % 360}, 70%, 50%)`,
      tension: 0.1,
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
      },
      y: {
        type: 'logarithmic',
        position: 'left',
        min: 10000
      }
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="chart-comp">
      <div className="code-div">
      <input type="text" onChange={(e)=>setName(e.target.value)}
       placeholder="Name"/> (y)
      <button onClick={handleApply}>Apply</button>
      <button onClick={onDelete}>Delete</button>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Code"
      />
      </div>
      <div style={{ height: '200px' }} className="chart-div">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

const App = () => {
  const [charts, setCharts] = useState([{ id: 1 }]);

  const addChart = () => {
    const newId = charts.length > 0 ? Math.max(...charts.map(c => c.id)) + 1 : 1;
    setCharts([...charts, { id: newId }]);
  };

  const deleteChart = (id) => {
    setCharts(charts.filter(chart => chart.id !== id));
  };

  return (
    <div>
      {charts.map(chart => (
        <ChartComponent key={chart.id} onDelete={() => deleteChart(chart.id)} />
      ))}
      <button onClick={addChart}>Add Chart</button>
    </div>
  );
};

export default App;

/*

if(y==0)
  return 40000;
else if(y<20)
  return salary(y-1)*1.02;
else
  return 0;

if(y<20)
  return 0;
if(y==20)
  return 25000;
else
  return spending(y-1)*1.01;

if(y==0)
  return 0;
else
  return (capital(y-1)+salary(y-1)/10)*(1+n(0.1,0.1))-spending(y);

*/
