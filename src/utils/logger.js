//src/utils/logger.js
import chalk from "chalk";

class Logger {
    log(type, message, err = null) {
        const timestamp = new Date().toISOString();
        const formatted = `[${type}] ${timestamp} - ${message}`;

        switch (type) {
            case "INFO":
                console.log(chalk.blue(formatted));
                break;
            case "WARN":
                console.log(chalk.yellow(formatted));
                break;
            case "ERROR":
                console.log(chalk.red(formatted));
                if (err) console.error(err);
                break;
            default:
                console.log(formatted);
        }
    }

    info(message) {
        this.log("INFO", message);
    }

    warn(message) {
        this.log("WARN", message);
    }

    error(message, err = null) {
        this.log("ERROR", message, err);
    }
}

export default new Logger();
