# Entail App CIC Backend

This repository contains all the code related to the Entail App backend.

### How to contribute
1. Install pnpm and rush globally:
```bash
$ npm i -g pnpm
$ pnpm i -g @microsoft/rush
```

2. Clone the repository and run `rush install && rush build` inside of it
3. Write your code!

### Things to note
1. You MUST NOT install a package with `pnpm i <package name>`
2. You MUST either:
   - Install the package using `rush add [--dev] -p <package name>` inside of the specific folder
   OR
   - Add the package manually to the package.json file and run `rush update`
3. You SHOULD use `rushx` to run package.json scripts inside each respective folder
4. You MAY use flags found [here](https://rushjs.io/pages/developer/selecting_subsets/) in combination with commands to select subsets of dependencies
5. Easy commands for specific things like running watchers etc will be placed in [this file](common/config/rush/command-line.json)
