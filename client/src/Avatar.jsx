

export default function Avatar({ userId ,username,online }) {

    const colors = ["bg-red-200", "bg-blue-200", "bg-green-200", "bg-yellow-200", "bg-purple-200", "bg-pink-200"];
    const userIdbase10 = parseInt(userId, 16);
    const color = colors[userIdbase10 % colors.length];
    return(
        <div className={"w-8 h-8 bg-red-200 relative rounded-full flex items-center "+color}>
         <div className="text-center w-full opacity-70"> {username[0]}</div>
         {online && ( <div className="absolute w-3 h-3 rounded-full bg-green-400 right-0 bottom-0 border border-white"> </div>)}
         {!online && ( <div className="absolute w-3 h-3 rounded-full bg-gray-400 right-0 bottom-0 border border-white"> </div>)}
        </div>
    );
}