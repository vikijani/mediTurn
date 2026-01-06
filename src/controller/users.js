import { configDotenv } from "dotenv";
import User from "../model/users.js";

export default class UserController{
    static async getAllUser(req, res){
        res.status(200).json({ message: "test shode"});
    }
}