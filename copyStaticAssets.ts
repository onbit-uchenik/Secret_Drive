import * as shell from "shelljs";

shell.config.silent = false;

shell.cp("-R", "src/public/", "dist/public/");
shell.cp("-R", "src/views/", "dist/views/");
shell.cp(".env", "dist/.env");
