import Module from 'module';
import promptSync from 'prompt-sync';
const prompt = promptSync({ sigint: true });

export interface ArgProperty {
	name: string;
	validator: (value: string) => boolean;
	errorMessage: string;
}

// A function that allows to create a main function that can be called from the command line
// If their is not enough arguments, the user is asked for them
export function createInteractiveMain(mainModuel: Module, argsProperties: ArgProperty[], mainCallback: (...args: string[]) => any) {

	if (require.main === mainModuel) {
		// Main script (called with ts-node ...)

		let indexArgs = 2;

		const args: string[] = [];
		const next: string[] = process.argv.slice(indexArgs);

		for (const argProperty of argsProperties) {
			const value = process.argv[indexArgs] ? process.argv[indexArgs++] : prompt(`${argProperty.name}: `);
			if (!value) {
				console.error(`Missing parameter ${argProperty.name}`);
				process.exit(1);
			}
			if (!argProperty.validator(value)) {
				console.error(argProperty.errorMessage);
				process.exit(1);
			}
			args.push(value);
			next.shift();
		}

		mainCallback(...args, ...next);
	}
	else {
		// Import from another file
		mainModuel.exports = (...args: string[]) => {

			for (let i = 0; i < argsProperties.length; i++) {
				if (!args[i]) {
					console.error(`Missing parameter ${argsProperties[i].name}`);
					process.exit(1);
				}
				if (!argsProperties[i].validator(args[i])) {
					console.error(argsProperties[i].errorMessage);
					process.exit(1);
				}
			}

			mainCallback(...args);
		};
	}
}
