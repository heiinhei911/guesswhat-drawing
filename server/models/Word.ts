import { Schema, model, Document } from "mongoose";

interface WordInterface extends Document {
  word: string;
  category: string;
}

const WordSchema: Schema = new Schema({
  word: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
});

const Word = model<WordInterface>("word", WordSchema);

export default Word;
