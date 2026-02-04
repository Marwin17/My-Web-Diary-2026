import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Typography } from '@mui/material'
import DiaryList from './diary/DiaryList'

type EntryType = {
  id: number,
  name: string,
  date: Date,
}

function App() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')
  const [entries, setEntries] = useState<EntryType[]>([{
    id: 1,
    name: 'First Comer',
    date: new Date()
  }])
  const [time, setTime] = useState(new Date())
  //console.log(text)

  const addEntry = () => {
    console.log(entries)
    console.log(count)
    console.log(text)
    entries.push({
      id: entries.length + 1,
      name: text,
      date: new Date()
    })
    setEntries([...entries])
  }

    useEffect(() => {
    const interval = setInterval(() => setTime(new Date), 1000);

    return () => clearInterval(interval);
  }, []);
  

  return (
    <>
    <DiaryList />
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <Typography variant= 'h1'>Vite + React</Typography>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more.
        You can place the variable anywhere like here: {count}
      </p>
      <div>
        Entry: <input type="text" value={text} onChange={(event: any) => {
          setText(event.target.value)
        }} />
        <input type="button" value="Add" onClick={() => addEntry()} />
      </div>
      <table border={1}>
        <thead>
          <tr>
            <th>#</th>
            <th>Entry</th>
            <th>Date/time added</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={index}>
              <td>{entry.id}</td>
              <td>{entry.name}</td>
              <td>{`${entry.date.toLocaleDateString()} ${entry.date.toLocaleTimeString()}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {`${time.toLocaleDateString()} ${time.toLocaleTimeString()}`}
      </div>
    </>
  )
}

export default App
