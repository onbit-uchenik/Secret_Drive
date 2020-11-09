import * as shell from "shelljs";

shell.config.silent = false;

shell.cp("-R", "src/public/", "dist/public/");
shell.cp(".env", "dist/.env");
shell.cp("addon.node.d.ts", "build/Release/addon.node.d.ts");
