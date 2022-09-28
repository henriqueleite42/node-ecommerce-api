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

	public static int(value: string) {
		return parseInt(value, 10);
	}

	public static float(value: string) {
		return parseFloat(value);
	}
}
