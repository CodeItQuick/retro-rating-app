import {useEffect, useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

function App() {
    const [thumbsDown, setThumbsDown] = useState(0);
    const [thumbsUp, setThumbsUp] = useState(0);
    const [overallThumbsDown, setOverallThumbsDown] = useState(0);
    const [overallThumbsUp, setOverallThumbsUp] = useState(0);
    const [guid] = useState(uuidv4());

    useEffect(() => {
        fetch(`/api/participant/?thumbsUp=${thumbsUp}&thumbsDown=${thumbsDown}&user=${guid}`,
            {method: "GET"}).then(x => x.json())
            .then(({serverThumbsUp, serverThumbsDown}) => {
                console.log(serverThumbsUp)
                setOverallThumbsDown(serverThumbsDown);
                setOverallThumbsUp(serverThumbsUp);
            })
    }, [thumbsUp, thumbsDown])

    const onClickHandler = () => {

        fetch(`/api/participant/?thumbsUp=${0}&thumbsDown=${0}&user=${guid}`,
            {method: "GET"}).then(x => x.json())
            .then(({serverThumbsUp, serverThumbsDown}) => {
                console.log(serverThumbsUp)
                setOverallThumbsDown(serverThumbsDown);
                setOverallThumbsUp(serverThumbsUp);
            })
    }
    const onAdminStartClickHandler = async () => {

        fetch(`/api/admin/?user=${guid}`,
            {method: "GET"}).then(x => x.text())
            .then(console.log)
    }
    const onAdminResetClickHandler = () => {

        fetch(`/api/admin/?user=${guid}&reset=true`,
            {method: "GET"}).then(x => x.text())
            .then(() => onClickHandler())
    }

    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo"/>
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo"/>
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => {
                    setThumbsUp(1);
                    setThumbsDown(0);
                }}>
                    Thumbs Up +{thumbsUp}
                </button>
                <button onClick={() => {
                    setThumbsUp(0);
                    setThumbsDown(1);
                }}>
                    Thumbs Down +{thumbsDown}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <div className="card">
                <button onClick={onClickHandler}>Refresh Score</button>
                <div>
                    Overall Thumbs Up +{overallThumbsUp}
                </div>
                <div>
                    Overall Thumbs Down +{overallThumbsDown}
                </div>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
                <button onClick={onAdminStartClickHandler}>Start Scoring</button>
                <button onClick={onAdminResetClickHandler}>Reset Score</button>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App
