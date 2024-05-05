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

const parentUrl = import.meta?.env?.VITE_HTTP_PREFIX?.length > 0
    ? import.meta.env.VITE_HTTP_PREFIX :
    '';

function App() {
    const [thumbsDown, setThumbsDown] = useState(0);
    const [thumbsUp, setThumbsUp] = useState(0);
    const [poopEmoji, setPoopEmoji] = useState(0);
    const [overallThumbsDown, setOverallThumbsDown] = useState(0);
    const [overallThumbsUp, setOverallThumbsUp] = useState(0);
    const [overallPoopEmoji, setOverallPoopEmoji] = useState(0);
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
        if (thumbsDown + thumbsUp + poopEmoji > 0) {
            fetch(`${parentUrl}/api/participant/?thumbsUp=${thumbsUp}&` +
                `thumbsDown=${thumbsDown}&poopEmoji=${poopEmoji}&user=${guid}&session=${session}`,
                {method: "GET"}).then(x => x.json())
                .then(({serverThumbsUp, serverThumbsDown, serverPoopEmoji}) => {
                    setOverallThumbsDown(serverThumbsDown);
                    setOverallThumbsUp(serverThumbsUp);
                    setOverallPoopEmoji(serverPoopEmoji);
                })
        }
    }, [thumbsUp, thumbsDown, poopEmoji])

    const onRefreshClickHandler = () => {

        fetch(`${parentUrl}/api/participant/?thumbsUp=${0}&thumbsDown=${0}&user=${guid}&session=${session}`,
            {method: "GET"}).then(x => x.json())
            .then(({serverThumbsUp, serverThumbsDown, serverPoopEmoji}) => {
                setOverallThumbsDown(serverThumbsDown);
                setOverallThumbsUp(serverThumbsUp);
                setOverallPoopEmoji(serverPoopEmoji);
            })
    }
    const onAdminResetClickHandler = () => {
        fetch(`${parentUrl}/api/admin/?user=${guid}&reset=true&session=${session}`,
            {method: "GET"}).then(x => x.text())
            .then(() => {
                setThumbsUp(0);
                setThumbsDown(0);
                setPoopEmoji(0)
                onRefreshClickHandler();
            })
    }
    const onUsernameChangeHandler = (event: unknown) => {
        const username = (event as { target: { value: string }})?.target?.value as string;
        if (username) {
            setGuid(username)
        }
    }

    return (
        <>
            <h1>Sprint Thumbs Up Or Down</h1>
            <div className="card">
                <div>
                    <label>Name: </label>
                    <input type={"text"} onChange={onUsernameChangeHandler}/>
                </div>
                <div>Choose Carefully! Only one push allowed!</div>
                <button onClick={() => {
                    if (poopEmoji + thumbsUp + thumbsDown === 0) {
                        setPoopEmoji(0);
                        setThumbsUp(1);
                        setThumbsDown(0);
                    }
                }}>
                    Thumbs Up +{thumbsUp}
                </button>
                <button onClick={() => {
                    if (poopEmoji + thumbsUp + thumbsDown === 0) {
                        setPoopEmoji(0);
                        setThumbsUp(0);
                        setThumbsDown(1);
                    }
                }}>
                    Thumbs Down +{thumbsDown}
                </button>
                <button onClick={() => {
                    if (poopEmoji + thumbsUp + thumbsDown === 0) {
                        setPoopEmoji(1);
                        setThumbsUp(0);
                        setThumbsDown(0);
                    }
                }}>
                    💩💩 +{poopEmoji}
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
                <div>
                    Overall 💩💩 +{overallPoopEmoji}
                </div>
                <button onClick={onAdminResetClickHandler}>Reset Score</button>
            </div>
        </>
    )
}

export default App
