import Word from "../models/Word";
import expressAsyncHandler from "express-async-handler";

const getWords = expressAsyncHandler(async (req, res) => {
  const words = await Word.find({});

  if (words) {
    res.json(words);
  } else {
    res.status(404).json({ message: "Words not found" });
    res.status(404);
    throw new Error("Words not found");
  }
});

const getOneWord = expressAsyncHandler(async (req, res) => {
  const word = await Word.aggregate([{ $sample: { size: 1 } }]);
  if (word) {
    res.json(word);
  } else {
    res.status(404).json({ message: "word not found" });
    res.status(404);
    throw new Error("word not found");
  }
});

export { getWords, getOneWord };
