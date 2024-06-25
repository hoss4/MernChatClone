import { useContext, useState } from "react";
import axios from 'axios';
import { UserContext } from "./UserContext";

export default function RegisterAndLoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('register');
    const { setId, setUsername: setLoggedInUsername } = useContext(UserContext)

    async function handleSubmit(e) {
        e.preventDefault();
          const url = isLoginOrRegister === 'register' ? 'register' : 'login';
        const { data } = await axios.post(url, { username, password });
        setLoggedInUsername(username);
        setId(data.id);
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center  ">
            <form className="w-64 mx-auto mb-12" >
                <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    type="text"
                    placeholder="Username"
                    className="block w-full rounded-sm p-4 mb-2 border text-center"></input>
                <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    type="password"
                    placeholder="Password"
                    className="block  w-full rounded-sm p-4 mb-2 border text-center"></input>
                <button onClick={handleSubmit} className="bg-blue-500 text-white block w-full rounded-sm p-2">
                     {isLoginOrRegister === 'register' ? 'Register' : 'Login In'}
                     </button>

                <div className="text-center mt-2">
                    {isLoginOrRegister === 'register' && (
                        <div>
                            Already a member ? <button onClick={(e) => {
                                e.preventDefault();
                                setIsLoginOrRegister('login')
                            }}>Login In </button>
                        </div>
                    )}

                    {isLoginOrRegister === 'login' && (
                        <div>
                            Don't have an account ? <button onClick={(e) => {
                                e.preventDefault();
                                setIsLoginOrRegister('register')
                            }}>Register </button>
                        </div>
                    )}

                </div>
            </form>

        </div>
    );
}