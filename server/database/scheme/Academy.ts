import { Model, Document, Schema, model } from 'mongoose';
import jwt from 'jwt-simple';
import { ObjectID } from 'mongodb';
import { ILicense } from './License';

export interface IAcademyToken {
  _id: ObjectID;
  academyName: string;
}

export interface IAcademy {
  // academyName?: string;
  academyName: string;
  email: string;
  lastLoginTime?: Date;
  createdTime?: Date;
  license?: ObjectID | ILicense | string;
}

export const AcademySchema: Schema = new Schema({
  academyName: { type: String, required: true },
  email: { type: String, default: '' },
  license: { type: Schema.Types.ObjectId, ref: 'License' },
  lastLoginTime: { type: Date, default: Date.now },
  createdTime: { type: Date, default: Date.now },
});

/**
 * @description Academy 스키마에 대한 메서드 ( document )
 */
export interface IAcademySchema extends IAcademy, Document {
  /**
   * @description 이 계정에 대한 토큰을 생성합니다.
   * @returns {string} 이 계정에 대한 토큰을 반환합니다.
   */
  getAcademyToken(): string;
  /**
   * @description 계정 정보를 재설정합니다
   * @param {string}IUser 계정 정보
   * @returns {Promise<IUserSchema>} 변경된 계정를 반환합니다.
   */
  changeInfo(user: IAcademy): Promise<IAcademySchema>;
}

/**
 * @description Academy 모델에 대한 정적 메서드 ( collection )
 */
export interface IAcademyModel extends Model<IAcademySchema> {
  /**
   * @description 입력받은 계정의 토큰을 생성합니다.
   * @returns {string} 입력받은 계정에 대한 토큰
   */
  getToken(data: IAcademySchema): string;
}

AcademySchema.methods.getAcademyToken = function (
  this: IAcademySchema
): string {
  const constructor = this.constructor as IAcademyModel;
  return constructor.getToken(this);
};

AcademySchema.methods.changeInfo = async function (
  this: IAcademySchema,
  user: IAcademy
): Promise<IAcademySchema> {
  try {
    Object.keys(user).forEach((key) => {
      this[key] = user[key];
    });
    return await this.save();
  } catch (err) {
    throw err;
  }
};

AcademySchema.statics.getToken = function (
  // this: IAcademyModel,
  data: IAcademySchema
): string {
  const user: IAcademyToken = {
    _id: data._id,
    academyName: data.academyName,
  };
  return jwt.encode(user, process.env.SECRET_KEY || 'SECRET');
};

// CASCADE 구현
// UserSchema.pre(
//   'remove',
//   async function (this: IUserSchema, next: HookNextFunction) {
//     try {
//       const post = await Post.remove({ owner: this._id });
//       const comment = await Comment.remove({ owner: this._id });
//       next();
//     } catch (err) {
//       next(err);
//     }
//   }
// );

export default model<IAcademySchema>('Academy', AcademySchema) as IAcademyModel;