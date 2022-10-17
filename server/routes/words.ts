import express, { Request, Response } from "express";
import { getWords, getOneWord } from "../controllers/wordController";
const router = express.Router();

// @route GET api/words
// @description Get all words
// @access Public
router.route("/").get(getWords);

// @route GET api/words/one
// @description Get one random word
// @access Public
router.route("/one").get(getOneWord);

// @route GET api/words/test
// @description tests words route
// @access Public
router.get("/test", (req: Request, res: Response) => res.send("Testing"));

export default router;
