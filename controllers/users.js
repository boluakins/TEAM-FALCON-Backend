const User = require("./../models/users.model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const response = require("./../utils/response");
const CustomError = require("./../utils/CustomError");
const jwtSecret = process.env.JWT_SECRET;
// const validate = require("./../utils/validate");

/**
 * Controllers for :
 *
 * signup
 */

class UserContoller {

    // user signup
    async signUp(req, res) {
        const { fullName, email, password } = req.body;
        // validate user
        if (!fullName || !email || !password) throw new CustomError('Please fill in the required field')
        // Check user email exist 
        if (await User.findOne({ email })) throw new CustomError("Email already exists");

        let user = new User(req.body)

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(user.password, salt)
        user.password = hash;

        user.save(user)

        const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: 36000 })

        const data = {
            token,
            uid: user.id,
            fullName: user.fullName,
            email: user.email,
        }

        res.status(201).json(response("User created", data, true, req))
    }


    async authenticate(req, res) {
        if (!req.body.email) throw new CustomError("Email is required");
        if (!req.body.password) throw new CustomError("Password is required");

        const user = await User.findOne({ email: req.body.email });
        if (!user) throw new CustomError("Incorrect email or password");
        const isCorrect = await bcrypt.compare(req.body.password, user.password)
        if (!isCorrect) throw new CustomError("Incorrect email or password");

        const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: 36000 })

        const data = {
            uid: user._id,
            email: user.email,
            role: user.role,
            token
        };

        res.status(200).json(response("User", data, true, req))
    }

    async updateConfig(req, res) {
        const user = await User.findByIdAndUpdate(
            { _id: req.user._id },
            { "$set": { config: req.body } },
            { new: true, }
        );

        if (!user) throw new CustomError("user dosen't exist", 404);

        res.status(200).send(response("All Files Found", user.config, true, req));
    }
}

module.exports = new UserContoller();
