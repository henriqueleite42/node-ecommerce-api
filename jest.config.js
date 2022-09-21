module.exports = {
	moduleFileExtensions: ["js", "json", "ts"],
	rootDir: "src",
	testRegex: ".*\\.spec\\.ts$",
	transform: {
		"^.+\\.(t|j)s$": "ts-jest",
	},
	collectCoverageFrom: [
		"./api/**/service.ts",
		"./api/**/helpers/**/*.ts",
		"!./api/upload/extract-image-colors/helpers/get-img-colors.ts"
	],
	setupFiles: ["./tests/setup.ts"],
	coverageDirectory: "../coverage",
	testEnvironment: "node",
	moduleDirectories: ["node_modules", "src"],
	resetMocks: true,
	coverageThreshold: {
	 	global: {
	 		statements: 0,
	 		branches: 0,
	 		functions: 0,
	 		lines: 0,
	 	},
	},
};
