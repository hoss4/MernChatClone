import Avatar from "./Avatar";

export default function Contact({id,username,onClick,selected,online}) {
    return (
        <div key={id} onClick={() => onClick(id)}
            className={"border-b border-gray-100 flex items-center gap-2 cursor-pointer " + (selected ? "bg-blue-100" : "")}  >

            {selected && (<div className="w-1  bg-blue-500 h-16 rounded-r-md">
            </div>)}
            <div className="flex items-center gap-2  py-4 pl-6">
                <Avatar online={online} username={username} userId={id} />
                <span>
                    {username}
                </span>
            </div>
        </div>
    );
}
