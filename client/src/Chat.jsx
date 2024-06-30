import { useContext, useEffect, useState, useRef, } from "react"

import Logo from "./Logo";
import { UserContext } from "./UserContext";
import uniqBy from 'lodash/uniqBy';
import axios from "axios";
import Contact from "./Contact";


export default function Chat() {


    const [ws, setWS] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [offlinePeople, setOfflinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { username, id, setId, setUsername } = useContext(UserContext);
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const divUnderMessages = useRef();

    function showOnlinePeople(peopleArray) {

        const people = {};
        peopleArray.forEach(person => {
            people[person.userId] = person.username;
        });
        setOnlinePeople(people);
    }

    function handleMessage(event) {
        const messageData = JSON.parse(event.data);
        console.log(event, messageData)
        if ('online' in messageData) {
            showOnlinePeople(messageData.online)
        } else if ('text' in messageData) {
            if (messageData.sender === selectedUserId) {
                setMessages(prev => ([...prev, { ...messageData }]));
            }

        }
    }

    function sendMessage(e, file = null) {
        if (e) e.preventDefault();
        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessage,
            file,
        }));


        if (file) {
            axios.get('/messages/' + selectedUserId).then((res) => {
                setMessages(res.data);
            });
        } else {
            setNewMessage("");
            setMessages(prev => ([...prev, {
                sender: id,
                text: newMessage,
                recipient: selectedUserId,
                _id: Date.now(),
            }]));
        }
    }
    function sendFile(e) {
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = () => {
            sendMessage(null, {
                name: e.target.files[0].name,
                data: reader.result,
            });
        }

    }

    const onlinePeopleExceptMe = { ...onlinePeople };
    delete onlinePeopleExceptMe[id];

    const messageWithoutDups = uniqBy(messages, '_id');

    function connetToWS() {
        const ws = new WebSocket('ws://localhost:4000')
        setWS(ws);
        ws.addEventListener('message', handleMessage);
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log('ws closed, trying to reconnect');
                connetToWS();
            }, 1000);
        });
    }


    function logout() {
        axios.post('/logout').then(() => {

            setWS(null);
            setUsername(null);
            setId(null);
        });

    }

    useEffect(() => {
        connetToWS();
    }, []);

    useEffect(() => {
        const div = divUnderMessages.current;
        if (div) {
            div.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }

    }, [messages]);

    useEffect(() => {
        axios.get('/people').then((res) => {
            const offlinePeopleArr = res.data
                .filter(p => p._id !== id)
                .filter(p => !Object.keys(onlinePeople).includes(p._id));
            const offlinePeople = {};
            offlinePeopleArr.forEach(p => {
                offlinePeople[p._id] = p;
            });
            setOfflinePeople(offlinePeople);
        });

    }, [onlinePeople]);

    useEffect(() => {
        if (selectedUserId) {
            axios.get('/messages/' + selectedUserId).then((res, err) => {
                if (err) {
                    console.log(err);
                } else {

                    setMessages(res.data);
                }
            })
        }

    }, [selectedUserId])

    return (
        <div className="flex h-screen">

            <div className="bg-white w-1/3 flex flex-col ">
                <div className="flex-grow">

                    <Logo />
                    {Object.keys(onlinePeopleExceptMe).map(userId => (
                        <Contact
                            key={userId}
                            id={userId}
                            online={true}
                            username={onlinePeopleExceptMe[userId]}
                            onClick={() => setSelectedUserId(userId)}
                            selected={userId === selectedUserId}
                        />
                    ))}
                    {Object.keys(offlinePeople).map(userId => (
                        <Contact
                            key={userId}
                            id={userId}
                            online={false}
                            username={offlinePeople[userId].username}
                            onClick={() => { setSelectedUserId(userId) }}
                            selected={userId === selectedUserId}
                        />
                    ))}
                </div>
                <div className="px-2 py-6 text-center flex items-center justify-center">
                    <span className="mr-2 text-gray-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                        </svg>
                        {username}</span>
                    <button
                        onClick={logout}
                        className=" py-2 px-4 text-gray-500 bg-blue-200 border rounded-sm">
                        Logout
                    </button>
                </div>
            </div>
            <div className="flex flex-col bg-blue-50 w-2/3 p-2 ">
                <div className="flex-grow ">
                    {!selectedUserId &&
                        (<div className="flex h-full flex-grow items-center justify-center ">
                            <div className="text-gray-400 text-5xl"> No Chat Selected</div>
                        </div>)}
                    {!!selectedUserId && (
                        <div className=" h-full relative ">
                            <div className=" absolute inset-0 overflow-y-scroll my-4 ">
                                {messageWithoutDups.map(message => (
                                    <div key={message._id} className={message.sender === id ? "text-right" : "text-left"} >
                                        <div className={" inline-block text-left p-4 m-2 rounded-3xl text-xl " + (message.sender === id ? "bg-blue-500 text-white" : " bg-white text-gray-600")}>
                                            {message.text}
                                            {message.file && (
                                                <div>
                                                    <a target="_blank" className="underline" href={axios.defaults.baseURL + "/uploads/" + message.file}>
                                                        {message.file}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={divUnderMessages}></div>
                            </div>
                        </div>
                    )}
                </div>
                {!!selectedUserId && (
                    <form className="flex  gap-2" onSubmit={sendMessage}>
                        <input type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message here"
                            className="bg-white border p-2 flex-grow rounded-sm"
                        />

                        <label type="button" className="bg-blue-200 p-2 text-gray-600 border cursor-pointer border-blue-200 rounded-sm">
                            <input type="file" className="hidden" onChange={sendFile} />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                            </svg>
                        </label>
                        <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>

                        </button>
                    </form>
                )}
            </div>

        </div>
    )


}