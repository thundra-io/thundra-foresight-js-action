# thundra-foresight-js-action

A GitHub Action to instrument your Javascript test runs.

## Usage

Information about available parameters is listed [below](#parameters). **Make sure to check out the [Known Issues](#known-issues)**.

The required parameters are the Thundra API Key and the Thundra Project ID, which can be obtained from [foresight.thundra.io](https://foresight.thundra.io/).

You can learn more about Thundra at [thundra.io](https://thundra.io)

Once you get the Thundra API Key, make sure to set it as a secret. A sample Github Action workflow would look like this:

### Running the Command With Thundra

It is possible to run test commands by giving them to the Thundra stage like below.

```yaml
# ...

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
        # Specify your npm / yarn install step
      - name: Set up Node 12
        uses: actions/setup-node@v2
        with:
          node-version: '12'
      - run: npm install
      
      - name: Thundra Foresight JS Instrumentation
        uses: thundra-io/thundra-foresight-js-action@v1
        with:
          apikey: ${{ secrets.THUNDRA_APIKEY }}
          project_id: ${{ secrets.THUNDRA_PROJECT_ID }}
          
          # Modify or remove the command
          # Default is "npm test" 
          # Modify accoding to you test script.
          # ex: yarn run test:integration || npm run test:e2e
          command: npm run test:all
```

### Running the Command Separately

If you plan to run your tests manually, you must use `THUNDRA_JEST_ARGUMENT` environment variable for activating Thundra.

```yaml
# ...

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
        # Specify your npm / yarn install step
      - name: Set up Node 12
        uses: actions/setup-node@v2
        with:
          node-version: '12'
      - run: npm install
      
      - name: Thundra Foresight JS Instrumentation
        uses: thundra-io/thundra-foresight-js-action@v1
        with:
          apikey: ${{ secrets.THUNDRA_APIKEY }}
          project_id: ${{ secrets.THUNDRA_PROJECT_ID }}
        
      - name: Test Run
        run: npm run test -- ${THUNDRA_JEST_ARGUMENTS}
```

## Known Issues

### Using It with Build Matrix

If you are using a build matrix in your workflow, each run in your build matrix will show up like it's a different testrun on Thundra Foresight where in fact they belong to the same build.

With the current GitHub Action context, it's not possible to understand that those runs belogs to the same run. So, the obvious solution is to set a unique testrun ID for these runs before the matrix starts.

To solve this problem and other issues if we need to, we've written the [Thundra Test Init Action](https://github.com/thundra-io/thundra-test-init-action).

Make sure to follow the instruction in the repository.

## Parameters

| Name                      | Requirement       | Default                  | Description
| ---                       | ---               | ---                      | ---
| apikey                    | Required          | ---                      | Thundra API Key
| project_id                | Required          | ---                      | Your project id from Thundra. Will be used to filter and classify your testruns.
| framework                 | Optional          | jest                     | Test framework type. Currently only jest framework is allowed.
| environment               | Optional          | ---                      | You can specify Jest test environment using with jsdom or node values. For jest which is >= 27.0.0, default test environment is node. For this reason, Thundra will set its test environment to jest-environment-node. For jest which is < 27.0.0, default test environment is jsdom.  For this reason, Thundra will set its test environment to jest-environment-jsdom.
| command                   | Required          | ---                      | The Npm / Yarn command you want to run. 
| append_thundra_arguments  | Required          | true                     | If value is true, Thundra will try to append required argument to your command. If value is false, environment variable `THUNDRA_JEST_ARGUMENTS` must be passed to script as argument manually.
| agent_version             | Required          | ---                      | A specific version Thundra Node Agent you want to use should be defined here. If this value is not specified latest version of Thundra Node Agent will be use.