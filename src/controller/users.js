import { configDotenv } from "dotenv";
import joi from "joi";
import JWT from "jsonwebtoken";
import _ from "lodash";
import bcrypt from "bcrypt";
import User from "../model/users.js";

export default class UserController {
    static async getAllUser(req, res) {
        res.status(200).json({ message: "test shode" });
    }

    static async register(req, res) {
        const { name, phone, role } = req.body;
        const schema = joi.object({
            phone: joi.string().required(),
            password: joi.string().min(6).required()
        });

        const { error } = schema.validate(req.body,  { allowUnknown: true });
        if (error) {
            return res.status(400).json({ message: "اطلاعات نامعتبر است." })
        }

        try {
            const exist = await User.findOne({ phone: req.body.phone })
            if (exist) {
                return res.status(400).json({ message: "این شماره تلفن قبلا ثبت شده است." })
            }

            const hashPassword = await bcrypt.hash(req.body.password, 10);
            const newuser = await User.create({
                role: role,
                name: name,
                phone: phone,
                passwordHash: hashPassword
            });

            const token = JWT.sign({
                id: newuser._id, role: newuser.role
            }, process.env.JWT_SECRET);

            return res
            .header("Authorization", `Bearer ${token}`)
            .status(201)
            .json({
                message: "ثبت نام با موفقیت انجام شد.",
                token,
                data: _.pick(newuser, ["phone", "name"])
            })
        } catch (e) {
            return res.status(500).json({ message: "ثبت نام انجام نشد خطا در سرور." })
        }
    }
}