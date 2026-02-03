import { configDotenv } from "dotenv";
import joy from "joy";
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
        const schema = joy.object({
            phone: joy.string().required(),
            password: joy.string().min(6).required()
        });

        const { error } = schema.validate(req.body, { allowUnknown: true });
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

    static async login(req, res) {
        const schema = joy.object({
            email: joy.string().email().required(),
            password: joy.string().min(8).required()
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        try {
            const user = await User.findOne({ phone: req.body.phone, isActive: true });
            if (!user) {
                return res.status(400).json({ error: "شماره تماس یا رمز عبور اشتباه است." });
            }

            const isValid = await bcrypt.compare(req.body.password, user.password);
            if (!isValid) {
                return res.status(400).json({ error: "شماره تماس یا رمز عبور اشتباه است." });
            }

            const token = JWT.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET
            );

            return res.json({
                message: "ورود با موفقیت انجام شد.",
                token,
                data: _.pick(user, ["userId", "email", "name", "phone", "createdAt"])
            });
        } catch (err) {
            console.error("Login error:", err);
            return res.status(500).json({message: "خطا در ورود کاربر."});
        }
    }
}