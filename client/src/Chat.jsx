import { useContext, useEffect, useState } from "react"
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";

export default function Chat() {


    const [ws, setWS] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { username, id } = useContext(UserContext);


    function showOnlinePeople(peopleArray) {

        const people = {};
        peopleArray.forEach(person => {
            people[person.userId] = person.username;
        });
        setOnlinePeople(people);
    }

    function handleMessage(event) {
        const messageData = JSON.parse(event.data);
        if ('online' in messageData) {
            showOnlinePeople(messageData.online)
        }
    }


    const onlinePeopleExceptMe = { ...onlinePeople };
    delete onlinePeopleExceptMe[id];

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:4000')
        setWS(ws);
        ws.addEventListener('message', handleMessage)
    }, []);

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
                   {
                          selectedUserId && (
                            <div className="bg-green-200 flex h-full flex-grow items-center justify-center rounded-lg">
                                 Chat with 
                            </div>
                          )
                   }
                </div>
                <div className="flex  gap-2">
                    <input type="text"
                        placeholder="Type your message here"
                        className="bg-white border p-2 flex-grow rounded-sm"
                    />
                    <button className="bg-blue-500 p-2 text-white rounded-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>

                    </button>
                </div>
            </div>

        </div>
    )


}