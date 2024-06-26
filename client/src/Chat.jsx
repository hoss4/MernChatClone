import { useContext, useEffect, useState, useRef,} from "react"
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";
import uniqBy from 'lodash/uniqBy';
import axios from "axios";


export default function Chat() {


    const [ws, setWS] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { username, id } = useContext(UserContext);
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
            setMessages(prev => ([...prev, { ...messageData }]));
        }
    }

    function sendMessage(e) {
        e.preventDefault();
        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessage,
        }
        ))

        setNewMessage("");
        setMessages(prev => ([...prev, {
            sender: id,
            text: newMessage,
            recipient: selectedUserId,
            _id: Date.now(),
        }]));

    }
    const onlinePeopleExceptMe = { ...onlinePeople };
    delete onlinePeopleExceptMe[id];

    const messageWithoutDups = uniqBy(messages, '_id');

   function connetToWS(){
    const ws = new WebSocket('ws://localhost:4000')
    setWS(ws);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('close',()=>{       
        setTimeout(()=>{
            console.log('ws closed, trying to reconnect');
            connetToWS();
        }, 1000);
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

    useEffect(()=>{
        if(selectedUserId){
            axios.get('/messages/'+selectedUserId).then((res,err)=>{
                if(err){
                    console.log(err);
                }else{
                    
                    setMessages(res.data);
                }
            })
        }

    },[selectedUserId])

    return (
        <div className="flex h-screen">

            <div className="bg-white w-1/3 ">
                <Logo />

                {Object.keys(onlinePeopleExceptMe).map(userId => (
                    <div key={userId} onClick={() => setSelectedUserId(userId)}
                        className={"border-b border-gray-100 flex items-center gap-2 cursor-pointer " + (userId === selectedUserId ? "bg-blue-100" : "")}  >

                        {userId === selectedUserId && (<div className="w-1  bg-blue-500 h-16 rounded-r-md">
                        </div>)}
                        <div className="flex items-center gap-2  py-4 pl-6">
                            <Avatar username={onlinePeople[userId]} userId={userId} />
                            <span>
                                {onlinePeople[userId]}
                            </span>
                        </div>
                    </div>
                ))
                }
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