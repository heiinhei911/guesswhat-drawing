import express, { Request, Response } from "express";
import Word from "../models/Word";
const router = express.Router();

// @route GET api/words
// @description Get all words
// @access Public
router.get("/", (req: Request, res: Response) => {
  Word.find()
    .then((words) => res.json(words))
    .catch((err: unknown) =>
      res.status(404).json({ nowordsfound: "No Words found" })
    );
});

// @route GET api/words/one
// @description Get one random word
// @access Public
// router.get("/one", (req, res) => {
//   Word.aggregate([{ $sample: { size: 1 } }])
//     .then((word) => res.json(word))
//     .catch((err) =>
//       res.status(404).json({ nowordsfound: "Could not get one random word" })
//     );
// });

// @route GET api/words/test
// @description tests words route
// @access Public
router.get("/test", (req: Request, res: Response) => res.send("Testing"));

export default router;
