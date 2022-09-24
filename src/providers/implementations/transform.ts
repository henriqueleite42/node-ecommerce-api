export class Transform {
	public static default(v: any) {
		return (value?: any) => {
			if (typeof value === "undefined") {
				return v;
			}

			return value;
		};
	}

	public static lowercase(value: string) {
		return value.toLowerCase();
	}

	public static trim(value: string) {
		return value.trim();
	}
}
