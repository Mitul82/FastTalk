import React from 'react';
import { useNavigate } from 'react-router-dom';

import assets from '../assets/assets.js';
import { AuthContext } from '../../context/authContext.jsx';

function ProfilePage() {
    const { authUser, updateProfile } = React.useContext(AuthContext);

    const [selectedImg, setSelectedImg] = React.useState(null);
    const [name, setName] = React.useState(authUser?.fullName || '');
    const [bio, setBio] = React.useState(authUser?.bio || '');

    const navigate = useNavigate();
    console.log(authUser);
    const handleSubmit = async (e) => {
        try {
            e.preventDefault();

            if(!selectedImg) {
                await updateProfile({ fullName: name, bio });
                navigate('/');
                return;
            }

            const reader = new FileReader();

            reader.readAsDataURL(selectedImg);

            reader.onload = async () => {
                const base64Img = reader.result;
                await updateProfile({ profilePic: base64Img, fullName: name, bio });
                navigate('/');
                return;
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
            <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
                <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
                    <h3 className='text-lg'>Profile Details</h3>
                    <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
                        <input onChange={(e) => setSelectedImg(e.target.files[0])} type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden/>
                        <img src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon} alt="" className={`w-12 h-12 ${selectedImg  && 'rounded-full'}`}/>
                        upload profile image
                    </label>
                    <input type='text' required placeholder='Your name' onChange={(e) => setName(e.target.value)} value={name} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500'/>
                    <textarea onChange={(e) => setBio(e.target.value)} value={bio} required placeholder='Write profile bio' rows={4} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500'></textarea>
                    <button type='submit' className='bg-linear-to-r from-white to-gray-500 text-white p-2 rounded-full text-lg cursor-pointer'>
                        Save
                    </button>
                </form>
                <img src={authUser?.profilePic || assets.logo_icon} alt='' className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10  ${selectedImg  && 'rounded-full'}`}/>
            </div>
        </div>
    );
}

export default ProfilePage;