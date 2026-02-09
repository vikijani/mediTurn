import { configDotenv } from "dotenv";
import joi from "joi";
import JWT from "jsonwebtoken";
import _ from "lodash";
import bcrypt from "bcrypt";
import Users from "../model/users.js";
configDotenv();

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

        const { error } = schema.validate(req.body, { allowUnknown: true });
        if (error) {
            return res.status(400).json({ message: "اطلاعات نامعتبر است." })
        }

        try {
            const exist = await Users.findOne({ phone: req.body.phone })
            if (exist) {
                return res.status(400).json({ message: "این شماره تلفن قبلا ثبت شده است." })
            }

            const hashPassword = await bcrypt.hash(req.body.password, 10);
            const newuser = await Users.create({
                role: role,
                name: name,
                phone: phone,
                passwordHash: hashPassword
            });

            const token = JWT.sign({
                id: newuser._id, role: newuser.role
            }, process.env.JWT_SECRET);

            res.cookie("token", token, {
                httpOnly: true,
                sameSite: "lax"
            });

            return res.redirect("/appointments/view");

        } catch (e) {
            console.log("REGISTER ERROR:", e);
            return res.status(500).json({ message: "ثبت نام انجام نشد خطا در سرور." })
        }
    }

    static async login(req, res) {
        const schema = joi.object({
            phone: joi.string().required(),
            password: joi.string().min(6).required()
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        try {
            const user = await Users.findOne({ phone: req.body.phone });
            if (!user) {
                return res.status(400).json({ error: "شماره تماس یا رمز عبور اشتباه است." });
            }

            const isValid = await bcrypt.compare(
                req.body.password,
                user.passwordHash
            );
            if (!isValid) {
                return res.status(400).json({ error: "شماره تماس یا رمز عبور اشتباه است." });
            }

            const token = JWT.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET
            );

            res.cookie("token", token, {
                httpOnly: true,
                sameSite: "lax"
            });

            return res.redirect("/appointments/view");

        } catch (err) {
            console.error("Login error:", err);
            return res.status(500).json({ message: "خطا در ورود کاربر." });
        }
    }
}