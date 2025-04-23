const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ''
    },
    backgroundColor: {
        type: String,
        required: true
    },
    members: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: "Group"
});

mongoose.model("Group", GroupSchema);