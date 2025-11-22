import React from 'react';

import assets from '../assets/assets';
import { AuthContext } from '../../context/authContext';

function LoginPage() {
    const [currState, setCurrState] = React.useState('signup');
    const [fullName, setFullName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [bio, setBio] = React.useState('');
    const [isDataSubmitted, setIsDataSubmitted] = React.useState(false);

    const { login } = React.useContext(AuthContext);

    const handleSubmit = (e) => {
        e.preventDefault();

        if(currState === 'signup' && !isDataSubmitted) {
            setIsDataSubmitted(true);
            return;
        }

        login(currState === 'signup' ? 'signup' : 'login', { fullName, email, password, bio });
    }

    return (
        <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:f;ex-col backdrop-blur-2xl'>
            <img src={assets.logo_big} alt='' className='w-[min(30vw, 250px)]'/>
            <form onSubmit={handleSubmit} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
                <h2 className='font-medium text-2xl flex justify-between items-center'>
                    {currState}
                    {isDataSubmitted && <img onClick={() => setIsDataSubmitted(false)} src={assets.arrow_icon} alt='' className='w-5 cursor-pointer'/>}
                </h2>

                {currState === 'signup' && !isDataSubmitted && (
                    <input type='text' placeholder='Full Name' required className='p-2 border border-gray-500 rounded-md focus:outline-none' onChange={(e) => setFullName(e.target.value)} value={fullName}/>
                )}

                {!isDataSubmitted && (
                    <>
                        <input type='email' placeholder='Email Address' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500' onChange={(e) => setEmail(e.target.value)} value={email}/>
                        <input type='password' placeholder='Password' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500' onChange={(e) => setPassword(e.target.value)} value={password}/>
                    </>
                )}

                {
                    currState === 'signup' && isDataSubmitted && (
                        <textarea rows={4} onChange={(e) => setBio(e.target.value)} value={bio} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500' placeholder='Provide a short bio...' required></textarea>
                    )
                }

                <button type='submit' className='py-3 bg-linear-to-r from-gray-400 to-white text-black rounded-md cursor-pointer'>{currState === 'signup' ? 'Create Account' : 'Login Now'}</button>

                <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <input type='checkbox'/>
                    <p>Agree to terms of use & privacy policy</p> 
                </div>

                <div className='flex flex-col gap-2'>
                    {currState === 'signup' ? (
                        <p className='text-sm text-gray-600'>Already have an account? <span onClick={() =>{setCurrState('login'); setIsDataSubmitted(false)}} className='font-medium text-white cursor-pointer'>Login here</span></p>
                    ) : (
                        <p className='text-sm text-gray-600'>Create an Account <span onClick={() => setCurrState('signup')} className='font-medium text-white cursor-pointer'>Click here</span></p>
                    )}
                </div>
            </form>
        </div>
    );
}

export default LoginPage;