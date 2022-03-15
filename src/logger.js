const chalk = require("chalk");

const log = console.log;

export const h1 = (txt) => log(chalk.black.bgMagenta(txt))
export const h2 = (txt) => log(chalk.blue.bold(txt));
export const h3 = (txt) => log(chalk.blue);