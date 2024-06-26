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
        const queryParams = new URLSearchParams(window.location.search)
        const userSession = queryParams.get("session")
        if (userSession?.length !== undefined && userSession?.length > 0) {
            setSession(userSession as string)
        }
    }, [session])
    const onCreateSessionHandler = () => {
        const queryParams = new URLSearchParams(window.location.search)
        const userSession = queryParams.get("session")
        if (session === '' && (userSession?.length === undefined || userSession?.length === 0)) {
            const currentSession = uuidv4()();
            setSession(currentSession)
            navigateFunction(`/?session=${currentSession}`)
            fetch(`${parentUrl}/api/participant/?thumbsUp=${thumbsUp}&` +
                `thumbsDown=${thumbsDown}&poopEmoji=${poopEmoji}&user=${guid}&session=${session}`,
                {method: "GET"}).then(x => x.json())
                .then(({serverThumbsUp, serverThumbsDown, serverPoopEmoji}) => {
                    setOverallThumbsDown(serverThumbsDown);
                    setOverallThumbsUp(serverThumbsUp);
                    setOverallPoopEmoji(serverPoopEmoji);
                })
        }
    }
    // const queryParams = new URLSearchParams(window.location.search)
    // const term = queryParams.get("user")
    // console.log(term) //pizza
    const onVoteHandler = (event: { poopEmojiParam: number; thumbsUpParam: number; thumbsDownParam: number }) => {
        if (thumbsDown + thumbsUp + poopEmoji === 0) {
            fetch(`${parentUrl}/api/participant/?thumbsUp=${event.thumbsUpParam}&` +
                `thumbsDown=${event.thumbsDownParam}&poopEmoji=${event.poopEmojiParam}&user=${guid}&session=${session}`,
                {method: "GET"}).then(x => x.json())
                .then(({serverThumbsUp, serverThumbsDown, serverPoopEmoji}) => {
                    setOverallThumbsUp(serverThumbsUp);
                    setOverallThumbsDown(serverThumbsDown);
                    setOverallPoopEmoji(serverPoopEmoji);
                })
        }
    }

    const onRefreshClickHandler = () => {
        fetch(`${parentUrl}/api/participant/?thumbsUp=${0}&thumbsDown=${0}&user=${guid}&session=${session}`,
            {method: "GET"}).then(x => x.json())
            .then(({serverThumbsUp, serverThumbsDown, serverPoopEmoji}) => {
                setOverallThumbsDown(serverThumbsDown);
                setOverallThumbsUp(serverThumbsUp);
                setOverallPoopEmoji(serverPoopEmoji);
                // bug here, what if you reset and then someone else votes
                if (serverPoopEmoji + serverThumbsDown + serverThumbsUp === 0) {
                    setThumbsDown(0);
                    setThumbsUp(0);
                    setPoopEmoji(0);
                }
            })
    }
    const onAdminResetClickHandler = () => {
        fetch(`${parentUrl}/api/admin/?user=${guid}&reset=true&session=${session}`,
            {method: "GET"}).then(x => x.json())
            .then(({serverThumbsUp, serverThumbsDown, serverPoopEmoji}) => {
                if (serverPoopEmoji + serverThumbsDown + serverThumbsUp === 0) {
                    setThumbsDown(0);
                    setThumbsUp(0);
                    setPoopEmoji(0);
                }
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
            <h1>Previous Sprint Rating Tool - For The Retro</h1>
            <div className="card">
                <div>
                    <label>Name: </label>
                    <input type={"text"} onChange={onUsernameChangeHandler}/>
                    <button onClick={onCreateSessionHandler}>Create Session</button>
                </div>
                <div>Choose Carefully! Only one push allowed!</div>
                <button onClick={() => {
                    if (poopEmoji + thumbsUp + thumbsDown === 0) {
                        setPoopEmoji(0);
                        setThumbsDown(0);
                        setThumbsUp(1);
                        onVoteHandler({ poopEmojiParam: 0, thumbsDownParam: 0, thumbsUpParam: 1 });
                    }
                }}>
                    🚀👩‍🚀👨‍🚀 +{thumbsUp}
                </button>
                <button onClick={() => {
                    if (poopEmoji + thumbsUp + thumbsDown === 0) {
                        setPoopEmoji(0);
                        setThumbsDown(1);
                        setThumbsUp(0);
                        onVoteHandler({ poopEmojiParam: 0, thumbsDownParam: 1, thumbsUpParam: 0 });
                    }
                }}>
                    😥😥😥😥 +{thumbsDown}
                </button>
                <button onClick={() => {
                    if (poopEmoji + thumbsUp + thumbsDown === 0) {
                        setPoopEmoji(1);
                        setThumbsUp(0);
                        setThumbsDown(0);
                        onVoteHandler({ poopEmojiParam: 1, thumbsDownParam: 0, thumbsUpParam: 0 });
                    }
                }}>
                    💩💩 +{poopEmoji}
                </button>
            </div>
            <div className="card">
                <button onClick={onRefreshClickHandler}>Refresh Score</button>
                <div>
                    Overall 🚀👩‍🚀👨‍🚀 +{overallThumbsUp}
                </div>
                <div>
                    Overall 😥😥😥😥 +{overallThumbsDown}
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
