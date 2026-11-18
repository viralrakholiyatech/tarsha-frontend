import React from 'react';
import Route from './routes/Route';
function App() {
  process.env.TZ = "Asia/Culcutta";
  return (<Route/>)
}

export default App;
