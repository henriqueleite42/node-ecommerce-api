import { S3Manager } from "../s3-manager";

export class S3Provider<U> extends S3Manager<U> {
	public getHandler(dirName: string, fileName: string) {
		return {
			handler: this.getHandlerPath(dirName, fileName),
		};
	}
}
