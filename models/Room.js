import mongoose from "mongoose";

const ParticipantSchema = new mongoose.Schema({
  name: String,
  email: String,
  friend: String
}, { _id: false });

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roomPassword: { type: String, required: true },
  adminPassword: { type: String, required: true },
  participants: { type: [ParticipantSchema], default: [] },
  drawn: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Room", RoomSchema);
