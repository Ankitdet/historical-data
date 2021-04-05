import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import './index.css';
import DataTable from './pages/DataTable';

ReactDOM.render(
  <React.StrictMode>
    <div className="wrapper">
      <div id="content" className="active">
        <DataTable />
      </div>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);
