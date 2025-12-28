import cloudinary from '../database/cloudinary.js';
import User from '../models/user.js';

const userSignup = async (req, res) => {
    try {
        const { fullName, email, password, bio } = req.body;

        if(!fullName || !email || !password || !bio) {
            return res.status(400).json({ message: 'Missing details' });
        }

        const user = await User.findOne({ email });

        if(user) {
            res.status(400).json({ message: 'A user with this email already exists' });
        }

        const newUser = await User.create({ fullName, email, password, bio });

        const token = newUser.createJWT();

        res.status(200).json({ success: true, userData: newUser, token, message: 'Account created succesfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
}

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if(!user) {
            return res.status(400).json({ success: false, message: 'No user found' });
        }

        const isPasswordCorrect = await user.comparePassword(password);

        if(!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: 'Invalid credentials could not login' });
        }

        const respUser = user.toObject();
        delete respUser.password;

        const token = await user.createJWT();

        res.status(200).json({ success: true, userData: respUser, token, message: 'Login in successfull' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message })
    }
}

const checkAuth = async (req, res) => {
    try {
        res.status(200).json({ success: true, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(401).json({ success: false, message: 'Sorry you must login first' });
    }
}

const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;

        const userId = req.user._id;
        let updatedUser;

        if(!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true });
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName }, { new: true });
        }

        res.status(200).json({ success: true, user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
}

export { userSignup, userLogin, checkAuth, updateProfile }