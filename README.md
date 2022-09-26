# Maite API

## How the things work?

- The project is divided in many _domains_ (like Account, Sale, Content), and _modules_, that are groups of one or more _domains_.

## How to run the project locally?

- Install `serverless` as a global dependency:

```
yarn global add serverless
```

- In one window of the terminal, run `yarn docker:server`
- Wait for it to run
- Open a new terminal window
- Run THIS:

```
API_MODULE=<module> yarn deploy:<env>
```

- You can see all the available modules at the end of the file `serverless.ts`, there will be a function `getConfig` with a `switch` statement on it. You can use all the values on the `case`s as a `module` value.
- Envs allowed:
  - **local**: The LOCAL environment, to develop and test new features
  - **dev**: The HOMOLOGATION environment, a cloud environment to test it before it goes to production
  - **production**: Production
