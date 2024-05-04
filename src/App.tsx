import {useEffect, useState} from 'react'
import './App.css'
import {useNavigate} from "react-router-dom";

const uuidv4 = () => {
    const makeGuid = () => {
        const guid = "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
            (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
        );
        return guid
    }
    return makeGuid;
}

const parentUrl = '';

function App() {
    const [thumbsDown, setThumbsDown] = useState(0);
    const [thumbsUp, setThumbsUp] = useState(0);
    const [overallThumbsDown, setOverallThumbsDown] = useState(0);
    const [overallThumbsUp, setOverallThumbsUp] = useState(0);
    const [guid, setGuid] = useState('');
    const [session, setSession] = useState('');
    const navigateFunction = useNavigate();
    useEffect(() => {
        if (session === '') {
            const queryParams = new URLSearchParams(window.location.search)
            const userSession = queryParams.get("session")
            if (!userSession) {
                navigateFunction(`/?session=${uuidv4()()}`)
            }
        }
        if (guid === '') {
            setGuid(uuidv4()())
        }
        const queryParams = new URLSearchParams(window.location.search)
        const userSession = queryParams.get("session")
        if (userSession?.length) {
            setSession(userSession)
        }
    }, [session, guid])
    // const queryParams = new URLSearchParams(window.location.search)
    // const term = queryParams.get("user")
    // console.log(term) //pizza
    useEffect(() => {
        if (thumbsDown + thumbsUp > 0) {
            fetch(`${parentUrl}/api/participant/?thumbsUp=${thumbsUp}&thumbsDown=${thumbsDown}&user=${guid}&session=${session}`,
                {method: "GET"}).then(x => x.json())
                .then(({serverThumbsUp, serverThumbsDown}) => {
                    setOverallThumbsDown(serverThumbsDown);
                    setOverallThumbsUp(serverThumbsUp);
                })
        }
    }, [thumbsUp, thumbsDown])

    const onRefreshClickHandler = () => {

        fetch(`${parentUrl}/api/participant/?thumbsUp=${0}&thumbsDown=${0}&user=${guid}&session=${session}`,
            {method: "GET"}).then(x => x.json())
            .then(({serverThumbsUp, serverThumbsDown}) => {
                setOverallThumbsDown(serverThumbsDown);
                setOverallThumbsUp(serverThumbsUp);
            })
    }
    const onAdminResetClickHandler = () => {
        fetch(`${parentUrl}/api/admin/?user=${guid}&reset=true&session=${session}`,
            {method: "GET"}).then(x => x.text())
            .then(() => {
                setThumbsUp(0);
                setThumbsDown(0);
                onRefreshClickHandler();
            })
    }

    return (
        <>
            <h1>Sprint Retro Thumbs Up Or Down</h1>
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
            </div>
            <div className="card">
                <button onClick={onRefreshClickHandler}>Refresh Score</button>
                <div>
                    Overall Thumbs Up +{overallThumbsUp}
                </div>
                <div>
                    Overall Thumbs Down +{overallThumbsDown}
                </div>
                <button onClick={onAdminResetClickHandler}>Reset Score</button>
            </div>
        </>
    )
}

export default App
