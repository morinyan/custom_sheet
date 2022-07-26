## #husky配置
```bash

# init husky at project
# modify project.json add script "husky install" and add dev dependencies husky
npx husky-init

# install husky dependencies
npm install

# add command line at git hook file
# For example: pre-commit
npm run lint

# push code to github
# remote user update code from github
# local run "husky install" script after update code
npm run prepare

```