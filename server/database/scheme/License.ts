import { Model, Document, Schema, model } from 'mongoose';

export interface ILicense {
  licenseKey: string;
  nickname: string;
  expireTime: Date;
  lastUsedTime?: Date;
  createdTime?: Date;
}

export const LicenseSchema: Schema = new Schema({
  licenseKey: { type: String, required: true },
  nickname: { type: String, default: 'Random key' },
  expireTime: { type: String, default: new Date(2099, 1) },
  lastUsedTime: { type: Date, default: Date.now },
  createdTime: { type: Date, default: Date.now },
});


/**
 * @description License 스키마에 대한 메서드 ( document )
 */
export interface ILicenseSchema extends ILicense, Document {
  /**
   * @description 라이선스가 사용된 시점을 지금으로로 재설정합니다
   * @returns {Promise<IUserSchema>} 변경된 라이선스를 반환합니다.
   */
  updateUsedTime(): Promise<ILicenseSchema>;
  /**
   * @description 라이선스 만료 확인
   * @returns {boolean} 라이선스가 만료되면 true 아니면 false
   */
  isExpired(): boolean;
}

/**
 * @description License 모델에 대한 정적 메서드 ( collection )
 */
export interface ILicenseModel extends Model<ILicenseSchema> {}

LicenseSchema.methods.isExpired = function (this: ILicenseSchema): boolean {
  return this.expireTime < new Date(Date.now());
};

LicenseSchema.methods.updateUsedTime = async function (
  this: ILicenseSchema
): Promise<ILicenseSchema> {
  this.lastUsedTime = new Date(Date.now());
  return await this.save();
};

export default model<ILicenseSchema>('License', LicenseSchema) as ILicenseModel;