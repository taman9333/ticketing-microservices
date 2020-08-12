import mongoose from 'mongoose';

// to make use of typescript with mongoose as using mongoose new doesn't check on attributes of model
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes methods that a User model has
interface UserModel extends mongoose.Model<any> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties that a single User has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
